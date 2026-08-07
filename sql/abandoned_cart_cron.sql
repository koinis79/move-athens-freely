-- Source-controlled copy of the abandoned-cart-email cron job (jobid 6).
-- Uses Supabase Vault for the INTERNAL_API_KEY (secret name:
-- 'internal_api_key') rather than a plaintext key in the command —
-- see lesson 16. If this cron is ever unscheduled/rescheduled in
-- Supabase, update this file in the same commit.
-- Last synced: August 6, 2026.

SELECT cron.schedule(
  'abandoned-cart-email',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-abandoned-cart-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'internal_api_key')
    ),
    body := jsonb_build_object('booking_id', b.id)
  )
  FROM bookings b
  WHERE b.payment_status = 'pending'
    AND b.stripe_session_id IS NOT NULL
    AND b.abandoned_email_sent_at IS NULL
    AND b.created_at < NOW() - INTERVAL '2 hours'
    AND b.created_at > NOW() - INTERVAL '7 days';
  $$
);
