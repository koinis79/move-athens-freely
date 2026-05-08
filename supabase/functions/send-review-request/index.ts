import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY")!;
const GOOGLE_REVIEW_URL = "https://g.page/r/CRIC4z0HieHaEBM/review";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

Deno.serve(async (req: Request) => {
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

  let booking_id: string;
  try {
    const body = await req.json();
    booking_id = body.booking_id;
    if (!booking_id) throw new Error("Missing booking_id");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: booking, error: fetchErr } = await supabase
    .from("bookings")
    .select("id, booking_number, customer_name, customer_email, rental_start, rental_end, review_requested_at")
    .eq("id", booking_id)
    .single();

  if (fetchErr || !booking) {
    return new Response(JSON.stringify({ error: "Booking not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Duplicate prevention
  if (booking.review_requested_at) {
    return new Response(
      JSON.stringify({ error: "Review request already sent", sent_at: booking.review_requested_at }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const firstName = booking.customer_name.split(" ")[0];
  const startStr = formatDate(booking.rental_start);
  const endStr = formatDate(booking.rental_end);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #00838F; font-size: 24px; margin: 0;">Movability</h1>
    <p style="color: #666; font-size: 13px; margin: 4px 0 0;">by Koinis Healthcare Group</p>
  </div>

  <p style="font-size: 17px;">Hi ${firstName} ⭐</p>

  <p style="font-size: 16px; line-height: 1.6;">
    We hope you had a wonderful time in Athens! It was our pleasure to support your mobility during your trip
    from <strong>${startStr}</strong> to <strong>${endStr}</strong>
    (booking <strong>${booking.booking_number}</strong>).
  </p>

  <p style="font-size: 16px; line-height: 1.6;">
    If you have a moment, we'd love to hear how we did. Your review helps other travelers with mobility needs
    discover our service and plan their visits with confidence.
  </p>

  <div style="text-align: center; margin: 36px 0;">
    <a href="${GOOGLE_REVIEW_URL}"
      style="background-color: #F57C00; color: #fff; text-decoration: none; padding: 14px 32px;
             border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
      ⭐ Leave a Google Review
    </a>
  </div>

  <p style="font-size: 15px; line-height: 1.6; color: #555;">
    It only takes a minute and means the world to us.
    Thank you for choosing Movability — we look forward to seeing you on your next visit to Athens!
  </p>

  <p style="font-size: 15px;">Warm regards,<br><strong>The Movability Team</strong><br>Koinis Healthcare Group</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="font-size: 12px; color: #999; text-align: center;">
    Movability by Koinis Healthcare Group · Athens, Greece<br>
    <a href="https://movability.gr" style="color: #00838F;">movability.gr</a> ·
    <a href="mailto:info@movability.gr" style="color: #00838F;">info@movability.gr</a>
  </p>
</body>
</html>`;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Movability <noreply@movability.gr>",
      to: [booking.customer_email],
      subject: `⭐ How was your Movability experience, ${firstName}?`,
      html: emailHtml,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email", detail: err }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Mark as sent
  await supabase
    .from("bookings")
    .update({ review_requested_at: new Date().toISOString() })
    .eq("id", booking_id);

  console.log(`Review request sent for ${booking.booking_number} to ${booking.customer_email}`);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
