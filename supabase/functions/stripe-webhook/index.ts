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

  // Service role client — bypasses RLS for updates
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

        await supabase
          .from("bookings")
          .update({
            payment_status: "paid",
            status: "confirmed",
            stripe_payment_intent_id: typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          })
          .eq("booking_number", bookingNumber);

        console.log(`Booking ${bookingNumber} marked as paid + confirmed`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingNumber = session.metadata?.booking_number;
        if (!bookingNumber) break;

        // Only cancel if still pending — don't touch already-confirmed bookings
        await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("booking_number", bookingNumber)
          .eq("status", "pending");

        console.log(`Booking ${bookingNumber} cancelled (session expired)`);
        break;
      }

      default:
        // Ignore unhandled events
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
