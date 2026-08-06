-- Abandoned-cart recovery: dedup guard column.
-- Mirrors review_requested_at — set once when the recovery email is sent so the
-- hourly pg_cron job never emails the same stuck booking twice.
-- Applied live via SQL on 2026-08-06; this file is the source-controlled copy.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS abandoned_email_sent_at timestamptz;

COMMENT ON COLUMN public.bookings.abandoned_email_sent_at IS
  'When the abandoned-cart recovery email was sent (dedup guard; same pattern as review_requested_at).';
