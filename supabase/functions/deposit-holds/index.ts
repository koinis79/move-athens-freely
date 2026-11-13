// Security-deposit holds (authorization only, never auto-captured).
//
// POST { action: "run" }                         — cron job (hourly)
//   1. Places a hold on the saved card for bookings delivering today/tomorrow
//      (tomorrow only after 17:00 Athens time, to maximise the 7-day window).
//   2. Releases holds for bookings marked completed or cancelled.
//   3. Warns admin when a hold is about to expire (Stripe auths last ~7 days).
// POST { action: "release", booking_number }       — release a hold now
// POST { action: "capture", booking_number, amount? } — capture (all or part) for damage
//
// Auth: Authorization: Bearer <INTERNAL_API_KEY>

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
const APP_ERROR_SOURCE = "deposit-holds";
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

const ADMIN_EMAIL = "info@koinis.gr";
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

function athensNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const today = `${get("year")}-${get("month")}-${get("day")}`;
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return { today, tomorrow: d.toISOString().slice(0, 10), hour: Number(get("hour")) % 24 };
}

async function emailAdmin(subject: string, text: string) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Movability <hello@movability.gr>", to: [ADMIN_EMAIL], subject, text }),
    });
    // Previously unchecked: a rejected email vanished without trace.
    if (!res.ok) await logAppError(`Admin email rejected by Resend: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`, { subject });
  } catch (e) {
    await logAppError(`Admin email failed: ${(e as Error).message}`, { subject });
  }
}

Deno.serve(async (req) => {
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token !== Deno.env.get("INTERNAL_API_KEY")) return json({ error: "Unauthorized" }, 401);

  let body: { action?: string; booking_number?: string; amount?: number } = {};
  try { body = await req.json(); } catch { /* empty body = run */ }
  const action = body.action ?? "run";

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const log: string[] = [];

  // ---------- manual actions ----------
  if (action === "release" || action === "capture") {
    if (!body.booking_number) return json({ error: "booking_number required" }, 400);
    const { data: b } = await supabase.from("bookings")
      .select("id, booking_number, deposit_hold_intent_id, deposit_hold_status, deposit_amount")
      .eq("booking_number", body.booking_number).single();
    if (!b?.deposit_hold_intent_id || b.deposit_hold_status !== "held") {
      return json({ error: "No active hold for this booking", status: b?.deposit_hold_status ?? null }, 400);
    }
    try {
      if (action === "release") {
        await stripe.paymentIntents.cancel(b.deposit_hold_intent_id);
        await supabase.from("bookings").update({ deposit_hold_status: "released" }).eq("id", b.id);
        return json({ ok: true, booking: b.booking_number, released: Number(b.deposit_amount) });
      }
      const amt = body.amount ? Math.round(body.amount * 100) : undefined;
      const pi = await stripe.paymentIntents.capture(b.deposit_hold_intent_id, amt ? { amount_to_capture: amt } : {});
      await supabase.from("bookings").update({ deposit_hold_status: "captured" }).eq("id", b.id);
      return json({ ok: true, booking: b.booking_number, captured: (pi.amount_received ?? 0) / 100 });
    } catch (e) {
      await logAppError(`Manual ${action} failed: ${(e as Error).message}`, { booking_number: b.booking_number });
      return json({ error: (e as Error).message }, 500);
    }
  }

  // ---------- scheduled run ----------
  const { today, tomorrow, hour } = athensNow();
  const latestStart = hour >= 17 ? tomorrow : today;

  // 1. Place holds
  const { data: toHold, error: toHoldErr } = await supabase.from("bookings")
    .select("id, booking_number, customer_name, deposit_amount, stripe_customer_id, stripe_payment_method_id, rental_start")
    .eq("deposit_hold_status", "scheduled")
    .in("status", ["confirmed", "delivered"])
    .gt("deposit_amount", 0)
    .lte("rental_start", latestStart)
    .gte("rental_end", today);
  if (toHoldErr) await logAppError(`Could not load bookings to hold: ${toHoldErr.message}`);

  for (const b of toHold ?? []) {
    try {
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(Number(b.deposit_amount) * 100),
        currency: "eur",
        customer: b.stripe_customer_id!,
        payment_method: b.stripe_payment_method_id!,
        capture_method: "manual",
        off_session: true,
        confirm: true,
        description: `Refundable security deposit (hold) — ${b.booking_number}`,
        metadata: { booking_number: b.booking_number, type: "security_deposit_hold" },
      }, { idempotencyKey: `deposit-hold-${b.id}` });

      if (pi.status === "requires_capture") {
        await supabase.from("bookings").update({
          deposit_hold_status: "held", deposit_hold_intent_id: pi.id,
          deposit_hold_placed_at: new Date().toISOString(), deposit_hold_error: null,
        }).eq("id", b.id);
        log.push(`HELD ${b.booking_number} €${b.deposit_amount}`);
      } else {
        throw new Error(`Unexpected status ${pi.status}`);
      }
    } catch (e) {
      const msg = (e as Error).message;
      await supabase.from("bookings").update({ deposit_hold_status: "failed", deposit_hold_error: msg }).eq("id", b.id);
      log.push(`FAILED ${b.booking_number}: ${msg}`);
      await logAppError(`Deposit hold failed: ${msg}`, { booking_number: b.booking_number, rental_start: b.rental_start }, "warning");
      await emailAdmin(
        `⚠️ Εγγύηση ΔΕΝ δεσμεύτηκε — ${b.booking_number}`,
        `Η δέσμευση εγγύησης €${b.deposit_amount} για την κράτηση ${b.booking_number} (${b.customer_name}, παράδοση ${b.rental_start}) απέτυχε.\n\nΑιτία: ${msg}\n\nΟ οδηγός πρέπει να εισπράξει την εγγύηση στην παράδοση (POS ή μετρητά).`,
      );
    }
  }

  // 2. Release holds for finished bookings
  const { data: toRelease } = await supabase.from("bookings")
    .select("id, booking_number, deposit_hold_intent_id")
    .eq("deposit_hold_status", "held")
    .in("status", ["completed", "cancelled"]);

  for (const b of toRelease ?? []) {
    try {
      await stripe.paymentIntents.cancel(b.deposit_hold_intent_id!);
      await supabase.from("bookings").update({ deposit_hold_status: "released" }).eq("id", b.id);
      log.push(`RELEASED ${b.booking_number}`);
    } catch (e) {
      const msg = (e as Error).message;
      // Already expired/cancelled on Stripe's side → nothing is held any more.
      await supabase.from("bookings").update({ deposit_hold_status: "expired", deposit_hold_error: msg }).eq("id", b.id);
      log.push(`RELEASE-ERR ${b.booking_number}: ${msg}`);
      await logAppError(`Deposit release failed (marked expired): ${msg}`, { booking_number: b.booking_number }, "warning");
    }
  }

  // Cancelled before the hold was placed → nothing to hold.
  await supabase.from("bookings").update({ deposit_hold_status: "none" })
    .eq("deposit_hold_status", "scheduled").eq("status", "cancelled");

  // 3. Expiry warning (Stripe card authorisations last ~7 days)
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString();
  const { data: expiring } = await supabase.from("bookings")
    .select("id, booking_number, customer_name, deposit_amount, rental_end")
    .eq("deposit_hold_status", "held")
    .eq("deposit_hold_warned", false)
    .lt("deposit_hold_placed_at", sixDaysAgo);

  for (const b of expiring ?? []) {
    await emailAdmin(
      `⏳ Η δέσμευση εγγύησης λήγει αύριο — ${b.booking_number}`,
      `Η δέσμευση €${b.deposit_amount} για την ${b.booking_number} (${b.customer_name}) λήγει σε ~1 μέρα (όριο Stripe 7 ημερών), ενώ η ενοικίαση λήγει ${b.rental_end}.\nΑν υπάρχει πρόβλημα με το ενοικιαζόμενο, η χρέωση (capture) πρέπει να γίνει σήμερα.`,
    );
    await supabase.from("bookings").update({ deposit_hold_warned: true }).eq("id", b.id);
    log.push(`WARNED ${b.booking_number}`);
  }

  return json({ ok: true, today, hour, results: log });
});
