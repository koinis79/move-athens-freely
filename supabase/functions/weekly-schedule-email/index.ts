// Weekly driver schedule email (Mon–Sun of the coming week).
// Triggered by pg_cron on Sunday evening. Auth: Bearer INTERNAL_API_KEY.
// Optional body: { "to": ["..."], "start": "YYYY-MM-DD" } for manual runs / tests.

import { createClient } from "npm:@supabase/supabase-js@2";

const RECIPIENTS = ["giannoulakis@koinis.gr"];
const CC = ["vasileios@koinis.gr"];

const EQUIPMENT_EL: Record<string, string> = {
  "Manual Wheelchair": "Χειροκίνητο αναπηρικό αμαξίδιο",
  "Transit Wheelchair": "Transit wheelchair",
  "Lightweight Folding Wheelchair": "Ελαφρύ πτυσσόμενο αμαξίδιο",
  "Foldable Power Wheelchair": "Πτυσσόμενο ηλεκτρικό αμαξίδιο",
  "Electric Mobility Scooter": "Scooter Apollo",
  "Foldable Travel Scooter": "Πτυσσόμενο scooter Aegle",
  "Rollator Walker": "Rollator",
  "Knee Walker (Knee Scooter)": "Knee walker",
  "Folding Walking Frame": "Περιπατητήρας",
  "Portable Oxygen Concentrator": "Φορητός συμπυκνωτής οξυγόνου",
};
const DAYS_EL = ["ΚΥΡΙΑΚΗ", "ΔΕΥΤΕΡΑ", "ΤΡΙΤΗ", "ΤΕΤΑΡΤΗ", "ΠΕΜΠΤΗ", "ΠΑΡΑΣΚΕΥΗ", "ΣΑΒΒΑΤΟ"];
const SLOT_EL: Record<string, string> = { morning: "πρωί", daytime: "ημέρα", evening: "βράδυ" };

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const athensToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Athens", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

Deno.serve(async (req) => {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token !== Deno.env.get("INTERNAL_API_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  let body: { to?: string[]; cc?: string[]; start?: string } = {};
  try { body = await req.json(); } catch { /* defaults */ }

  // Coming week: next Monday .. Sunday (if run on Sunday, Monday = tomorrow).
  const today = athensToday();
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay();
  const monday = body.start ?? addDays(today, dow === 0 ? 1 : (8 - dow) % 7 || 7);
  const sunday = addDays(monday, 6);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: rows, error } = await supabase
    .from("bookings")
    .select(`booking_number, customer_name, customer_phone, rental_start, rental_end, status, payment_status,
             amount_due, deposit_amount, deposit_hold_status, delivery_address, delivery_time_slot, delivery_notes,
             booking_items ( quantity, equipment ( name_en ) )`)
    .not("status", "in", "(cancelled,completed)")
    .or(`and(rental_start.gte.${monday},rental_start.lte.${sunday}),and(rental_end.gte.${monday},rental_end.lte.${sunday})`);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  type Move = { day: string; kind: "ΠΑΡΑΔΟΣΗ" | "ΠΑΡΑΛΑΒΗ"; b: any };
  const moves: Move[] = [];
  for (const b of rows ?? []) {
    if (b.rental_start >= monday && b.rental_start <= sunday) moves.push({ day: b.rental_start, kind: "ΠΑΡΑΔΟΣΗ", b });
    if (b.rental_end >= monday && b.rental_end <= sunday) moves.push({ day: b.rental_end, kind: "ΠΑΡΑΛΑΒΗ", b });
  }

  let n = 0, deliveries = 0, collections = 0;
  const warnings: string[] = [];
  const lines: string[] = ["Καλησπέρα Γιώργο,", "", "Οι παραδόσεις και παραλαβές της εβδομάδας:", ""];

  for (let i = 0; i < 7; i++) {
    const day = addDays(monday, i);
    const dayIdx = new Date(`${day}T00:00:00Z`).getUTCDay();
    lines.push(`═══ ${DAYS_EL[dayIdx]} ${ddmm(day)} ═══`, "");
    const todays = moves
      .filter((m) => m.day === day)
      .sort((a, c) => (a.kind === c.kind ? 0 : a.kind === "ΠΑΡΑΔΟΣΗ" ? -1 : 1));
    if (!todays.length) { lines.push("Καμία κίνηση", ""); continue; }
    for (const m of todays) {
      n++;
      m.kind === "ΠΑΡΑΔΟΣΗ" ? deliveries++ : collections++;
      const b = m.b;
      const items = (b.booking_items ?? []).map((it: any) => {
        const name = EQUIPMENT_EL[it.equipment?.name_en] ?? it.equipment?.name_en ?? "?";
        return it.quantity > 1 ? `${name} x${it.quantity}` : name;
      }).join(" + ");
      const slot = m.kind === "ΠΑΡΑΔΟΣΗ" && b.delivery_time_slot ? ` (${SLOT_EL[b.delivery_time_slot] ?? b.delivery_time_slot})` : "";
      lines.push(`${n}) ${m.kind}${slot} — ${String(b.delivery_address ?? "").replace(/\s+/g, " ").trim()} (${b.booking_number})`);
      lines.push(`- Είδος: ${items}`);
      lines.push(`- Πελάτης: ${b.customer_name}${b.customer_phone ? `, ${b.customer_phone}` : ""}`);
      if (m.kind === "ΠΑΡΑΔΟΣΗ") {
        const due = Number(b.amount_due ?? 0);
        lines.push(`- ΕΙΣΠΡΑΞΗ: ${b.payment_status === "paid" || due <= 0 ? "Χωρίς είσπραξη (πληρωμένο)" : `€${due} υπόλοιπο`}`);
        if (Number(b.deposit_amount) > 0 && b.deposit_hold_status === "failed") {
          const w = `⚠️ ${b.booking_number}: η δέσμευση εγγύησης απέτυχε — να εισπραχθεί €${b.deposit_amount} στην παράδοση`;
          lines.push(`- ${w}`); warnings.push(w);
        }
      }
      if (b.delivery_notes) lines.push(`- Σημειώσεις: ${String(b.delivery_notes).replace(/\s+/g, " ").trim()}`);
      if (dayIdx === 0) lines.push("- ΚΥΡΙΑΚΗ: τα καταστήματα είναι κλειστά");
      lines.push("");
    }
  }

  lines.push(`Σύνοψη: ${deliveries} παραδόσεις, ${collections} παραλαβές.`);
  if (warnings.length) lines.push("", ...warnings);
  lines.push("", "Σημ.: διάβασε τις σημειώσεις κάθε κίνησης — εκεί γράφονται οι αλλαγές ώρας/διεύθυνσης.", "", "Ευχαριστώ,", "Βασίλης");

  const subject = `Εβδομαδιαίο πρόγραμμα Movability — Δευτέρα ${ddmm(monday)} έως Κυριακή ${ddmm(sunday)}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Movability <hello@movability.gr>",
      to: body.to ?? RECIPIENTS,
      cc: body.cc ?? CC,
      subject,
      text: lines.join("\n"),
    }),
  });
  const out = await res.text();
  return new Response(JSON.stringify({ ok: res.ok, monday, sunday, deliveries, collections, resend: out }), {
    status: res.ok ? 200 : 502, headers: { "Content-Type": "application/json" },
  });
});
