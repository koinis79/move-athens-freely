-- app_errors — one central log for "something went wrong", read by the hourly
-- send-error-alerts digest.
--
-- WHY: the claude-chat 401 ran for two weeks and the Sunday-surcharge break in
-- create_booking ran for 15 days (see CLAUDE.md) before anyone noticed. Both
-- were visible only in function logs nobody reads. Every edge function now
-- writes here on failure, the checkout reports failed create_booking calls via
-- report_client_error(), and send-error-alerts emails one digest per hour when
-- there is anything new.
--
-- WHAT GOES IN context: identifiers only — booking_number, equipment slug, zone
-- slug, dates, HTTP status, Stripe event type. NEVER card data, full API keys,
-- customer names/emails/phones, addresses, or the special-requirements text
-- (health data, GDPR Art. 9). The edge-function helper and report_client_error()
-- both enforce this; keep it that way when adding call sites.
--
-- RLS: admins read only. No INSERT/UPDATE/DELETE policy for anyone — edge
-- functions write with the service role (bypasses RLS) and the browser can only
-- reach the table through report_client_error() (SECURITY DEFINER, whitelisted
-- keys, rate-limited).

CREATE TABLE IF NOT EXISTS public.app_errors (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- Edge function slug ('claude-chat', 'stripe-webhook', ...) or 'client:checkout'
  -- / 'client:admin-new-booking' for browser reports.
  source       text NOT NULL,
  severity     text NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  message      text NOT NULL,
  context      jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Set by send-error-alerts once the row has gone out in a digest email.
  notified_at  timestamptz
);

-- The digest's only query: "what has not been emailed yet".
CREATE INDEX IF NOT EXISTS app_errors_unnotified_idx
  ON public.app_errors (created_at)
  WHERE notified_at IS NULL;

-- Rate limiting in report_client_error() and admin listing.
CREATE INDEX IF NOT EXISTS app_errors_source_created_at_idx
  ON public.app_errors (source, created_at DESC);

ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read app errors" ON public.app_errors;
CREATE POLICY "Admins can read app errors"
  ON public.app_errors
  FOR SELECT
  USING (public.is_admin());

-- Belt and braces: even without a policy, don't leave table privileges lying
-- around for the API roles.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.app_errors FROM anon, authenticated;

COMMENT ON TABLE public.app_errors IS
  'Central error log. Edge functions insert with the service role; the browser only via report_client_error(). Emailed hourly by send-error-alerts. context holds identifiers only — never card data, API keys, personal data or health text.';
COMMENT ON COLUMN public.app_errors.notified_at IS
  'When send-error-alerts included this row in a digest email. NULL = not yet emailed.';


-- ── Browser reports: report_client_error() ─────────────────────────────────
-- Callable by anon, because a failed checkout is usually a guest.
--
-- The surface is deliberately narrow:
--   * source is one of two fixed values, prefixed 'client:' so a browser can
--     never impersonate an edge function in the digest
--   * context keeps ONLY whitelisted keys (dates, zone slug, item slugs, error
--     code), each type-checked and length-capped; anything else is dropped
--   * the message is capped at 300 chars and anything that looks like an email
--     address or a phone number is masked, in case a future error message
--     echoes customer input
--   * rate limit: the same message for the same source is stored at most once
--     per 10 minutes, and at most 30 client rows per hour in total. A flood
--     therefore costs at most 30 rows/hour, and the digest still shows that
--     something is failing.
CREATE OR REPLACE FUNCTION public.report_client_error(
  p_source  text,
  p_message text,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_source  text;
  v_message text;
  v_ctx     jsonb := '{}'::jsonb;
  v_items   jsonb;
BEGIN
  IF p_source NOT IN ('checkout', 'admin-new-booking') THEN
    RETURN false;
  END IF;
  v_source := 'client:' || p_source;

  v_message := left(coalesce(p_message, ''), 300);
  v_message := regexp_replace(v_message, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[email]', 'g');
  v_message := regexp_replace(v_message, '\+?[0-9][0-9 ()-]{7,}[0-9]', '[number]', 'g');
  IF v_message = '' THEN
    RETURN false;
  END IF;

  -- Global cap.
  IF (SELECT count(*) FROM public.app_errors
      WHERE source LIKE 'client:%' AND created_at > now() - interval '1 hour') >= 30 THEN
    RETURN false;
  END IF;

  -- Same failure, same source, recently: already logged.
  IF EXISTS (SELECT 1 FROM public.app_errors
             WHERE source = v_source AND message = v_message
               AND created_at > now() - interval '10 minutes') THEN
    RETURN false;
  END IF;

  -- Whitelist the context. Dates must look like dates; slugs like slugs.
  IF jsonb_typeof(p_context) = 'object' THEN
    IF p_context->>'start_date' ~ '^\d{4}-\d{2}-\d{2}$' THEN
      v_ctx := v_ctx || jsonb_build_object('start_date', p_context->>'start_date');
    END IF;
    IF p_context->>'end_date' ~ '^\d{4}-\d{2}-\d{2}$' THEN
      v_ctx := v_ctx || jsonb_build_object('end_date', p_context->>'end_date');
    END IF;
    IF p_context->>'zone' ~ '^[a-z0-9-]{1,60}$' THEN
      v_ctx := v_ctx || jsonb_build_object('zone', p_context->>'zone');
    END IF;
    IF p_context->>'code' ~ '^[A-Za-z0-9_]{1,10}$' THEN
      v_ctx := v_ctx || jsonb_build_object('code', p_context->>'code');
    END IF;
    IF jsonb_typeof(p_context->'items') = 'array' THEN
      SELECT jsonb_agg(e) INTO v_items
      FROM (
        SELECT jsonb_build_object(
                 'slug', i->>'slug',
                 'start_date', CASE WHEN i->>'start_date' ~ '^\d{4}-\d{2}-\d{2}$' THEN i->>'start_date' END,
                 'end_date',   CASE WHEN i->>'end_date'   ~ '^\d{4}-\d{2}-\d{2}$' THEN i->>'end_date'   END,
                 'quantity',   CASE WHEN i->>'quantity' ~ '^\d{1,3}$' THEN (i->>'quantity')::int END
               ) AS e
        FROM jsonb_array_elements(p_context->'items') WITH ORDINALITY AS t(i, n)
        WHERE jsonb_typeof(i) = 'object'
          AND i->>'slug' ~ '^[a-z0-9-]{1,80}$'
          AND n <= 20
      ) s;
      IF v_items IS NOT NULL THEN
        v_ctx := v_ctx || jsonb_build_object('items', v_items);
      END IF;
    END IF;
  END IF;

  INSERT INTO public.app_errors (source, severity, message, context)
  VALUES (v_source, 'error', v_message, v_ctx);
  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.report_client_error(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_client_error(text, text, jsonb) TO anon, authenticated;


-- ── Digest helpers for send-error-alerts (service role only) ───────────────
-- The edge function cannot read the cron / net schemas through PostgREST, so
-- these two functions do the reading and the bookkeeping.
--
-- Cursor for "failed cron runs since the last check". One row.
CREATE TABLE IF NOT EXISTS public.alert_state (
  id               integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_checked_at  timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.alert_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.alert_state ENABLE ROW LEVEL SECURITY;
-- No policies: service role / SECURITY DEFINER only.

-- Returns everything that should go in the next digest, as of p_until.
--   errors        — app_errors rows not yet emailed (capped at 500)
--   cron_failures — cron.job_run_details rows that did not succeed
--   http_failures — pg_net responses with HTTP >= 400, a timeout or a transport
--                   error. These matter because a cron job that calls an edge
--                   function via net.http_post "succeeds" in cron as soon as the
--                   request is queued; a 500 from the function only shows up
--                   here. pg_net keeps responses for 6 hours, so an hourly
--                   check sees each one.
CREATE OR REPLACE FUNCTION public.alert_digest_pending(p_until timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_since timestamptz;
BEGIN
  SELECT last_checked_at INTO v_since FROM public.alert_state WHERE id = 1;

  RETURN jsonb_build_object(
    'since', v_since,
    'until', p_until,
    'errors', coalesce((
      SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at)
      FROM (
        SELECT id, created_at, source, severity, message, context
        FROM public.app_errors
        WHERE notified_at IS NULL AND created_at <= p_until
        ORDER BY created_at
        LIMIT 500
      ) e
    ), '[]'::jsonb),
    'cron_failures', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
               'jobname', coalesce(j.jobname, 'job ' || d.jobid),
               'status', d.status,
               'start_time', d.start_time,
               'message', left(coalesce(d.return_message, ''), 300)
             ) ORDER BY d.start_time)
      FROM cron.job_run_details d
      LEFT JOIN cron.job j ON j.jobid = d.jobid
      WHERE d.start_time > v_since AND d.start_time <= p_until
        AND d.status = 'failed'
    ), '[]'::jsonb),
    'http_failures', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
               'id', r.id,
               'created', r.created,
               'status_code', r.status_code,
               'timed_out', r.timed_out,
               'message', left(coalesce(r.error_msg, r.content, ''), 300)
             ) ORDER BY r.created)
      FROM net._http_response r
      WHERE r.created > v_since AND r.created <= p_until
        AND (r.status_code >= 400 OR r.timed_out OR r.error_msg IS NOT NULL)
    ), '[]'::jsonb)
  );
END;
$function$;

-- Called only after the email went out (or there was nothing to send), so a
-- Resend failure leaves everything pending for the next run.
CREATE OR REPLACE FUNCTION public.alert_digest_mark_sent(p_until timestamptz, p_error_ids bigint[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.app_errors
  SET notified_at = now()
  WHERE id = ANY(p_error_ids) AND notified_at IS NULL;

  UPDATE public.alert_state SET last_checked_at = p_until WHERE id = 1;
END;
$function$;

REVOKE ALL ON FUNCTION public.alert_digest_pending(timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.alert_digest_mark_sent(timestamptz, bigint[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.alert_digest_pending(timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.alert_digest_mark_sent(timestamptz, bigint[]) TO service_role;
