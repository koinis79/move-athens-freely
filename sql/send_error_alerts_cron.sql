-- send-error-alerts-hourly — pg_cron job for the send-error-alerts edge function.
--
-- Runs at :15 every hour, after the :00 abandoned-cart and :05 deposit-holds
-- runs, so their failures land in the same digest. The function emails only
-- when there is something to report.
-- The bearer token is read from Vault (internal_api_key), never inlined.
--
-- To (re)create:  run this file in the SQL Editor.
-- To remove:      SELECT cron.unschedule('send-error-alerts-hourly');

SELECT cron.schedule(
  'send-error-alerts-hourly',
  '15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-error-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_api_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
$$
);
