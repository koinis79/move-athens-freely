import Stripe from "https://esm.sh/stripe@14?target=deno";
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
const APP_ERROR_SOURCE = "create-checkout-session";
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let bookingNumberForLog: string | undefined;
  try {
    const { booking_number, customer_email, payment_type } = await req.json();
    bookingNumberForLog = typeof booking_number === "string" ? booking_number : undefined;
    if (!booking_number || !customer_email) {
      return new Response(JSON.stringify({ error: "booking_number and customer_email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only two payment modes: full, or the 30% down-payment ("deposit").
    // Anything else (including missing) is treated as full payment.
    const isDeposit = payment_type === "deposit";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_number,
        customer_name,
        customer_email,
        subtotal,
        delivery_fee,
        total_amount,
        deposit_amount,
        payment_status,
        booking_items (
          quantity,
          num_days,
          subtotal,
          equipment ( name_en )
        )
      `)
      .eq("booking_number", booking_number)
      .eq("customer_email", customer_email)
      .single();

    if (bookingErr || !booking || booking.payment_status === "paid") {
      // A paid booking is a harmless double-click; a lookup failure right after
      // create_booking means the checkout cannot proceed.
      if (booking?.payment_status !== "paid") {
        await logAppError(`Booking lookup failed: ${bookingErr?.message ?? "not found"}`, {
          booking_number,
        }, "warning");
      }
      return new Response(JSON.stringify({ error: "Unable to process this booking" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const fullTotal = Number(booking.total_amount);
    const downPayment = Math.ceil(fullTotal * 0.30);
    // Refundable SECURITY deposit (separate from the 30% down-payment).
    // It is NOT charged here: the card is saved and a hold (authorization,
    // not a charge) is placed the day before delivery by the deposit-holds job.
    const securityDeposit = Number(booking.deposit_amount ?? 0);

    type BookingItem = {
      quantity: number;
      num_days: number;
      subtotal: number;
      equipment: { name_en: string } | null;
    };

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    if (isDeposit) {
      const balance = fullTotal - downPayment;
      lineItems = [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `30% Deposit — booking ${booking.booking_number}`,
            description: `€${balance} balance due in person on delivery (booking total €${fullTotal}).`,
          },
          unit_amount: downPayment * 100,
        },
        quantity: 1,
      }];
    } else {
      lineItems = (booking.booking_items as BookingItem[]).map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.equipment?.name_en ?? "Equipment"} — ${item.num_days} day${item.num_days !== 1 ? "s" : ""}`,
          },
          unit_amount: Math.round((item.subtotal / item.quantity) * 100),
        },
        quantity: item.quantity,
      }));

      if (booking.delivery_fee > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: { name: "Delivery fee" },
            unit_amount: Math.round(Number(booking.delivery_fee) * 100),
          },
          quantity: 1,
        });
      }
    }

    const origin = req.headers.get("origin") ?? "https://lmgpuqgwkiapgpdsxvmb.lovableproject.com";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.customer_email,
      customer_creation: "always",
      line_items: lineItems,
      metadata: {
        booking_number: booking.booking_number,
        booking_id: booking.id,
        payment_type: isDeposit ? "deposit" : "full",
        full_total: String(fullTotal),
        security_deposit: String(securityDeposit),
      },
      success_url: `${origin}/booking/confirmation/${booking.booking_number}?paid=1`,
      cancel_url: `${origin}/cart`,
    };

    if (securityDeposit > 0) {
      // Save the card so the security-deposit hold can be placed later.
      sessionParams.payment_intent_data = { setup_future_usage: "off_session" };
      sessionParams.custom_text = {
        submit: {
          message: `A refundable security deposit of €${securityDeposit} will be held (not charged) on this card the day before delivery and released after the equipment is returned in good condition.`,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id, payment_type: isDeposit ? "deposit" : "full" })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    await logAppError(`Checkout session failed: ${err instanceof Error ? err.message : String(err)}`, {
      booking_number: bookingNumberForLog,
    });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
