import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { booking_number, customer_email, payment_type } = await req.json();
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
    console.error("create-checkout-session error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
