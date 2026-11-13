import Stripe from "npm:stripe@14";
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
const APP_ERROR_SOURCE = "stripe-webhook";
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

Deno.serve(async (req) => {
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-06-20",
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    // Usually a probe, but a burst of these means STRIPE_WEBHOOK_SECRET is wrong
    // and no payment is being recorded.
    await logAppError(`Webhook signature verification failed: ${(err as Error).message}`, {}, "warning");
    return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingNumber = session.metadata?.booking_number;
        if (!bookingNumber) break;

        const amountPaid = (session.amount_total ?? 0) / 100;
        const fullTotal = Number(session.metadata?.full_total ?? amountPaid);
        const isDeposit = session.metadata?.payment_type === "deposit";

        const paymentStatus = isDeposit ? "deposit_paid" : "paid";
        const amountDue = isDeposit ? Math.max(0, fullTotal - amountPaid) : 0;
        const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;

        const update: Record<string, unknown> = {
          payment_status: paymentStatus,
          payment_type: isDeposit ? "deposit" : "full",
          amount_paid: amountPaid,
          amount_due: amountDue,
          status: "confirmed",
          stripe_payment_intent_id: paymentIntentId,
        };

        // Security deposit: remember the saved card so the hold can be placed
        // the day before delivery (see deposit-holds function).
        const securityDeposit = Number(session.metadata?.security_deposit ?? 0);
        if (securityDeposit > 0) {
          try {
            const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
            let paymentMethodId: string | null = null;
            if (paymentIntentId) {
              const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
              paymentMethodId = typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id ?? null;
            }
            update.stripe_customer_id = customerId;
            update.stripe_payment_method_id = paymentMethodId;
            update.deposit_hold_status = customerId && paymentMethodId ? "scheduled" : "failed";
            if (!(customerId && paymentMethodId)) {
              update.deposit_hold_error = "Card not saved at checkout — collect deposit in person.";
            }
          } catch (e) {
            await logAppError(`Could not read saved card: ${(e as Error).message}`, {
              booking_number: bookingNumber, event_id: event.id,
            }, "warning");
            update.deposit_hold_status = "failed";
            update.deposit_hold_error = `Card lookup failed: ${(e as Error).message}`;
          }
        }

        const { error: updateErr } = await supabase.from("bookings").update(update).eq("booking_number", bookingNumber);
        if (updateErr) {
          // Paid in Stripe but not marked paid here — needs a human.
          await logAppError(`Payment received but booking update failed: ${updateErr.message}`, {
            booking_number: bookingNumber, event_id: event.id, payment_status: paymentStatus,
          });
        }

        console.log(`Booking ${bookingNumber} → ${paymentStatus} (paid €${amountPaid}, due €${amountDue})`);

        try {
          const emailRes = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-confirmation`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("INTERNAL_API_KEY")}`,
              },
              body: JSON.stringify({ booking_number: bookingNumber }),
            }
          );
          const emailResult = await emailRes.json().catch(() => null);
          console.log(`Email for ${bookingNumber}:`, emailResult);
          if (!emailRes.ok) {
            await logAppError(`send-booking-confirmation returned HTTP ${emailRes.status}`, {
              booking_number: bookingNumber, event_id: event.id,
            });
          }
        } catch (emailErr) {
          await logAppError(`Confirmation email call failed: ${(emailErr as Error).message}`, {
            booking_number: bookingNumber, event_id: event.id,
          });
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingNumber = session.metadata?.booking_number;
        if (!bookingNumber) break;

        await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("booking_number", bookingNumber)
          .eq("status", "pending");

        console.log(`Booking ${bookingNumber} cancelled (session expired)`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    await logAppError(`Error processing webhook event: ${(err as Error).message}`, {
      event_id: event.id, event_type: event.type,
    });
    return new Response("Internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
