// send-error-alerts — hourly digest of everything that went wrong.
//
// Called by the send-error-alerts-hourly cron (sql/send_error_alerts_cron.sql).
// Collects, via alert_digest_pending():
//   * app_errors rows not yet emailed (edge functions + checkout reports)
//   * cron.job_run_details runs that failed since the last check
//   * pg_net responses with HTTP >= 400 / timeout since the last check — a
//     cron job calling an edge function "succeeds" in cron even when the
//     function returns 500, so this is where those show up
// and sends ONE email via Resend to ALERT_EMAIL, grouped by source with counts
// and the latest message. Nothing to report = no email.
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

type Group = { source: string; count: number; worst: string; latestAt: string; latestMessage: string; latestContext?: Record<string, unknown> };

const SEVERITY_RANK: Record<string, number> = { error: 3, warning: 2, info: 1 };

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
    const g = groups.get(source);
    if (!g) {
      groups.set(source, { source, count: 1, worst: severity, latestAt: at, latestMessage: message, latestContext: context });
      return;
    }
    g.count++;
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
    add("cron → edge function (pg_net)", "error", h.created, `${what}: ${h.message}`);
  }

  return [...groups.values()].sort(
    (a, b) => (SEVERITY_RANK[b.worst] ?? 0) - (SEVERITY_RANK[a.worst] ?? 0) || b.count - a.count,
  );
}

function buildEmail(p: Pending, groups: Group[]) {
  const total = groups.reduce((s, g) => s + g.count, 0);
  const subject = `Movability: ${total} problem${total === 1 ? "" : "s"} in the last hour`;
  const window = `${athensTime(p.since)} – ${athensTime(p.until)} (Athens time)`;

  const text = [
    `${total} problem${total === 1 ? "" : "s"} between ${window}.`,
    "",
    ...groups.flatMap((g) => [
      `${g.source} — ${g.count}× (${g.worst})`,
      `  Latest ${athensTime(g.latestAt)}: ${g.latestMessage}`,
      ...(g.latestContext && Object.keys(g.latestContext).length
        ? [`  Context: ${JSON.stringify(g.latestContext)}`]
        : []),
      "",
    ]),
    "Full rows: Supabase → Table editor → app_errors (filter notified_at).",
  ].join("\n");

  const rows = groups.map((g) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top"><strong>${escapeHtml(g.source)}</strong><br><span style="color:${g.worst === "error" ? "#b42318" : "#8a6d00"}">${g.worst}</span></td>
        <td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top;text-align:right">${g.count}×</td>
        <td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top">
          <span style="color:#666">${athensTime(g.latestAt)}</span><br>${escapeHtml(g.latestMessage)}
          ${g.latestContext && Object.keys(g.latestContext).length
            ? `<br><code style="font-size:12px;color:#555">${escapeHtml(JSON.stringify(g.latestContext))}</code>`
            : ""}
        </td>
      </tr>`).join("");

  const html = `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:14px;color:#222;max-width:720px">
  <p>${total} problem${total === 1 ? "" : "s"} between ${escapeHtml(window)}.</p>
  <table style="border-collapse:collapse;width:100%">
    <tr><th align="left" style="padding:8px;border-bottom:2px solid #ccc">Source</th><th align="right" style="padding:8px;border-bottom:2px solid #ccc">Count</th><th align="left" style="padding:8px;border-bottom:2px solid #ccc">Latest</th></tr>
    ${rows}
  </table>
  <p style="color:#666;font-size:12px">Full rows: Supabase → Table editor → app_errors (filter notified_at).</p>
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

  const to = Deno.env.get("ALERT_EMAIL");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!to || !resendKey) {
    await logAppError(`Cannot send alert digest: ${!to ? "ALERT_EMAIL" : "RESEND_API_KEY"} secret is not set`);
    return json({ error: "not_configured" }, 500);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Movability <hello@movability.gr>",
        to: [to],
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
