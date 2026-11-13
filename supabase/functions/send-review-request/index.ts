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
const APP_ERROR_SOURCE = "send-review-request";
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
const GOOGLE_REVIEW_URL = "https://movability.gr/review";

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
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

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
    await logAppError(`Booking fetch failed: ${fetchErr?.message ?? "not found"}`, { booking_id }, "warning");
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
    <a href="https://www.movability.gr" style="color: #00838F;">movability.gr</a> ·
    <a href="mailto:info@movability.gr" style="color: #00838F;">info@movability.gr</a><br>
    Don't want these emails?
    <a href="mailto:info@movability.gr?subject=Unsubscribe%20${booking.booking_number}" style="color: #00838F;">Opt out</a>
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
      from: "Vasilis from Movability <hello@movability.gr>",
      reply_to: "info@movability.gr",
      to: [booking.customer_email],
      subject: `⭐ How was your Movability experience, ${firstName}?`,
      html: emailHtml,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    await logAppError(`Review request email rejected by Resend: HTTP ${resendRes.status} ${err.slice(0, 300)}`, {
      booking_number: booking.booking_number,
    });
    return new Response(JSON.stringify({ error: "Failed to send email", detail: err }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Mark as sent
  const { error: markErr } = await supabase
    .from("bookings")
    .update({ review_requested_at: new Date().toISOString() })
    .eq("id", booking_id);
  if (markErr) {
    await logAppError(`Review email sent but review_requested_at not saved: ${markErr.message}`, {
      booking_number: booking.booking_number,
    }, "warning");
  }

  console.log(`Review request sent for ${booking.booking_number} to ${booking.customer_email}`);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
