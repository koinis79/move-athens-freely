
CREATE OR REPLACE FUNCTION public.create_booking(
  p_booking_number text,
  p_user_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_zone_id uuid,
  p_delivery_address text,
  p_delivery_time_slot text,
  p_delivery_notes text,
  p_rental_start date,
  p_rental_end date,
  p_num_days integer,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total_amount numeric,
  p_items jsonb,
  p_availability jsonb
)
RETURNS TABLE(booking_id uuid, booking_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_booking_id     UUID;
  v_booking_number TEXT;
  v_item           JSONB;
  v_avail          JSONB;
  v_computed_subtotal NUMERIC := 0;
  v_computed_total    NUMERIC;
  v_eq_price         NUMERIC;
  v_item_subtotal    NUMERIC;
  v_item_qty         INTEGER;
  v_item_days        INTEGER;
  v_delivery_fee     NUMERIC := 0;
BEGIN
  -- 1. Compute correct delivery fee from delivery_zones table
  IF p_delivery_zone_id IS NOT NULL THEN
    SELECT dz.delivery_fee INTO v_delivery_fee
    FROM public.delivery_zones dz
    WHERE dz.id = p_delivery_zone_id AND dz.is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid delivery zone';
    END IF;
  END IF;

  -- 2. Validate each item's price against the equipment table
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_qty  := (v_item->>'quantity')::INTEGER;
    v_item_days := (v_item->>'num_days')::INTEGER;

    -- Look up the correct tier price from equipment
    SELECT CASE
      WHEN v_item_days <= 3  THEN e.price_tier1
      WHEN v_item_days <= 7  THEN e.price_tier2
      WHEN v_item_days <= 14 THEN e.price_tier3
      ELSE e.price_tier4
    END INTO v_eq_price
    FROM public.equipment e
    WHERE e.id = (v_item->>'equipment_id')::UUID AND e.is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Equipment not found or inactive: %', v_item->>'equipment_id';
    END IF;

    v_item_subtotal := v_eq_price * v_item_qty;
    v_computed_subtotal := v_computed_subtotal + v_item_subtotal;
  END LOOP;

  v_computed_total := v_computed_subtotal + v_delivery_fee;

  -- 3. Reject if client-supplied total differs from server-computed total
  IF ABS(p_total_amount - v_computed_total) > 0.50 THEN
    RAISE EXCEPTION 'Price mismatch: expected %, got %', v_computed_total, p_total_amount;
  END IF;

  -- 4. Insert booking with SERVER-COMPUTED prices
  INSERT INTO public.bookings (
    booking_number, user_id, customer_name, customer_email, customer_phone,
    delivery_zone_id, delivery_address, delivery_time_slot, delivery_notes,
    rental_start, rental_end, num_days,
    subtotal, delivery_fee, discount_amount, total_amount, deposit_amount,
    status, payment_status
  ) VALUES (
    p_booking_number, p_user_id, p_customer_name, p_customer_email, p_customer_phone,
    p_delivery_zone_id, p_delivery_address, p_delivery_time_slot, p_delivery_notes,
    p_rental_start, p_rental_end, p_num_days,
    v_computed_subtotal, v_delivery_fee, 0, v_computed_total, 0,
    'pending', 'pending'
  )
  RETURNING id, bookings.booking_number
  INTO v_booking_id, v_booking_number;

  -- 5. Insert booking items with SERVER-COMPUTED prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_qty  := (v_item->>'quantity')::INTEGER;
    v_item_days := (v_item->>'num_days')::INTEGER;

    SELECT CASE
      WHEN v_item_days <= 3  THEN e.price_tier1
      WHEN v_item_days <= 7  THEN e.price_tier2
      WHEN v_item_days <= 14 THEN e.price_tier3
      ELSE e.price_tier4
    END INTO v_eq_price
    FROM public.equipment e
    WHERE e.id = (v_item->>'equipment_id')::UUID;

    INSERT INTO public.booking_items (
      booking_id, equipment_id, quantity, price_per_day, num_days, subtotal
    ) VALUES (
      v_booking_id,
      (v_item->>'equipment_id')::UUID,
      v_item_qty,
      v_eq_price,
      v_item_days,
      v_eq_price * v_item_qty
    );
  END LOOP;

  -- 6. Insert availability records
  FOR v_avail IN SELECT * FROM jsonb_array_elements(p_availability)
  LOOP
    INSERT INTO public.equipment_availability (
      equipment_id, booking_id, date, quantity_booked
    ) VALUES (
      (v_avail->>'equipment_id')::UUID,
      v_booking_id,
      (v_avail->>'date')::DATE,
      (v_avail->>'quantity_booked')::INTEGER
    );
  END LOOP;

  RETURN QUERY SELECT v_booking_id, v_booking_number;
END;
$function$;
