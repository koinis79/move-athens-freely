import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/* ── app_errors logging ───────────────────────────────────────────────────────
 * Same block in every edge function (they are deliberately self-contained so
 * each can be pasted into the dashboard) — keep the copies in sync; only
 * APP_ERROR_SOURCE differs. Rows are emailed hourly by send-error-alerts.
 *
 * context = identifiers only (booking_number, slugs, dates, HTTP status, Stripe
 * event type). Never names, emails, phones, addresses, card data, API keys or
 * special-requirements text. As a backstop, keys that look personal or secret
 * are dropped and emails / key-shaped strings are masked. Never throws.
 *
 * Alert test: a request with header `x-alert-test: <INTERNAL_API_KEY>` logs one
 * synthetic 'info' row and returns before any real work.
 */
const APP_ERROR_SOURCE = "send-contact-notification";
const APP_ERROR_BLOCKED_KEY = /(email|phone|name|address|card|cvc|iban|secret|token|key|password|note|requirement|health)/i;

function scrubAppErrorText(s: string): string {
  return s
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\b(sk|rk|pk)_(live|test)_[A-Za-z0-9]+/g, "$1_$2_[redacted]")
    .replace(/\bwhsec_[A-Za-z0-9]+/g, "whsec_[redacted]")
    .replace(/\bsk-ant-[A-Za-z0-9_-]+/g, "sk-ant-[redacted]")
    .replace(/\bre_[A-Za-z0-9_]{16,}/g, "re_[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]");
}

function scrubAppErrorContext(value: unknown, depth = 0): unknown {
  if (depth > 3) return "[truncated]";
  if (typeof value === "string") return scrubAppErrorText(value).slice(0, 300);
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => scrubAppErrorContext(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (!APP_ERROR_BLOCKED_KEY.test(k)) out[k] = scrubAppErrorContext(v, depth + 1);
    }
    return out;
  }
  return value;
}

async function logAppError(
  message: string,
  context: Record<string, unknown> = {},
  severity: "error" | "warning" | "info" = "error",
): Promise<void> {
  const row = {
    source: APP_ERROR_SOURCE,
    severity,
    message: scrubAppErrorText(message).slice(0, 1000),
    context: scrubAppErrorContext(context),
  };
  // Always in the function logs too, so nothing depends on the insert working.
  console.error(`[app_errors] ${row.message}`, JSON.stringify(row.context));
  try {
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/app_errors`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) console.error("[app_errors] insert failed:", res.status, await res.text());
  } catch (e) {
    console.error("[app_errors] insert threw:", e instanceof Error ? e.message : e);
  }
}

async function alertTestResponse(req: Request): Promise<Response | null> {
  const key = Deno.env.get("INTERNAL_API_KEY");
  if (!key || req.headers.get("x-alert-test") !== key) return null;
  await logAppError("TEST: synthetic error to check alerting", { test: true }, "info");
  return new Response(JSON.stringify({ ok: true, test: true }), { headers: { "Content-Type": "application/json" } });
}
/* ── end app_errors logging ─────────────────────────────────────────────────── */

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
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

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
    // The inquiry is still in contact_inquiries; only the notification is lost.
    await logAppError(`Inquiry notification rejected by Resend: HTTP ${resReq.status} ${resData?.message ?? ""}`, {
      inquiry_source: inquiry.source,
    });
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
