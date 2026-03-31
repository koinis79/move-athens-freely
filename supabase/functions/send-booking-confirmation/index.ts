import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  booking_items: BookingItem[];
  delivery_zones: DeliveryZone | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function timeSlotLabel(slot: string | null): string {
  const map: Record<string, string> = {
    morning: "Morning (08:00 – 12:00)",
    afternoon: "Afternoon (12:00 – 16:00)",
    evening: "Evening (16:00 – 20:00)",
  };
  return slot ? (map[slot] ?? slot) : "Morning";
}

function buildHtml(b: Booking): string {
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
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Booking Confirmation – ${b.booking_number}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#2563EB;">
    <tr>
      <td align="center" style="padding:32px 24px;">
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
          Movability
        </p>
        <p style="margin:4px 0 0;font-size:13px;color:#bfdbfe;">by Koinis Healthcare Group</p>
      </td>
    </tr>
  </table>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
                Booking Confirmed! 🎉
              </p>
              <p style="margin:0;font-size:16px;color:#4b5563;line-height:1.6;">
                Hi ${b.customer_name}, your mobility equipment rental is confirmed and we're preparing your order.
              </p>
            </td>
          </tr>

          <!-- Booking number banner -->
          <tr>
            <td style="padding:0 32px 24px;">
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;">
                <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#2563EB;font-weight:600;">Booking Reference</p>
                <p style="margin:4px 0 0;font-size:24px;font-weight:700;color:#1e40af;font-family:monospace;">${b.booking_number}</p>
              </div>
            </td>
          </tr>

          <!-- Items table -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Your Equipment</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                ${itemRows}
                ${b.delivery_fee > 0 ? `
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;color:#6b7280;">Delivery fee</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:15px;">€${Number(b.delivery_fee).toFixed(0)}</td>
                </tr>` : ""}
                <tr style="background:#f9fafb;">
                  <td style="padding:12px 16px;font-size:16px;font-weight:700;color:#111827;">Total Paid</td>
                  <td style="padding:12px 16px;text-align:right;font-size:18px;font-weight:700;color:#2563EB;">€${Number(b.total_amount).toFixed(0)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rental details -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Rental Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;width:40%;">Start date</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${formatDate(b.rental_start)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">End date</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${formatDate(b.rental_end)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Duration</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${b.num_days} day${b.num_days !== 1 ? "s" : ""}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Delivery zone</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${b.delivery_zones?.name_en ?? "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">Address</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:500;">${b.delivery_address ?? "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;font-size:14px;color:#6b7280;">Time slot</td>
                  <td style="padding:10px 16px;font-size:15px;font-weight:500;">${timeSlotLabel(b.delivery_time_slot)}</td>
                </tr>
                ${b.delivery_notes ? `
                <tr>
                  <td style="padding:10px 16px;font-size:14px;color:#6b7280;border-top:1px solid #e5e7eb;">Notes</td>
                  <td style="padding:10px 16px;font-size:15px;border-top:1px solid #e5e7eb;">${b.delivery_notes}</td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="padding:0 32px 24px;">
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#15803d;">What happens next?</p>
                <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">
                  Our team will contact you within 2 hours to confirm the delivery time. We'll deliver the equipment directly to your hotel or location and show you how to use it safely.
                </p>
              </div>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;">Need Help?</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 8px;">
                    <a href="https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens." style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#111827;font-size:15px;">
                      📱 <strong>WhatsApp:</strong>&nbsp;+30 697 463 3697
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="mailto:info@movability.gr" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#111827;font-size:15px;">
                      ✉️ <strong>Email:</strong>&nbsp;info@movability.gr
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:24px;">
          <tr>
            <td align="center" style="padding:0 16px;font-size:12px;color:#9ca3af;line-height:1.6;">
              <p style="margin:0;">Movability by Koinis Healthcare Group · Athens, Greece</p>
              <p style="margin:4px 0 0;">Stadiou 31, 105 59 Athens · Kallithea · Chalandri · Korinthos</p>
              <p style="margin:4px 0 0;">© ${new Date().getFullYear()} Koinis Healthcare Group. Est. 1982.</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

Deno.serve(async (req) => {
  // This function is only called server-to-server (from stripe-webhook).
  // Reject any request that doesn't carry the service role key.
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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
        delivery_address, delivery_time_slot, delivery_notes, payment_status,
        delivery_zones ( name_en, delivery_fee ),
        booking_items ( quantity, num_days, subtotal, equipment ( name_en ) )
      `)
      .eq("booking_number", booking_number)
      .single();

    if (bookingErr || !booking) {
      console.error("Booking fetch error:", bookingErr);
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const b = booking as Booking;
    const html = buildHtml(b);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Movability Bookings <onboarding@resend.dev>",
        to: [b.customer_email],
        subject: `Booking Confirmed – ${b.booking_number} | Movability`,
        html,
      }),
    });

    const emailResult = await emailRes.json();

    if (!emailRes.ok) {
      console.error("Resend error:", emailResult);
      return new Response(JSON.stringify({ error: "Failed to send email", details: emailResult }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Confirmation email sent for ${booking_number} to ${b.customer_email}`, emailResult);

    return new Response(JSON.stringify({ sent: true, email_id: emailResult.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-booking-confirmation error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
