-- Retention job (a): blank the special-requirements free text 60 days after the
-- rental ends.
--
-- Same shape as sql/chat_retention_cron.sql, and NOT the Vault pattern for the
-- same reason: this is local SQL with no HTTP call and no API key, so Vault would
-- invent a secret that protects nothing (lesson 16 is about keeping
-- INTERNAL_API_KEY out of cron.job, which does not apply here).
--
-- ⚠️ WHICH COLUMN: checkout writes this field to bookings.delivery_notes
-- (DeliverySection "specialInstructions" -> p_delivery_notes). The
-- bookings.special_requirements column exists but checkout never writes it. Both
-- are cleared, because the admin panel or a future form could use either and a
-- retention job that misses the column actually in use is worse than no job.
--
-- The booking row itself is kept — it is accounting data (docs §9: revenue
-- reporting reads bookings). Only the free text that may contain health
-- information is removed, and the consent columns are kept as the record that
-- consent was given while the data was held.
--
-- Run section 1, then the dry run, then section 3.
-- Last synced: October 2, 2026.


-- ── 1. The purge function ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.purge_old_special_requirements(retention_days integer DEFAULT 60)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  blanked integer;
BEGIN
  UPDATE public.bookings
  SET delivery_notes = NULL,
      special_requirements = NULL
  WHERE rental_end < (CURRENT_DATE - retention_days)
    AND (delivery_notes IS NOT NULL OR special_requirements IS NOT NULL);

  GET DIAGNOSTICS blanked = ROW_COUNT;
  RAISE LOG 'purge_old_special_requirements: blanked % booking(s) whose rental ended over % days ago', blanked, retention_days;
  RETURN blanked;
END;
$$;

COMMENT ON FUNCTION public.purge_old_special_requirements(integer) IS
  'Blanks bookings.delivery_notes and bookings.special_requirements for rentals that ended more than retention_days ago (default 60). Keeps the booking row, which is accounting data. Called by the special-requirements-retention cron job.';

REVOKE ALL ON FUNCTION public.purge_old_special_requirements(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_old_special_requirements(integer) FROM anon, authenticated;


-- ── 2. DRY RUN — do this first ─────────────────────────────────────────────
-- How many rows WOULD be blanked, and how far back they go:
--
--   SELECT count(*) AS would_blank,
--          min(rental_end) AS oldest,
--          max(rental_end) AS newest
--   FROM public.bookings
--   WHERE rental_end < (CURRENT_DATE - 60)
--     AND (delivery_notes IS NOT NULL OR special_requirements IS NOT NULL);
--
-- ⚠️ EXPECT A LARGE FIRST RUN. This job has never run, so the backlog is every
-- booking older than 60 days that carries notes. Look at the count before running
-- it, and spot-check a few rows if you want a record of what is about to go —
-- this is irreversible.


-- ── 3. The schedule ────────────────────────────────────────────────────────
-- 02:10 UTC daily, 20 minutes after the chat-retention job so the two never
-- interleave in the logs.

SELECT cron.schedule(
  'special-requirements-retention',
  '10 2 * * *',
  $$ SELECT public.purge_old_special_requirements(60); $$
);


-- ── 4. Verify ──────────────────────────────────────────────────────────────
--   SELECT jobid, jobname, schedule, command, active
--   FROM cron.job WHERE jobname = 'special-requirements-retention';
--
--   SELECT jobid, status, return_message, start_time
--   FROM cron.job_run_details
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'special-requirements-retention')
--   ORDER BY start_time DESC LIMIT 5;
--
-- To change the window, unschedule and re-run section 3; update this file in the
-- same commit.
