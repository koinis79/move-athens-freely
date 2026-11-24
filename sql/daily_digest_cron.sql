-- daily-digest-email — pg_cron job for the send-daily-digest edge function.
--
-- Created directly in the DB (cron.job jobid 3) with the bearer token pasted
-- into the command in plaintext. The token was the same value as Vault's
-- internal_api_key, so this reads it from Vault instead, like deposit-holds.
-- Schedule unchanged: 05:30 UTC daily.
--
-- cron.schedule() with an existing job name updates that job in place.
--
-- To (re)create:  run this file in the SQL Editor.
-- To remove:      SELECT cron.unschedule('daily-digest-email');

SELECT cron.schedule(
  'daily-digest-email',
  '30 5 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-daily-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_api_key')
    ),
    body := '{}'::jsonb
  );
$$
);
