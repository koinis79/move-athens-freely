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
    const { booking_number } = await req.json();
    if (!booking_number) {
      return new Response(JSON.stringify({ error: "booking_number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client — bypasses RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch booking with items
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
        payment_status,
        booking_items (
          quantity,
          num_days,
          subtotal,
          equipment ( name_en )
        )
      `)
      .eq("booking_number", booking_number)
      .single();

    if (bookingErr || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.payment_status === "paid") {
      return new Response(JSON.stringify({ error: "Booking already paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Build line items — one per equipment type
    type BookingItem = {
      quantity: number;
      num_days: number;
      subtotal: number;
      equipment: { name_en: string } | null;
    };
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = (booking.booking_items as BookingItem[]).map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.equipment?.name_en ?? "Equipment"} — ${item.num_days} day${item.num_days !== 1 ? "s" : ""}`,
        },
        // unit_amount = price per single unit in cents
        unit_amount: Math.round((item.subtotal / item.quantity) * 100),
      },
      quantity: item.quantity,
    }));

    // Delivery as a separate line item
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

    const origin = req.headers.get("origin") ?? "https://lmgpuqgwkiapgpdsxvmb.lovableproject.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.customer_email,
      line_items: lineItems,
      metadata: {
        booking_number: booking.booking_number,
        booking_id: booking.id,
      },
      success_url: `${origin}/booking/confirmation/${booking.booking_number}?paid=1`,
      cancel_url: `${origin}/cart`,
    });

    // Save session ID to booking row
    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
