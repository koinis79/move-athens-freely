// Weekly driver schedule email (Mon–Sun of the coming week).
// Triggered by pg_cron on Sunday evening. Auth: Bearer INTERNAL_API_KEY.
// Optional body: { "to": ["..."], "start": "YYYY-MM-DD" } for manual runs / tests.

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
const APP_ERROR_SOURCE = "weekly-schedule-email";
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
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

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
  if (error) {
    await logAppError(`Weekly schedule query failed: ${error.message}`, { monday, sunday });
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

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
  if (!res.ok) {
    // The driver gets no schedule for the week.
    await logAppError(`Weekly schedule email rejected by Resend: HTTP ${res.status} ${out.slice(0, 300)}`, { monday, sunday });
  }
  return new Response(JSON.stringify({ ok: res.ok, monday, sunday, deliveries, collections, resend: out }), {
    status: res.ok ? 200 : 502, headers: { "Content-Type": "application/json" },
  });
});
