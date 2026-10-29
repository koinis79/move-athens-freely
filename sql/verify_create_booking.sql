-- Verify the LIVE create_booking contains every price/guard layer.
-- Run after applying supabase/migrations/20261029000000_merge_create_booking.sql,
-- and before any future change to the RPC. Every column must be true.
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
  def LIKE '%ABS(p_total_amount - v_computed_total) > 0.50%'      AS tolerance_050
FROM f;
