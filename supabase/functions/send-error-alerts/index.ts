// send-error-alerts — hourly digest of everything that went wrong.
//
// Called by the send-error-alerts-hourly cron (sql/send_error_alerts_cron.sql).
// Collects, via alert_digest_pending():
//   * app_errors rows not yet emailed (edge functions + checkout reports)
//   * cron.job_run_details runs that failed since the last check
//   * pg_net responses with HTTP >= 400 / timeout since the last check — a
//     cron job calling an edge function "succeeds" in cron even when the
//     function returns 500, so this is where those show up
// and sends ONE email via Resend to ALERT_EMAIL. Each group (one per source)
// leads with plain language for the owner — what broke, who it affects, what
// to do (see EXPLAIN) — with the technical line (count, latest message,
// context) underneath in small grey text. Urgent groups (customers can't pay /
// payment not recorded) come first with a red label; groups made only of TEST
// or "info" rows go last under "For information only". Nothing to report = no
// email.
//
// Never silent: if Resend fails, the failure is logged to app_errors and the
// function logs, nothing is marked as sent, and the next hourly run retries
// with everything still pending (including the Resend failure itself).
//
// POST {}                  — normal run (cron)
// POST { "dry_run": true } — build the email and return it, send nothing,
//                            mark nothing
//
// Auth: Authorization: Bearer <INTERNAL_API_KEY>

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
const APP_ERROR_SOURCE = "send-error-alerts";
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

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

type AppError = {
  id: number;
  created_at: string;
  source: string;
  severity: string;
  message: string;
  context: Record<string, unknown>;
};
type CronFailure = { jobname: string; status: string; start_time: string; message: string };
type HttpFailure = { id: number; created: string; status_code: number | null; timed_out: boolean | null; message: string };
type Pending = {
  since: string;
  until: string;
  errors: AppError[];
  cron_failures: CronFailure[];
  http_failures: HttpFailure[];
};

type Group = {
  source: string;
  count: number;
  worst: string;
  latestAt: string;
  latestMessage: string;
  latestContext?: Record<string, unknown>;
  // Info / TEST rows never share a group with real errors from the same
  // source, so a test can't hide or inflate a real problem.
  infoOnly: boolean;
  // Every row is a "TEST:" row (from x-alert-test).
  testOnly: boolean;
};

const SEVERITY_RANK: Record<string, number> = { error: 3, warning: 2, info: 1 };

/* ── Plain-language explanations ─────────────────────────────────────────────
 * The digest is read by the owner, not a developer. Each group leads with
 * three plain lines (what broke / who it affects / what to do); the technical
 * line follows in small grey text. `headline` is the short phrase used in the
 * subject when this is the most serious group. URGENT = customers may not be
 * able to pay, or a payment may not be recorded.
 */
type Explain = { headline: string; what: string; who: string; todo: string; urgent?: boolean };

const EXPLAIN: Record<string, Explain> = {
  "checkout": {
    urgent: true,
    headline: "Customers may not be able to pay",
    what: "Customers hit an error at checkout and may not have been able to pay.",
    who: "Customers — possibly lost bookings.",
    todo: "Open the site and try a checkout up to the Stripe payment page; tell Claude.",
  },
  "create-checkout-session": {
    urgent: true,
    headline: "Customers can't open the payment page",
    what: "The Stripe payment page could not be opened.",
    who: "Customers — they can't pay.",
    todo: "Urgent: test a checkout now; tell Claude.",
  },
  "stripe-webhook": {
    urgent: true,
    headline: "A payment may not be recorded",
    what: "A payment went through on Stripe but the booking may not be updated in our system.",
    who: "Customers — a paid booking may show as unpaid or be missing.",
    todo: "Compare today's Stripe payments with the bookings in admin.",
  },
  "send-booking-confirmation": {
    headline: "A customer didn't get their confirmation email",
    what: "A customer did not get their booking confirmation email.",
    who: "That customer.",
    todo: "Check the booking in admin and email the customer manually.",
  },
  "deposit-holds": {
    headline: "A security deposit hold had a problem",
    what: "The security deposit hold on a card failed or was not released.",
    who: "A customer's deposit.",
    todo: "Check that booking's deposit in Stripe.",
  },
  "claude-chat": {
    headline: "The website chat isn't answering",
    what: "The website chat assistant failed to answer.",
    who: "Visitors using the chat.",
    todo: "Open the chat and ask a question; if it stays silent, check the Anthropic credit and API key.",
  },
  "send-contact-notification": {
    headline: "A contact-form message may not have reached you",
    what: "A contact-form message may not have reached us.",
    who: "A customer waiting for a reply.",
    todo: "Check the contact messages in admin.",
  },
  "send-abandoned-cart-email": {
    headline: "Checkout reminder emails weren't sent",
    what: "Reminder emails to people who left the checkout were not sent.",
    who: "Nobody yet — possibly lost sales, not urgent.",
    todo: "Nothing today; tell Claude if it keeps happening.",
  },
  "send-review-request": {
    headline: "Review-request emails weren't sent",
    what: "Review-request emails were not sent.",
    who: "Nobody yet — not urgent.",
    todo: "Nothing today; tell Claude if it keeps happening.",
  },
  "send-daily-digest": {
    headline: "Your daily schedule email didn't go out",
    what: "Your own daily schedule email did not go out.",
    who: "Staff — you won't have today's schedule by email.",
    todo: "Check today's bookings in admin directly.",
  },
  "weekly-schedule-email": {
    headline: "The weekly schedule email didn't go out",
    what: "The weekly schedule email did not go out.",
    who: "Staff — the driver won't have the week's schedule by email.",
    todo: "Check the week's bookings in admin directly.",
  },
  "admin-new-booking": {
    headline: "Creating a booking in admin failed",
    what: "Creating a booking from the admin failed.",
    who: "Staff.",
    todo: "Try again; tell Claude if it repeats.",
  },
  "send-error-alerts": {
    headline: "The alert system had trouble sending",
    what: "The alert system itself had trouble sending.",
    who: "Nobody yet — but alerts may be delayed.",
    todo: "Tell Claude.",
  },
};

// cron job name → how the owner would describe it.
const CRON_NAMES: Record<string, string> = {
  "deposit-holds-hourly": "the hourly deposit check",
  "abandoned-cart-email": "the hourly checkout-reminder emails",
  "send-error-alerts-hourly": "the hourly alert check",
  "daily-digest-email": "your daily schedule email",
  "weekly-schedule-email-sunday": "the Sunday weekly schedule email",
  "chat-retention-purge": "the nightly chat clean-up",
  "special-requirements-retention": "the nightly clean-up of special requirements",
};

const PG_NET_SOURCE = "cron → edge function (pg_net)";

function explain(source: string): Explain {
  // Browser reports are stored as "client:checkout" / "client:admin-new-booking".
  const key = source.replace(/^client:/, "");
  if (EXPLAIN[key]) return EXPLAIN[key];
  if (source.startsWith("cron: ") || source === PG_NET_SOURCE) {
    const job = source.startsWith("cron: ") ? source.slice(6) : "";
    const name = job ? CRON_NAMES[job] ?? `the scheduled job "${job}"` : "";
    return {
      headline: "A scheduled job failed",
      what: name ? `An automatic scheduled job failed (${name}).` : "An automatic scheduled job failed.",
      who: "Nobody yet — depends on the job.",
      todo: "Tell Claude.",
    };
  }
  return {
    headline: `Unexpected error in ${source}`,
    what: `An unexpected error in ${source}.`,
    who: "Not known yet.",
    todo: "Forward this email to Claude.",
  };
}

function athensTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Athens", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function groupPending(p: Pending): Group[] {
  const groups = new Map<string, Group>();
  const add = (source: string, severity: string, at: string, message: string, context?: Record<string, unknown>) => {
    const test = message.startsWith("TEST:");
    const info = severity === "info" || test;
    const key = info ? `${source}\u0000info` : source;
    const g = groups.get(key);
    if (!g) {
      groups.set(key, { source, count: 1, worst: severity, latestAt: at, latestMessage: message, latestContext: context, infoOnly: info, testOnly: test });
      return;
    }
    g.count++;
    g.testOnly &&= test;
    if ((SEVERITY_RANK[severity] ?? 0) > (SEVERITY_RANK[g.worst] ?? 0)) g.worst = severity;
    if (at >= g.latestAt) {
      g.latestAt = at;
      g.latestMessage = message;
      g.latestContext = context;
    }
  };

  for (const e of p.errors) add(e.source, e.severity, e.created_at, e.message, e.context);
  for (const c of p.cron_failures) add(`cron: ${c.jobname}`, "error", c.start_time, c.message || c.status);
  for (const h of p.http_failures) {
    const what = h.timed_out ? "timed out" : h.status_code ? `HTTP ${h.status_code}` : "request failed";
    add(PG_NET_SOURCE, "error", h.created, `${what}: ${h.message}`);
  }

  // Urgent first, then by severity and count; information-only groups last.
  const rank = (g: Group) => (g.infoOnly ? 0 : explain(g.source).urgent ? 2 : 1);
  return [...groups.values()].sort(
    (a, b) =>
      rank(b) - rank(a) ||
      (SEVERITY_RANK[b.worst] ?? 0) - (SEVERITY_RANK[a.worst] ?? 0) ||
      b.count - a.count,
  );
}

// What to show for a group: a test-only group says so instead of describing
// a failure that did not happen.
function explainGroup(g: Group): Explain {
  const x = explain(g.source);
  if (!g.testOnly) return x;
  return {
    headline: `Test message (${x.headline.charAt(0).toLowerCase()}${x.headline.slice(1)})`,
    what: "A test of the alert system — nothing actually broke.",
    who: "Nobody.",
    todo: "Nothing.",
  };
}

function technicalLine(g: Group): string {
  return `${g.source} — ${g.count}× (${g.worst}), latest ${athensTime(g.latestAt)}: ${g.latestMessage}`;
}

function contextLine(g: Group): string {
  return g.latestContext && Object.keys(g.latestContext).length ? JSON.stringify(g.latestContext) : "";
}

function buildEmail(p: Pending, groups: Group[]) {
  const total = groups.reduce((s, g) => s + g.count, 0);
  const problems = groups.filter((g) => !g.infoOnly);
  const problemCount = problems.reduce((s, g) => s + g.count, 0);
  const infoGroups = groups.filter((g) => g.infoOnly);
  const window = `${athensTime(p.since)} – ${athensTime(p.until)} (Athens time)`;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  // Groups are sorted most serious first, so the first problem group leads.
  const lead = problems[0];
  const subject = !lead
    ? `Movability: for information only (${plural(total, "item")})`
    : explain(lead.source).urgent
      ? `Movability ⚠ ${explain(lead.source).headline} (${plural(problemCount, "problem")})`
      : `Movability: ${explain(lead.source).headline} (${plural(problemCount, "problem")})`;

  const intro = problemCount
    ? `${plural(problemCount, "problem")} between ${window}.`
    : `Nothing needs action between ${window}; the items below are for information only.`;

  /* ── Plain text ─────────────────────────────────────────────────────────── */
  const textGroup = (g: Group) => {
    const x = explainGroup(g);
    const ctx = contextLine(g);
    return [
      `${x.urgent && !g.infoOnly ? "URGENT — " : ""}${x.headline}`,
      `  What broke:      ${x.what}`,
      `  Who it affects:  ${x.who}`,
      `  What to do:      ${x.todo}`,
      `  Technical: ${technicalLine(g)}`,
      ...(ctx ? [`  Context: ${ctx}`] : []),
      "",
    ];
  };

  const text = [
    intro,
    "",
    ...problems.flatMap(textGroup),
    ...(infoGroups.length ? ["── For information only ──", "", ...infoGroups.flatMap(textGroup)] : []),
    "Full rows: Supabase → Table editor → app_errors (filter notified_at).",
  ].join("\n");

  /* ── HTML ───────────────────────────────────────────────────────────────── */
  const htmlGroup = (g: Group) => {
    const x = explainGroup(g);
    const urgent = x.urgent && !g.infoOnly;
    const colour = g.infoOnly ? "#9ca3af" : urgent ? "#b42318" : g.worst === "error" ? "#d97706" : "#ca8a04";
    const ctx = contextLine(g);
    return `
    <div style="border-left:4px solid ${colour};background:#fafafa;padding:12px 14px;margin:0 0 14px">
      ${urgent ? `<span style="display:inline-block;background:#b42318;color:#fff;font-size:11px;font-weight:700;letter-spacing:.04em;padding:2px 8px;border-radius:4px;margin-bottom:6px">URGENT</span>` : ""}
      <div style="font-size:15px;font-weight:700;margin:0 0 8px">${escapeHtml(x.headline)}</div>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:2px 12px 2px 0;color:#555;white-space:nowrap;vertical-align:top">What broke</td><td style="padding:2px 0">${escapeHtml(x.what)}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#555;white-space:nowrap;vertical-align:top">Who it affects</td><td style="padding:2px 0">${escapeHtml(x.who)}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#555;white-space:nowrap;vertical-align:top">What to do</td><td style="padding:2px 0"><strong>${escapeHtml(x.todo)}</strong></td></tr>
      </table>
      <div style="margin-top:8px;font-size:11px;color:#9ca3af;line-height:1.4">
        ${escapeHtml(technicalLine(g))}${ctx ? `<br><code style="font-size:11px;color:#9ca3af">${escapeHtml(ctx)}</code>` : ""}
      </div>
    </div>`;
  };

  const html = `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:14px;color:#222;max-width:720px">
  <p>${escapeHtml(intro)}</p>
  ${problems.map(htmlGroup).join("")}
  ${infoGroups.length ? `<h3 style="font-size:13px;color:#6b7280;font-weight:600;margin:22px 0 10px;text-transform:uppercase;letter-spacing:.05em">For information only</h3>${infoGroups.map(htmlGroup).join("")}` : ""}
  <p style="color:#9ca3af;font-size:11px">Full rows: Supabase → Table editor → app_errors (filter notified_at).</p>
</div>`;

  return { subject, text, html, total };
}

Deno.serve(async (req) => {
  const alertTest = await alertTestResponse(req);
  if (alertTest) return alertTest;

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token !== Deno.env.get("INTERNAL_API_KEY")) return json({ error: "Unauthorized" }, 401);

  let body: { dry_run?: boolean } = {};
  try { body = await req.json(); } catch { /* empty body = normal run */ }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const until = new Date().toISOString();

  const { data, error } = await supabase.rpc("alert_digest_pending", { p_until: until });
  if (error || !data) {
    await logAppError(`alert_digest_pending failed: ${error?.message ?? "no data"}`);
    return json({ error: "collect_failed" }, 500);
  }
  const pending = data as Pending;
  const groups = groupPending(pending);

  if (!groups.length) {
    // Nothing to report: advance the cron cursor, send nothing.
    if (!body.dry_run) await supabase.rpc("alert_digest_mark_sent", { p_until: until, p_error_ids: [] });
    return json({ ok: true, sent: false, problems: 0 });
  }

  const email = buildEmail(pending, groups);
  if (body.dry_run) return json({ ok: true, dry_run: true, ...email });

  // ALERT_EMAIL may hold several comma-separated addresses; Resend wants each
  // as its own array element ("a@x, b@y" as one string is a 422).
  const to = (Deno.env.get("ALERT_EMAIL") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!to.length || !resendKey) {
    await logAppError(`Cannot send alert digest: ${!to.length ? "ALERT_EMAIL" : "RESEND_API_KEY"} secret is not set`);
    return json({ error: "not_configured" }, 500);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Movability <hello@movability.gr>",
        to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      await logAppError(`Resend rejected the alert digest: HTTP ${res.status} ${detail}`, { problems: email.total });
      // 500 so the pg_net response also records the failure.
      return json({ error: "resend_failed", status: res.status }, 500);
    }
  } catch (e) {
    await logAppError(`Resend request failed: ${e instanceof Error ? e.message : String(e)}`, { problems: email.total });
    return json({ error: "resend_failed" }, 500);
  }

  const { error: markErr } = await supabase.rpc("alert_digest_mark_sent", {
    p_until: until,
    p_error_ids: pending.errors.map((e) => e.id),
  });
  if (markErr) {
    // The email went out; the worst case is the same rows appear again next hour.
    await logAppError(`alert_digest_mark_sent failed: ${markErr.message}`, {}, "warning");
  }

  return json({ ok: true, sent: true, problems: email.total, subject: email.subject });
});
