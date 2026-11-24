-- weekly-schedule-email-sunday — pg_cron job for the weekly-schedule-email
-- edge function.
--
-- Created directly in the DB (cron.job jobid 10) and never committed; this is
-- the source-controlled copy, synced 13 Nov 2026. Sundays 18:00 UTC.
-- The bearer token is read from Vault (internal_api_key), never inlined.
--
-- To (re)create:  run this file in the SQL Editor.
-- To remove:      SELECT cron.unschedule('weekly-schedule-email-sunday');

SELECT cron.schedule(
  'weekly-schedule-email-sunday',
  '0 18 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/weekly-schedule-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_api_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
$$
);
