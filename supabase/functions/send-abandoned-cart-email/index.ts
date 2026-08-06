import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

const SITE_ORIGIN = "https://movability.gr";
const WHATSAPP_URL = "https://wa.me/306974633697";

// CORS handled BEFORE auth (project doc lesson: browser preflight sends no auth
// header; running auth first returns a 401 without CORS headers and the browser
// blocks everything). Cron calls this too, but the order must stay preflight-safe.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

type BookingItem = {
  quantity: number;
  num_days: number;
  subtotal: number;
  equipment: { name_en: string } | null;
};

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
    .select(`
      id,
      booking_number,
      customer_name,
      customer_email,
      subtotal,
      delivery_fee,
      total_amount,
      payment_status,
      stripe_session_id,
      abandoned_email_sent_at,
      rental_start,
      rental_end,
      booking_items (
        quantity,
        num_days,
        subtotal,
        equipment ( name_en )
      )
    `)
    .eq("id", booking_id)
    .single();

  if (fetchErr || !booking) {
    return new Response(JSON.stringify({ error: "Booking not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Guards ──
  // Already emailed → dedup (same pattern as review_requested_at).
  if (booking.abandoned_email_sent_at) {
    return new Response(
      JSON.stringify({ error: "Abandoned-cart email already sent", sent_at: booking.abandoned_email_sent_at }),
      { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  // Already paid → nothing to recover.
  if (booking.payment_status === "paid") {
    return new Response(JSON.stringify({ error: "Booking already paid" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  // No Stripe session → this is a manual/store/WhatsApp/partner entry, not an
  // abandoned checkout. Never treat these as abandoned carts.
  if (!booking.stripe_session_id) {
    return new Response(JSON.stringify({ error: "Not a checkout booking (no stripe_session_id)" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const firstName = booking.customer_name.split(" ")[0];
  const startStr = formatDate(booking.rental_start);
  const endStr = formatDate(booking.rental_end);
  const items = (booking.booking_items ?? []) as BookingItem[];

  // ── Fresh Stripe payment link ──
  // The original checkout session URL expires ~24h after creation, so carts up
  // to 7 days old need a new session. Mirrors create-checkout-session's line
  // items; stripe-webhook matches on metadata booking_id/booking_number.
  let paymentUrl: string;
  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.equipment?.name_en ?? "Equipment"} — ${item.num_days} day${item.num_days !== 1 ? "s" : ""}`,
        },
        unit_amount: Math.round((item.subtotal / item.quantity) * 100),
      },
      quantity: item.quantity,
    }));

    if (Number(booking.delivery_fee) > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Delivery fee" },
          unit_amount: Math.round(Number(booking.delivery_fee) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.customer_email,
      line_items: lineItems,
      metadata: {
        booking_number: booking.booking_number,
        booking_id: booking.id,
      },
      success_url: `${SITE_ORIGIN}/booking/confirmation/${booking.booking_number}?paid=1`,
      cancel_url: `${SITE_ORIGIN}/cart`,
    });

    if (!session.url) throw new Error("Stripe session has no URL");
    paymentUrl = session.url;

    // Point the booking at the fresh session (keeps stripe_session_id NOT NULL).
    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);
  } catch (err) {
    console.error("Stripe session error:", err);
    return new Response(JSON.stringify({ error: "Failed to create payment link" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px 0; font-size: 15px; color: #333;">
          ${item.equipment?.name_en ?? "Mobility equipment"}${item.quantity > 1 ? ` &times; ${item.quantity}` : ""}
          <span style="color: #999;"> — ${item.num_days} day${item.num_days !== 1 ? "s" : ""}</span>
        </td>
        <td style="padding: 6px 0; font-size: 15px; color: #333; text-align: right;">&euro;${Number(item.subtotal).toFixed(0)}</td>
      </tr>`,
    )
    .join("");

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #00838F; font-size: 24px; margin: 0;">Movability</h1>
    <p style="color: #666; font-size: 13px; margin: 4px 0 0;">by Koinis Healthcare Group</p>
  </div>

  <p style="font-size: 17px;">Hi ${firstName},</p>

  <p style="font-size: 16px; line-height: 1.6;">
    We noticed you started a booking with us but didn't quite finish — no worries at all, it happens!
    We've kept everything ready for you, in case you'd still like your mobility equipment for your Athens trip.
  </p>

  <div style="background: #f7f9fa; border-radius: 10px; padding: 20px 22px; margin: 24px 0;">
    <p style="font-size: 13px; color: #888; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">
      Your booking ${booking.booking_number}
    </p>
    <table style="width: 100%; border-collapse: collapse;">
      ${itemsRows}
      ${Number(booking.delivery_fee) > 0
        ? `<tr><td style="padding: 6px 0; font-size: 15px; color: #333;">Delivery</td><td style="padding: 6px 0; font-size: 15px; color: #333; text-align: right;">&euro;${Number(booking.delivery_fee).toFixed(0)}</td></tr>`
        : ""}
      <tr><td colspan="2" style="border-top: 1px solid #e2e8ea; padding-top: 10px;"></td></tr>
      <tr>
        <td style="font-size: 16px; font-weight: bold; color: #1a1a1a;">Total</td>
        <td style="font-size: 16px; font-weight: bold; color: #1a1a1a; text-align: right;">&euro;${Number(booking.total_amount).toFixed(0)}</td>
      </tr>
    </table>
    <p style="font-size: 14px; color: #666; margin: 14px 0 0;">
      Rental dates: <strong>${startStr}</strong> to <strong>${endStr}</strong>
    </p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${paymentUrl}"
      style="background-color: #F57C00; color: #fff; text-decoration: none; padding: 14px 32px;
             border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
      Complete your booking
    </a>
  </div>

  <p style="font-size: 15px; line-height: 1.6; color: #555;">
    Have a question before you book, or need to change a date? Just reply to this email, or message us on
    <a href="${WHATSAPP_URL}" style="color: #00838F; font-weight: 600;">WhatsApp (+30 697 463 3697)</a>
    — a real person from our family business will help you sort it out. There's no pressure either way.
  </p>

  <p style="font-size: 15px;">Warm regards,<br><strong>Vasilis &amp; the Movability Team</strong><br>Koinis Healthcare Group</p>

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
      from: "Vasilis from Movability <hello@movability.gr>",
      reply_to: "info@movability.gr",
      to: [booking.customer_email],
      subject: `Your Athens mobility equipment is still available, ${firstName}`,
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

  // Mark as sent (dedup guard — set only after a successful send).
  await supabase
    .from("bookings")
    .update({ abandoned_email_sent_at: new Date().toISOString() })
    .eq("id", booking_id);

  console.log(`Abandoned-cart email sent for ${booking.booking_number} to ${booking.customer_email}`);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
