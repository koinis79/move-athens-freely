-- ── 005_fix_create_booking_fn.sql ────────────────────────────────────────────
-- Fixes the ON CONFLICT clause in create_booking().
-- The unique constraint is (equipment_id, booking_id, date), not (equipment_id, date),
-- so ON CONFLICT can't fire — replace with plain INSERT.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_booking(
  p_booking_number    TEXT,
  p_user_id           UUID,
  p_customer_name     TEXT,
  p_customer_email    TEXT,
  p_customer_phone    TEXT,
  p_delivery_zone_id  UUID,
  p_delivery_address  TEXT,
  p_delivery_time_slot TEXT,
  p_delivery_notes    TEXT,
  p_rental_start      DATE,
  p_rental_end        DATE,
  p_num_days          INTEGER,
  p_subtotal          NUMERIC,
  p_delivery_fee      NUMERIC,
  p_total_amount      NUMERIC,
  p_items             JSONB,
  p_availability      JSONB
)
RETURNS TABLE(booking_id UUID, booking_number TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id     UUID;
  v_booking_number TEXT;
  v_item           JSONB;
  v_avail          JSONB;
BEGIN
  -- 1. Insert booking (trigger sets booking_number)
  INSERT INTO public.bookings (
    booking_number,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_zone_id,
    delivery_address,
    delivery_time_slot,
    delivery_notes,
    rental_start,
    rental_end,
    num_days,
    subtotal,
    delivery_fee,
    discount_amount,
    total_amount,
    deposit_amount,
    status,
    payment_status
  ) VALUES (
    p_booking_number,
    p_user_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_delivery_zone_id,
    p_delivery_address,
    p_delivery_time_slot,
    p_delivery_notes,
    p_rental_start,
    p_rental_end,
    p_num_days,
    p_subtotal,
    p_delivery_fee,
    0,
    p_total_amount,
    0,
    'pending',
    'pending'
  )
  RETURNING id, bookings.booking_number
  INTO v_booking_id, v_booking_number;

  -- 2. Insert booking items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.booking_items (
      booking_id,
      equipment_id,
      quantity,
      price_per_day,
      num_days,
      subtotal
    ) VALUES (
      v_booking_id,
      (v_item->>'equipment_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price_per_day')::NUMERIC,
      (v_item->>'num_days')::INTEGER,
      (v_item->>'subtotal')::NUMERIC
    );
  END LOOP;

  -- 3. Insert availability records (plain insert — unique key includes booking_id)
  FOR v_avail IN SELECT * FROM jsonb_array_elements(p_availability)
  LOOP
    INSERT INTO public.equipment_availability (
      equipment_id,
      booking_id,
      date,
      quantity_booked
    ) VALUES (
      (v_avail->>'equipment_id')::UUID,
      v_booking_id,
      (v_avail->>'date')::DATE,
      (v_avail->>'quantity_booked')::INTEGER
    );
  END LOOP;

  RETURN QUERY SELECT v_booking_id, v_booking_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking TO anon, authenticated;
