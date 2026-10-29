import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
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
    console.error("Webhook signature verification failed:", err);
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
            console.error(`Could not read saved card for ${bookingNumber}:`, e);
            update.deposit_hold_status = "failed";
            update.deposit_hold_error = `Card lookup failed: ${(e as Error).message}`;
          }
        }

        await supabase.from("bookings").update(update).eq("booking_number", bookingNumber);

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
          const emailResult = await emailRes.json();
          console.log(`Email for ${bookingNumber}:`, emailResult);
        } catch (emailErr) {
          console.error(`Email send failed for ${bookingNumber}:`, emailErr);
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
    console.error("Error processing webhook event:", err);
    return new Response("Internal error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
