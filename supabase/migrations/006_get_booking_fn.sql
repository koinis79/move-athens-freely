-- ── 006_get_booking_fn.sql ───────────────────────────────────────────────────
-- SECURITY DEFINER function to fetch a booking by booking_number.
-- The booking_number in the URL acts as a secret token — only the customer
-- who received the confirmation URL can access their booking.
-- This avoids permissive SELECT policies while still serving the confirmation page.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_booking_by_number(p_booking_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id',                   b.id,
    'booking_number',       b.booking_number,
    'customer_name',        b.customer_name,
    'customer_email',       b.customer_email,
    'customer_phone',       b.customer_phone,
    'delivery_address',     b.delivery_address,
    'delivery_time_slot',   b.delivery_time_slot,
    'rental_start',         b.rental_start,
    'rental_end',           b.rental_end,
    'subtotal',             b.subtotal,
    'delivery_fee',         b.delivery_fee,
    'total_amount',         b.total_amount,
    'status',               b.status,
    'created_at',           b.created_at,
    'delivery_zones',       CASE WHEN dz.id IS NOT NULL THEN
                              jsonb_build_object('name_en', dz.name_en, 'delivery_fee', dz.delivery_fee)
                            ELSE NULL END,
    'booking_items',        COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'quantity',   bi.quantity,
        'num_days',   bi.num_days,
        'subtotal',   bi.subtotal,
        'equipment',  jsonb_build_object(
          'name_en',  e.name_en,
          'slug',     e.slug
        )
      ))
      FROM public.booking_items bi
      JOIN public.equipment e ON e.id = bi.equipment_id
      WHERE bi.booking_id = b.id
    ), '[]'::jsonb)
  )
  INTO v_booking
  FROM public.bookings b
  LEFT JOIN public.delivery_zones dz ON dz.id = b.delivery_zone_id
  WHERE b.booking_number = p_booking_number;

  RETURN v_booking;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_by_number(TEXT) TO anon, authenticated;
