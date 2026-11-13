import { createClient } from "npm:@supabase/supabase-js@2";

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
const APP_ERROR_SOURCE = "send-booking-confirmation";
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@koinis.gr";
const ADMIN_DASHBOARD_URL = "https://movability.gr/admin/bookings";

interface BookingItem {
  quantity: number;
  num_days: number;
  subtotal: number;
  equipment: { name_en: string } | null;
}

interface DeliveryZone {
  name_en: string;
  delivery_fee: number;
}

interface Booking {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  rental_start: string;
  rental_end: string;
  num_days: number;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: string | null;
  delivery_time_slot: string | null;
  delivery_notes: string | null;
  payment_status: string;
  payment_type: string | null;
  amount_paid: number | null;
  amount_due: number | null;
  booking_items: BookingItem[];
  delivery_zones: DeliveryZone | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function timeSlotLabel(slot: string | null): string {
  const map: Record<string, string> = {
    daytime: "Daytime (09:00–17:00)",
    evening: "Evening (17:00–21:00)",
    morning: "Morning",
    afternoon: "Afternoon",
  };
  if (!slot || slot === "tbc") return "To be confirmed";
  return map[slot] ?? slot;
}

// ── Customer confirmation email ───────────────────────────────────────────
function buildCustomerHtml(b: Booking): string {
  const itemRows = b.booking_items.map((item) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;">
        ${item.equipment?.name_en ?? "Equipment"} × ${item.quantity}
        <span style="color:#6b7280;font-size:13px;"> · ${item.num_days} day${item.num_days !== 1 ? "s" : ""}</span>
      </td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:15px;font-weight:600;">
        €${Number(item.subtotal).toFixed(0)}
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Booking Confirmation – ${b.booking_number}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#2563EB;"><tr><td align="center" style="padding:32px 24px;">
    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Movability</p>
    <p style="margin:4px 0 0;font-size:13px;color:#bfdbfe;">by Koinis Healthcare Group</p>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Booking Confirmed! 🎉</p>
        <p style="margin:0;font-size:16px;color:#4b5563;line-height:1.6;">Hi ${b.customer_name}, your mobility equipment rental is confirmed and we're preparing your order.</p>
      </td></tr>
      <tr><td style="padding:0 32px 24px;"><div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;">
        <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#2563EB;font-weight:600;">Booking Reference</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#1e40af;font-family:monospace;">${b.booking_number}</p>
      </div></td></tr>
      <tr><td style="padding:0 32px 24px;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Your Equipment</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          ${itemRows}
          ${b.delivery_fee > 0 ? `<tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#6b7280;">Delivery fee</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:15px;">€${Number(b.delivery_fee).toFixed(0)}</td></tr>` : ""}
          <tr style="background:#f9fafb;"><td style="padding:12px 16px;font-size:16px;font-weight:700;color:#111827;">Total</td><td style="padding:12px 16px;text-align:right;font-size:18px;font-weight:700;color:#2563EB;">€${Number(b.total_amount).toFixed(0)}</td></tr>
          ${b.payment_type === "deposit" && (b.amount_due ?? 0) > 0 ? `<tr><td colspan="2" style="padding:10px 16px;background:#fff7ed;font-size:14px;color:#9a3412;"><strong>Deposit paid: €${Number(b.amount_paid ?? 0).toFixed(0)}</strong> · Remaining €${Number(b.amount_due ?? 0).toFixed(0)} due on delivery</td></tr>` : ""}
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 24px;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Rental Details</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;width:40%;">Start date</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${formatDate(b.rental_start)}</td></tr>
          <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">End date</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${formatDate(b.rental_end)}</td></tr>
          <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Duration</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${b.num_days} day${b.num_days !== 1 ? "s" : ""}</td></tr>
          <tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Delivery zone</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${b.delivery_zones?.name_en ?? "—"}</td></tr>
          <tr><td style="padding:10px 16px;font-size:14px;color:#6b7280;">Address</td><td style="padding:10px 16px;font-size:15px;font-weight:500;">${b.delivery_address ?? "—"}</td></tr>
          ${b.delivery_notes ? `<tr><td style="padding:10px 16px;font-size:14px;color:#6b7280;border-top:1px solid #e5e7eb;">Notes</td><td style="padding:10px 16px;font-size:15px;border-top:1px solid #e5e7eb;">${b.delivery_notes}</td></tr>` : ""}
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 24px;"><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#15803d;">What happens next?</p>
        <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">Our team will contact you within 2 hours to confirm the delivery time. We'll deliver the equipment directly to your hotel or location and show you how to use it safely.</p>
      </div></td></tr>
      <tr><td style="padding:0 32px 32px;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Need Help?</p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 0 8px;"><a href="https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens." style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#111827;font-size:15px;">📱 <strong>WhatsApp:</strong>&nbsp;+30 697 463 3697</a></td></tr>
          <tr><td><a href="mailto:info@movability.gr" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#111827;font-size:15px;">✉️ <strong>Email:</strong>&nbsp;info@movability.gr</a></td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

// ── Admin notification email ──────────────────────────────────────────────
function buildAdminHtml(b: Booking): string {
  const itemsList = b.booking_items.map((item) =>
    `${item.equipment?.name_en ?? "Equipment"} × ${item.quantity} (${item.num_days} day${item.num_days !== 1 ? "s" : ""}) — €${Number(item.subtotal).toFixed(0)}`
  ).join("<br>");

  const paymentTypeLabel = b.payment_type === "deposit" ? "30% deposit" : "Full payment";
  const amountPaidDisplay = b.payment_type === "deposit" && (b.amount_paid ?? 0) > 0
    ? `€${Number(b.amount_paid ?? 0).toFixed(0)} (deposit) · Remaining €${Number(b.amount_due ?? 0).toFixed(0)} due on delivery`
    : `€${Number(b.total_amount).toFixed(0)} (paid in full)`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>New Booking — ${b.booking_number}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <tr><td style="background:#059669;padding:20px 24px;">
        <p style="margin:0;color:#ffffff;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">🔔 New Booking Received</p>
        <p style="margin:4px 0 0;color:#ffffff;font-size:22px;font-weight:700;font-family:monospace;">${b.booking_number}</p>
      </td></tr>
      <tr><td style="padding:24px;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Customer</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;width:35%;">Name</td><td style="padding:10px 16px;font-size:15px;font-weight:500;">${b.customer_name}</td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Email</td><td style="padding:10px 16px;font-size:15px;border-top:1px solid #e5e7eb;"><a href="mailto:${b.customer_email}" style="color:#2563EB;text-decoration:none;">${b.customer_email}</a></td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Phone</td><td style="padding:10px 16px;font-size:15px;border-top:1px solid #e5e7eb;">${b.customer_phone ? `<a href="https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}" style="color:#25D366;text-decoration:none;">${b.customer_phone} → WhatsApp</a>` : "—"}</td></tr>
        </table>

        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Equipment</h2>
        <div style="padding:12px 16px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:20px;font-size:14px;line-height:1.8;">
          ${itemsList}
        </div>

        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Rental Period</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;width:35%;">Start</td><td style="padding:10px 16px;font-size:15px;font-weight:500;">${formatDate(b.rental_start)}</td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">End</td><td style="padding:10px 16px;font-size:15px;font-weight:500;border-top:1px solid #e5e7eb;">${formatDate(b.rental_end)}</td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Duration</td><td style="padding:10px 16px;font-size:15px;font-weight:500;border-top:1px solid #e5e7eb;">${b.num_days} day${b.num_days !== 1 ? "s" : ""}</td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Time slot</td><td style="padding:10px 16px;font-size:15px;font-weight:500;border-top:1px solid #e5e7eb;">${timeSlotLabel(b.delivery_time_slot)}</td></tr>
        </table>

        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Delivery</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;width:35%;">Zone</td><td style="padding:10px 16px;font-size:15px;font-weight:500;">${b.delivery_zones?.name_en ?? "—"} (€${Number(b.delivery_fee).toFixed(0)})</td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Address</td><td style="padding:10px 16px;font-size:15px;border-top:1px solid #e5e7eb;">${b.delivery_address ?? "—"}</td></tr>
          ${b.delivery_notes ? `<tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Notes</td><td style="padding:10px 16px;font-size:15px;border-top:1px solid #e5e7eb;color:#9a3412;">${b.delivery_notes}</td></tr>` : ""}
        </table>

        <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Payment</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;width:35%;">Type</td><td style="padding:10px 16px;font-size:15px;font-weight:500;">${paymentTypeLabel}</td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Total</td><td style="padding:10px 16px;font-size:15px;font-weight:500;border-top:1px solid #e5e7eb;">€${Number(b.total_amount).toFixed(0)}</td></tr>
          <tr><td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">Paid</td><td style="padding:10px 16px;font-size:15px;font-weight:600;color:#059669;border-top:1px solid #e5e7eb;">${amountPaidDisplay}</td></tr>
        </table>

        <a href="${ADMIN_DASHBOARD_URL}" style="display:inline-block;padding:12px 24px;background:#059669;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Open Admin Dashboard →</a>
      </td></tr>
      <tr><td style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#6b7280;">
        Internal admin notification · Customer received a separate confirmation
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

Deno.serve(async (req) => {
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

  // Handle CORS preflight BEFORE auth (browser OPTIONS has no Authorization header)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY")!;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token !== INTERNAL_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { booking_number } = await req.json();
    if (!booking_number) {
      return new Response(JSON.stringify({ error: "booking_number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select(`
        id, booking_number, customer_name, customer_email, customer_phone,
        rental_start, rental_end, num_days,
        subtotal, delivery_fee, total_amount,
        delivery_address, delivery_time_slot, delivery_notes,
        payment_status, payment_type, amount_paid, amount_due,
        delivery_zones ( name_en, delivery_fee ),
        booking_items ( quantity, num_days, subtotal, equipment ( name_en ) )
      `)
      .eq("booking_number", booking_number)
      .single();

    if (bookingErr || !booking) {
      await logAppError(`Booking fetch failed: ${bookingErr?.message ?? "not found"}`, { booking_number });
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const b = booking as Booking;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      await logAppError("RESEND_API_KEY not set — no confirmation email sent", { booking_number });
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Send customer confirmation
    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Movability <hello@movability.gr>",
        reply_to: "info@movability.gr",
        to: [b.customer_email],
        subject: `Booking Confirmed – ${b.booking_number} | Movability`,
        html: buildCustomerHtml(b),
      }),
    });
    const customerResult = await customerRes.json();
    if (!customerRes.ok) {
      await logAppError(`Customer confirmation email rejected by Resend: HTTP ${customerRes.status} ${(customerResult as { message?: string })?.message ?? ""}`, {
        booking_number,
      });
      return new Response(JSON.stringify({ error: "Failed to send customer email", details: customerResult }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`Customer email sent for ${booking_number} to ${b.customer_email}`, customerResult);

    // 2. Send admin notification — best-effort, don't fail the request if this fails
    let adminResult: unknown = null;
    try {
      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Movability Bookings <noreply@movability.gr>",
          to: [ADMIN_EMAIL],
          reply_to: b.customer_email,
          subject: `🔔 New Booking: ${b.booking_number} - ${b.customer_name}`,
          html: buildAdminHtml(b),
        }),
      });
      adminResult = await adminRes.json();
      if (!adminRes.ok) {
        await logAppError(`Admin booking email rejected by Resend: HTTP ${adminRes.status} ${(adminResult as { message?: string })?.message ?? ""}`, {
          booking_number,
        }, "warning");
      } else {
        console.log(`Admin email sent for ${booking_number} to ${ADMIN_EMAIL}`, adminResult);
      }
    } catch (err) {
      await logAppError(`Admin booking email failed: ${(err as Error).message}`, { booking_number }, "warning");
    }

    return new Response(JSON.stringify({
      sent: true,
      customer_email_id: (customerResult as { id?: string })?.id ?? null,
      admin_email_id: (adminResult as { id?: string } | null)?.id ?? null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    await logAppError(`send-booking-confirmation failed: ${(err as Error).message}`);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
