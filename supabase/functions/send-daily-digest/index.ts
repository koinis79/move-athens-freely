import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL = "info@movability.gr";

// Brand colors
const PRIMARY = "#00838F"; // teal
const ACCENT = "#F57C00";  // orange
const DARK = "#0D2137";

interface BookingRow {
  id: string;
  booking_number: string;
  customer_name: string;
  customer_phone: string | null;
  delivery_address: string | null;
  total_amount: number;
  status: string;
  rental_start: string;
  rental_end: string;
  created_at: string;
  delivery_zones: { name_en: string } | null;
  booking_items: { quantity: number; equipment: { name_en: string } | null }[];
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayStartISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayStartISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function mondayStartISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatDate(iso: string): string {
  const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function bookingsTable(rows: BookingRow[], emptyMsg: string): string {
  if (rows.length === 0) {
    return `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;font-style:italic;">${emptyMsg}</p>`;
  }
  const tr = rows.map((b) => {
    const items = b.booking_items.map(i => `${i.equipment?.name_en ?? "?"} ×${i.quantity}`).join(", ");
    const phone = b.customer_phone ? `<span style="color:#6b7280;"> · ${b.customer_phone}</span>` : "";
    return `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;color:${PRIMARY};white-space:nowrap;">${b.booking_number}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;">
          <strong>${b.customer_name}</strong>${phone}
        </td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;">${items}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;">${b.delivery_zones?.name_en ?? "—"}</td>
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
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left;">Zone</th>
          <th style="padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${tr}</tbody>
    </table>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  // Auth: require service role key OR admin JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  const isServiceRole = token === SUPABASE_SERVICE_ROLE_KEY;
  if (!isServiceRole) {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { "Content-Type": "application/json" },
      });
    }
    const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const today = todayISO();
  const yesterdayStart = yesterdayStartISO();
  const todayStart = todayStartISO();
  const weekStart = mondayStartISO();

  const bookingSelect = `
    id, booking_number, customer_name, customer_phone, delivery_address,
    total_amount, status, rental_start, rental_end, created_at,
    delivery_zones ( name_en ),
    booking_items ( quantity, equipment ( name_en ) )
  `;

  // Parallel queries
  const [completed, deliveries, pickups, pending, weekRevenue] = await Promise.all([
    // Yesterday's completed bookings (status changed to completed in last 24h)
    supabase.from("bookings")
      .select(bookingSelect)
      .eq("status", "completed")
      .gte("updated_at", yesterdayStart)
      .lt("updated_at", todayStart)
      .order("updated_at", { ascending: false }),
    // Today's deliveries (rental_start = today)
    supabase.from("bookings")
      .select(bookingSelect)
      .eq("rental_start", today)
      .in("status", ["confirmed", "preparing", "out_for_delivery"])
      .eq("is_archived", false)
      .order("booking_number"),
    // Today's pickups (rental_end = today)
    supabase.from("bookings")
      .select(bookingSelect)
      .eq("rental_end", today)
      .in("status", ["delivered", "active"])
      .eq("is_archived", false)
      .order("booking_number"),
    // Pending bookings needing attention
    supabase.from("bookings")
      .select(bookingSelect)
      .eq("status", "pending")
      .eq("is_archived", false)
      .order("created_at", { ascending: true }),
    // Week's revenue
    supabase.from("bookings")
      .select("total_amount")
      .gte("created_at", weekStart)
      .eq("payment_status", "paid"),
  ]);

  const completedRows = (completed.data ?? []) as BookingRow[];
  const deliveryRows = (deliveries.data ?? []) as BookingRow[];
  const pickupRows = (pickups.data ?? []) as BookingRow[];
  const pendingRows = (pending.data ?? []) as BookingRow[];
  const weekTotal = (weekRevenue.data ?? []).reduce((s, r: { total_amount: number }) => s + Number(r.total_amount || 0), 0);

  const todayLabel = formatDate(today);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Daily Digest — ${todayLabel}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111827;">

  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="680" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Header -->
      <tr><td style="background:${DARK};padding:24px;">
        <p style="margin:0;color:#ffffff;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;opacity:0.8;">Daily Digest</p>
        <p style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${todayLabel}</p>
        <p style="margin:4px 0 0;color:${ACCENT};font-size:13px;">Movability Admin · Athens</p>
      </td></tr>

      <!-- Summary stats row -->
      <tr><td style="padding:20px 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:25%;padding:12px;background:#eff6ff;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:800;color:${PRIMARY};line-height:1;">${deliveryRows.length}</p>
              <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;font-weight:600;">Deliveries</p>
            </td>
            <td style="width:8px;"></td>
            <td style="width:25%;padding:12px;background:#fef3c7;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#b45309;line-height:1;">${pickupRows.length}</p>
              <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;font-weight:600;">Pickups</p>
            </td>
            <td style="width:8px;"></td>
            <td style="width:25%;padding:12px;background:#fce7f3;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#be185d;line-height:1;">${pendingRows.length}</p>
              <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;font-weight:600;">Pending</p>
            </td>
            <td style="width:8px;"></td>
            <td style="width:25%;padding:12px;background:#d1fae5;border-radius:8px;text-align:center;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#065f46;line-height:1;">€${weekTotal.toLocaleString()}</p>
              <p style="margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;font-weight:600;">Week Revenue</p>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Today's deliveries -->
      <tr><td style="padding:24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid ${PRIMARY};padding-left:10px;">
          🚚 Today's Deliveries (${deliveryRows.length})
        </h2>
        ${bookingsTable(deliveryRows, "No deliveries scheduled today.")}
      </td></tr>

      <!-- Today's pickups -->
      <tr><td style="padding:0 24px 24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid ${ACCENT};padding-left:10px;">
          📦 Today's Pickups (${pickupRows.length})
        </h2>
        ${bookingsTable(pickupRows, "No pickups scheduled today.")}
      </td></tr>

      <!-- Pending bookings -->
      <tr><td style="padding:0 24px 24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid #be185d;padding-left:10px;">
          ⏳ Pending — Needs Attention (${pendingRows.length})
        </h2>
        ${pendingRows.length > 0 ? `
          <p style="margin:0 0 8px;font-size:12px;color:#991b1b;background:#fee2e2;border:1px solid #fecaca;border-radius:6px;padding:8px 10px;">
            These bookings are awaiting confirmation. Review and confirm or follow up with the customer.
          </p>
        ` : ""}
        ${bookingsTable(pendingRows, "No pending bookings — all caught up!")}
      </td></tr>

      <!-- Yesterday's completed -->
      <tr><td style="padding:0 24px 24px;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:700;color:${DARK};border-left:4px solid #065f46;padding-left:10px;">
          ✅ Completed Yesterday (${completedRows.length})
        </h2>
        ${bookingsTable(completedRows, "No bookings completed yesterday.")}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:18px 24px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb;">
        Movability by Koinis Healthcare Group · Athens, Greece<br>
        <a href="https://movability.gr/admin" style="color:${PRIMARY};text-decoration:none;">Open Admin Dashboard →</a>
      </td></tr>

    </table>
  </td></tr></table>

</body>
</html>`;

  // Send via Resend
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Movability Admin <noreply@movability.gr>",
      to: [ADMIN_EMAIL],
      subject: `📊 Daily Digest — ${todayLabel} (${deliveryRows.length} deliveries, ${pickupRows.length} pickups, ${pendingRows.length} pending)`,
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
  console.log(`Daily digest sent for ${todayLabel}`, emailResult);

  return new Response(JSON.stringify({
    sent: true,
    email_id: emailResult.id,
    summary: {
      date: today,
      today_deliveries: deliveryRows.length,
      today_pickups: pickupRows.length,
      pending: pendingRows.length,
      completed_yesterday: completedRows.length,
      week_revenue: weekTotal,
    },
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});
