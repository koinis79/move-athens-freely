import { createClient } from "npm:@supabase/supabase-js@2";

/* ── Config ───────────────────────────────────────────────────────────── */

const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL    = "info@koinis.gr";

// Brand
const PRIMARY = "#00838F";
const ACCENT  = "#F57C00";
const DARK    = "#0D2137";

/* ── Types ────────────────────────────────────────────────────────────── */

interface BookingRow {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string | null;
  delivery_address: string | null;
  delivery_time_slot: string | null;
  total_amount: number;
  status: string;
  rental_start: string;
  rental_end: string;
  delivery_zones: { name_en: string } | null;
  booking_items: { quantity: number; equipment: { name_en: string } | null }[];
}

interface InquiryRow {
  id: string;
  name: string;
  source: string;
  subject: string | null;
  message: string;
  created_at: string;
}

/* ── Date helpers (Europe/Athens) ─────────────────────────────────────── */

/** Returns YYYY-MM-DD for "today" in Athens timezone */
function athensDate(offsetDays = 0): string {
  const d = new Date();
  // Shift to Athens time using toLocaleDateString
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  // parts = "YYYY-MM-DD" in en-CA locale
  if (offsetDays === 0) return parts;
  const date = new Date(parts + "T12:00:00"); // noon to avoid DST edge
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ── Rendering ────────────────────────────────────────────────────────── */

function whatsappLink(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  return `<a href="https://wa.me/${digits}" style="color:${PRIMARY};text-decoration:none;">${phone}</a>`;
}

function timeSlotLabel(slot: string | null): string {
  const map: Record<string, string> = {
    daytime: "Daytime (09:00–17:00)",
    evening: "Evening (17:00–21:00)",
    morning: "Morning",
    afternoon: "Afternoon",
  };
  if (!slot || slot === "tbc") return "TBC";
  return map[slot] ?? slot;
}

function bookingsTable(rows: BookingRow[], emptyMsg: string): string {
  if (rows.length === 0) {
    return `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;font-style:italic;">${emptyMsg}</p>`;
  }

  const trs = rows.map((b) => {
    const items = b.booking_items
      .map((i) => `${i.equipment?.name_en ?? "?"} ×${i.quantity}`)
      .join(", ");
    const phone = whatsappLink(b.customer_phone);
    const zone = b.delivery_zones?.name_en ?? "—";
    const addr = b.delivery_address
      ? `<br><span style="font-size:11px;color:#6b7280;">${b.delivery_address}</span>`
      : "";
    const slot = timeSlotLabel(b.delivery_time_slot);

    return `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;color:${PRIMARY};white-space:nowrap;">${b.booking_number}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;">
          <strong>${b.customer_name}</strong>${phone ? ` · ${phone}` : ""}
        </td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;">${items}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;">${zone}${addr}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;white-space:nowrap;">${slot}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;text-align:right;white-space:nowrap;">€${Number(b.total_amount).toFixed(0)}</td>
      </tr>`;
  }).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;border-collapse:separate;border-spacing:0;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left;">Ref</th>
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left;">Customer</th>
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left;">Equipment</th>
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left;">Zone / Address</th>
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left;">Time</th>
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${trs}</tbody>
    </table>`;
}

function inquiriesTable(rows: InquiryRow[]): string {
  if (rows.length === 0) return "";
  const trs = rows.map((b) => {
    const label = b.source === "b2b_inquiry" ? "B2B" : "Contact";
    const bg = b.source === "b2b_inquiry" ? "#eff6ff" : "#f3f4f6";
    const color = b.source === "b2b_inquiry" ? "#1d4ed8" : "#374151";
    return `
      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <strong style="font-size:14px;color:#111827;">${b.name}</strong>
          <span style="background:${bg};color:${color};font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;text-transform:uppercase;">${label}</span>
        </div>
        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#374151;">${b.subject || "No subject"}</p>
        <p style="margin:0;font-size:12px;color:#6b7280;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${b.message}</p>
      </div>
    `;
  }).join("");

  return `<div>${trs}</div>`;
}

/* ── Handler ──────────────────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  // Auth — INTERNAL_API_KEY (same pattern as send-booking-confirmation)
  const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY")!;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token !== INTERNAL_API_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const today    = athensDate(0);
    const tomorrow = athensDate(1);
    const yesterdayISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const bookingSelect = `
      id, booking_number, customer_name, customer_phone,
      delivery_address, delivery_time_slot,
      total_amount, status, rental_start, rental_end,
      delivery_zones ( name_en ),
      booking_items ( quantity, equipment ( name_en ) )
    `;

    // Parallel queries
    const [deliveriesToday, pickupsToday, deliveriesTomorrow, pickupsTomorrow, pending, recentInquiries] =
      await Promise.all([
        // (a) Deliveries today
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("rental_start", today)
          .not("status", "eq", "cancelled")
          .eq("is_archived", false)
          .order("booking_number"),
        // (b) Pickups today
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("rental_end", today)
          .not("status", "eq", "cancelled")
          .eq("is_archived", false)
          .order("booking_number"),
        // (c) Tomorrow deliveries
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("rental_start", tomorrow)
          .not("status", "eq", "cancelled")
          .eq("is_archived", false)
          .order("booking_number"),
        // (d) Tomorrow pickups
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("rental_end", tomorrow)
          .not("status", "eq", "cancelled")
          .eq("is_archived", false)
          .order("booking_number"),
        // (e) Pending bookings needing attention
        supabase
          .from("bookings")
          .select(bookingSelect)
          .eq("status", "pending")
          .eq("is_archived", false)
          .order("created_at", { ascending: true }),
        // (f) Unread inquiries last 24h
        supabase
          .from("contact_inquiries")
          .select("id, name, source, subject, message, created_at")
          .eq("is_read", false)
          .gte("created_at", yesterdayISO)
          .order("created_at", { ascending: false }),
      ]);

    const delivRows  = (deliveriesToday.data ?? []) as BookingRow[];
    const pickRows   = (pickupsToday.data ?? []) as BookingRow[];
    const tmDeliv    = (deliveriesTomorrow.data ?? []) as BookingRow[];
    const tmPick     = (pickupsTomorrow.data ?? []) as BookingRow[];
    const pendRows   = (pending.data ?? []) as BookingRow[];
    const inqRows    = (recentInquiries.data ?? []) as InquiryRow[];

    const todayLabel    = formatDateLabel(today);
    const tomorrowLabel = formatShortDate(tomorrow);

    /* ── Build HTML ────────────────────────────────────────────────── */

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Daily Schedule — ${todayLabel}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111827;">

  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="680" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header -->
      <tr><td style="background:${DARK};padding:24px;">
        <p style="margin:0;color:#ffffff;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;opacity:0.8;">📋 Today's Schedule</p>
        <p style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${todayLabel}</p>
        <p style="margin:4px 0 0;color:${ACCENT};font-size:13px;">Movability · Koinis Healthcare Group</p>
      </td></tr>

      <!-- Summary stats -->
      <tr><td style="padding:20px 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:33%;padding:12px;background:#eff6ff;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:${PRIMARY};line-height:1;">${delivRows.length}</p>
              <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;font-weight:600;">Deliveries</p>
            </td>
            <td style="width:8px;"></td>
            <td style="width:33%;padding:12px;background:#fef3c7;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#b45309;line-height:1;">${pickRows.length}</p>
              <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;font-weight:600;">Pickups</p>
            </td>
            <td style="width:8px;"></td>
            <td style="width:33%;padding:12px;background:#fce7f3;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#be185d;line-height:1;">${pendRows.length}</p>
              <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;font-weight:600;">Pending</p>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Today's Deliveries -->
      <tr><td style="padding:24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid ${PRIMARY};padding-left:10px;">
          🚚 Deliveries Today (${delivRows.length})
        </h2>
        ${bookingsTable(delivRows, "No deliveries scheduled today.")}
      </td></tr>

      <!-- Today's Pickups -->
      <tr><td style="padding:0 24px 24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid ${ACCENT};padding-left:10px;">
          📦 Pickups Today (${pickRows.length})
        </h2>
        ${bookingsTable(pickRows, "No pickups scheduled today.")}
      </td></tr>

      <!-- Tomorrow Preview -->
      <tr><td style="padding:0 24px 24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid #7c3aed;padding-left:10px;">
          🔮 Tomorrow Preview — ${tomorrowLabel}
        </h2>
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">Deliveries (${tmDeliv.length})</p>
        ${bookingsTable(tmDeliv, "None")}
        <p style="margin:14px 0 8px;font-size:13px;font-weight:600;color:#374151;">Pickups (${tmPick.length})</p>
        ${bookingsTable(tmPick, "None")}
      </td></tr>

      <!-- Pending -->
      <tr><td style="padding:0 24px 24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid #be185d;padding-left:10px;">
          ⏳ Pending — Needs Attention (${pendRows.length})
        </h2>
        ${pendRows.length > 0 ? `
          <p style="margin:0 0 8px;font-size:12px;color:#991b1b;background:#fee2e2;border:1px solid #fecaca;border-radius:6px;padding:8px 10px;">
            These bookings are awaiting confirmation. Review and confirm or follow up with the customer.
          </p>
        ` : ""}
        ${bookingsTable(pendRows, "All clear — no pending bookings!")}
      </td></tr>

      <!-- New Inquiries -->
      ${inqRows.length > 0 ? `
      <tr><td style="padding:0 24px 24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid #047857;padding-left:10px;">
          📩 New Inquiries (${inqRows.length})
        </h2>
        <p style="margin:0 0 12px;font-size:12px;color:#047857;background:#d1fae5;border:1px solid #a7f3d0;border-radius:6px;padding:8px 10px;">
          Unread partnership or contact inquiries from the last 24 hours.
        </p>
        ${inquiriesTable(inqRows)}
      </td></tr>
      ` : ""}

      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:18px 24px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb;">
        Movability by Koinis Healthcare Group · Athens, Greece<br>
        <a href="https://movability.gr/admin/bookings" style="color:${PRIMARY};text-decoration:none;">Open Admin Dashboard →</a>
      </td></tr>

    </table>
  </td></tr></table>

</body>
</html>`;

    /* ── Send via Resend ───────────────────────────────────────────── */

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Movability <hello@movability.gr>",
        to: [ADMIN_EMAIL],
        subject: `📋 Today's Schedule — ${formatShortDate(today)}: ${delivRows.length} deliveries, ${pickRows.length} pickups`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Failed to send digest", detail: err }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailResult = await resendRes.json();
    console.log(`Daily digest sent for ${today}`, emailResult);

    return new Response(
      JSON.stringify({
        sent: true,
        email_id: emailResult.id,
        date: today,
        today_deliveries: delivRows.length,
        today_pickups: pickRows.length,
        tomorrow_deliveries: tmDeliv.length,
        tomorrow_pickups: tmPick.length,
        pending: pendRows.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      },
    );
  } catch (err) {
    console.error("Digest error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
