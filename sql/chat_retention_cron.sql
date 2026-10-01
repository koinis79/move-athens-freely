-- Source-controlled copy of the chat-retention cron job.
-- Deletes chat_conversations rows older than 90 days.
--
-- ⚠️ DELIBERATELY NOT USING THE VAULT PATTERN, and that is not an oversight.
-- The abandoned-cart job (sql/abandoned_cart_cron.sql) needs Vault because it
-- makes an outbound net.http_post to an edge function and must carry
-- INTERNAL_API_KEY as a bearer token — lesson 16 exists to keep that key out of
-- cron.job. This job is pure local SQL: no HTTP call, no edge function, no key.
-- Wrapping a DELETE in Vault indirection would invent a secret that does not
-- need to exist, add a moving part that can drift, and protect nothing.
--
-- Run the two sections in order. Section 1 can be run and tested on its own
-- BEFORE you schedule anything.
--
-- Last synced: October 2, 2026.


-- ── 1. The purge function ──────────────────────────────────────────────────
-- A named function rather than an inline DELETE so it can be invoked by hand and
-- its result inspected before the schedule is trusted. Returns the row count, so
-- cron.job_run_details carries evidence of what each run actually did — "the job
-- succeeded" otherwise tells you nothing about whether it deleted anything.

CREATE OR REPLACE FUNCTION public.purge_old_chat_conversations(retention_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted integer;
BEGIN
  DELETE FROM public.chat_conversations
  WHERE created_at < NOW() - (retention_days || ' days')::interval;

  GET DIAGNOSTICS deleted = ROW_COUNT;
  RAISE LOG 'purge_old_chat_conversations: deleted % row(s) older than % days', deleted, retention_days;
  RETURN deleted;
END;
$$;

COMMENT ON FUNCTION public.purge_old_chat_conversations(integer) IS
  'Deletes chat_conversations older than retention_days (default 90). Called by the chat-retention cron job. Returns the number of rows deleted.';

-- Keep it off the public API surface: this is an internal maintenance function,
-- not something the anon or authenticated roles should ever be able to call.
REVOKE ALL ON FUNCTION public.purge_old_chat_conversations(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_old_chat_conversations(integer) FROM anon, authenticated;


-- ── 2. DRY RUN — do this before scheduling ─────────────────────────────────
-- How many rows WOULD go, without deleting anything:
--
--   SELECT count(*) AS would_delete
--   FROM public.chat_conversations
--   WHERE created_at < NOW() - INTERVAL '90 days';
--
-- On a freshly created table this is correctly 0. Once that looks right:
--
--   SELECT public.purge_old_chat_conversations();   -- returns rows deleted


-- ── 3. The schedule ────────────────────────────────────────────────────────
-- 01:30 UTC daily — roughly 03:30 Athens in winter, 04:30 in summer. pg_cron
-- schedules are UTC; it does not follow Greek DST.

SELECT cron.schedule(
  'chat-retention-purge',
  '30 1 * * *',
  $$ SELECT public.purge_old_chat_conversations(90); $$
);


-- ── 4. Verify (do not skip) ────────────────────────────────────────────────
-- The job exists and the command is what you think it is:
--
--   SELECT jobid, jobname, schedule, command, active
--   FROM cron.job WHERE jobname = 'chat-retention-purge';
--
-- After the first firing, confirm it actually ran and what it returned:
--
--   SELECT jobid, status, return_message, start_time, end_time
--   FROM cron.job_run_details
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'chat-retention-purge')
--   ORDER BY start_time DESC LIMIT 5;
--
-- To change the retention window later, reschedule rather than editing in place,
-- and update this file in the same commit:
--
--   SELECT cron.unschedule('chat-retention-purge');
--   -- then re-run section 3 with the new argument
