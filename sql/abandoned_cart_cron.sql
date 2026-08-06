-- Abandoned-cart recovery — hourly pg_cron job.
--
-- Source-controlled copy of the cron that drives send-abandoned-cart-email.
-- Runs in Supabase via SQL Editor (NOT migrations), same pattern as the
-- daily-digest cron (jobid 3). If you change this, update this file in the
-- same commit.
--
-- ⚠️ BEFORE RUNNING (project doc lessons):
--   1. Deploy the send-abandoned-cart-email edge function first, and turn OFF
--      "Enforce JWT verification" for it — otherwise every call 401s at the
--      gateway (lesson 8).
--   2. REPLACE  YOUR_INTERNAL_API_KEY_HERE  below with the real INTERNAL_API_KEY
--      (the SAME value used by the daily-digest cron / Supabase secret /
--      VITE_INTERNAL_API_KEY). A leftover placeholder silently 401s — cron
--      "succeeded" only means the HTTP request was SENT, not accepted
--      (lessons 6 & 11).
--   3. Only activate AFTER a successful controlled test, because the first run
--      emails the entire current backlog of matching abandoned carts at once.
--
-- Verify after scheduling:
--   SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'abandoned-cart-email';
--   SELECT * FROM cron.job_run_details WHERE jobid = <N> ORDER BY start_time DESC;

SELECT cron.schedule(
  'abandoned-cart-email',
  '0 * * * *',                         -- hourly, on the hour
  $$
  SELECT net.http_post(
    url     := 'https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-abandoned-cart-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_INTERNAL_API_KEY_HERE'
    ),
    body    := jsonb_build_object('booking_id', b.id)
  )
  FROM public.bookings b
  WHERE b.payment_status = 'pending'
    AND b.stripe_session_id IS NOT NULL          -- real checkout attempt only
    AND b.abandoned_email_sent_at IS NULL         -- not already emailed (dedup)
    AND b.created_at < NOW() - INTERVAL '2 hours'  -- give them time to finish first
    AND b.created_at > NOW() - INTERVAL '7 days';  -- don't chase ancient carts
  $$
);

-- To remove/reschedule later:
--   SELECT cron.unschedule('abandoned-cart-email');
