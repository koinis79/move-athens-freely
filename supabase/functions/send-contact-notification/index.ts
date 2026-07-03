import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

interface InquiryData {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  source: string;
  created_at?: string;
}

Deno.serve(async (req: Request) => {
  // CORS Preflight — must be BEFORE auth
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Auth: require INTERNAL_API_KEY ──
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token || token !== INTERNAL_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let inquiry: InquiryData;

  try {
    const body = await req.json();

    if (body.inquiry_id) {
      // Fetch from DB by ID (used when caller has the ID)
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error: fetchErr } = await supabase
        .from("contact_inquiries")
        .select("name, email, phone, subject, message, source, created_at")
        .eq("id", body.inquiry_id)
        .single();

      if (fetchErr || !data) {
        return new Response(JSON.stringify({ error: "Inquiry not found", details: fetchErr }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      inquiry = data;
    } else if (body.name && body.email && body.message && body.source) {
      // Direct payload — used when RLS prevents returning the inserted ID
      inquiry = {
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        subject: body.subject ?? null,
        message: body.message,
        source: body.source,
        created_at: new Date().toISOString(),
      };
    } else {
      throw new Error("Missing required fields: provide inquiry_id OR name+email+message+source");
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request body", details: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Build the email
  const label = inquiry.source === "b2b_inquiry" ? "B2B Partnership" : "Contact";
  const subjectStr = `📩 New [${label}] inquiry from ${inquiry.name}`;
  const phoneStr = inquiry.phone ? inquiry.phone : "Not provided";
  const dateStr = inquiry.created_at
    ? new Date(inquiry.created_at).toLocaleString("en-GB", { timeZone: "Europe/Athens" })
    : new Date().toLocaleString("en-GB", { timeZone: "Europe/Athens" });

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #00838F;">New Inquiry: ${label}</h2>
      <p><strong>Name:</strong> ${inquiry.name}</p>
      <p><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
      <p><strong>Phone:</strong> ${phoneStr}</p>
      <p><strong>Subject:</strong> ${inquiry.subject || "No subject"}</p>
      <p><strong>Date:</strong> ${dateStr} (Athens time)</p>
      
      <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px; white-space: pre-wrap;">${inquiry.message}</div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        Source: ${inquiry.source} | Movability Admin Notification
      </p>
    </div>
  `;

  // Send via Resend
  const resReq = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Movability <hello@movability.gr>",
      to: "info@koinis.gr",
      reply_to: inquiry.email,
      subject: subjectStr,
      html,
    }),
  });

  const resData = await resReq.json();

  if (!resReq.ok) {
    return new Response(JSON.stringify({ error: "Failed to send email", details: resData }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, emailId: resData.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
