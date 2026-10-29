-- Security-deposit hold columns on bookings — pulled from the DB.
--
-- Applied directly to the live DB on 14 Oct 2026 (version 20261014124646 in
-- supabase_migrations.schema_migrations) without being committed. Used by the
-- deposit-holds edge function (hourly cron job "deposit-holds-hourly"),
-- create-checkout-session (saves the card) and stripe-webhook (records it).
--
-- The CREATE OR REPLACE FUNCTION create_booking(...) in the original migration
-- (adds the deposit_amount total) is omitted here: it was built on the
-- pre-September base and dropped the Sunday collection surcharge and the 30-day
-- cap. Superseded by 20261029000000_merge_create_booking.sql.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS deposit_hold_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS deposit_hold_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS deposit_hold_placed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deposit_hold_error TEXT,
  ADD COLUMN IF NOT EXISTS deposit_hold_warned BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.bookings.deposit_hold_status IS 'none | scheduled (card saved, hold pending) | held (authorized, not captured) | failed | released | captured | expired';
