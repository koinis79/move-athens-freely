-- Verify the LIVE create_booking contains every price/guard layer.
-- Run after applying supabase/migrations/20261029000000_merge_create_booking.sql,
-- and before any future change to the RPC. Every column must be true
-- (11 columns since the server-side num_days change).
--
-- History: on 14 Oct 2026 two DB-only migrations rewrote create_booking from an
-- old base and silently dropped the Sunday collection surcharge and the 30-day
-- cap. This query would have caught it.

WITH f AS (
  SELECT pg_get_functiondef(
    'public.create_booking(text,uuid,text,text,text,uuid,text,text,text,date,date,integer,numeric,numeric,numeric,jsonb,jsonb)'::regprocedure
  ) AS def
)
SELECT
  def LIKE '%EXTRACT(DOW FROM p_rental_end)::INTEGER = 0%'       AS collection_surcharge,
  def LIKE '%v_surcharge + v_collection_surcharge%'               AS collection_added_to_fee,
  def LIKE '%NOT public.is_admin()%'                              AS is_admin_exemption,
  def LIKE '%(p_rental_end - p_rental_start) > 30%'               AS cap_30_days,
  def LIKE '%(p_rental_end - p_rental_start) < 0%'                AS reversed_range_guard,
  def LIKE '%public.is_blacklisted(p_customer_email, p_customer_phone)%' AS blacklist,
  def LIKE '%v_computed_total, v_deposit_total,%'                 AS deposit_total_insert,
  def LIKE '%ABS(p_total_amount - v_computed_total) > 0.50%'      AS tolerance_050,
  -- Server-side num_days (29 Oct 2026): items priced from their own dates,
  -- the client's num_days only cross-checked, booking_items stores computed days.
  def LIKE '%v_item_span  := v_item_end - v_item_start%'          AS item_date_pricing,
  def LIKE '%IF v_client_days IS DISTINCT FROM v_item_days THEN%' AS num_days_mismatch_guard,
  def LIKE '%v_item_days := v_days_arr[v_idx]%'                   AS stores_computed_days
FROM f;
