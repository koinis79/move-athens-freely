-- deposit-holds-hourly — pg_cron job for the deposit-holds edge function.
--
-- Created directly in the DB on 14 Oct 2026 (cron.job jobid 9) and never
-- committed; this is the source-controlled copy. Runs at :05 every hour.
-- The bearer token is read from Vault (internal_api_key), never inlined.
--
-- To (re)create:  run this file in the SQL Editor.
-- To remove:      SELECT cron.unschedule('deposit-holds-hourly');

SELECT cron.schedule(
  'deposit-holds-hourly',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/deposit-holds',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_api_key')
    ),
    body := '{"action":"run"}'::jsonb
  );
$$
);
