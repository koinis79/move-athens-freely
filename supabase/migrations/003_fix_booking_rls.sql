-- ── 003_fix_booking_rls.sql ──────────────────────────────────────────────────
-- Fix RLS policies for guest checkout.
-- The initial schema had correct policies but was missing explicit GRANT
-- statements so the anon role could not INSERT into bookings/booking_items.
-- ─────────────────────────────────────────────────────────────────────────────

-- Grant INSERT to anon (guest) and authenticated roles
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT INSERT ON public.booking_items TO anon, authenticated;
GRANT INSERT ON public.equipment_availability TO anon, authenticated;

-- Grant SELECT so guests can retrieve their own booking after creation
GRANT SELECT ON public.bookings TO anon, authenticated;
GRANT SELECT ON public.booking_items TO anon, authenticated;
GRANT SELECT ON public.delivery_zones TO anon, authenticated;

-- Grant UPDATE so authenticated users can update their own pending bookings
GRANT UPDATE ON public.bookings TO authenticated;

-- ── Drop and recreate bookings policies cleanly ───────────────────────────────
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create a booking (guest checkout)" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own pending bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

-- SELECT: own bookings (match by user_id if logged in, or by email for guests)
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.jwt() ->> 'email' = customer_email
    OR public.is_admin()
  );

-- INSERT: anyone including anonymous guests
CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- UPDATE: owner can update their pending booking
CREATE POLICY "Users can update their own pending bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- ALL: admins can do everything
CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Drop and recreate booking_items policies cleanly ─────────────────────────
DROP POLICY IF EXISTS "Users can view their own booking items" ON public.booking_items;
DROP POLICY IF EXISTS "Anyone can insert booking items" ON public.booking_items;
DROP POLICY IF EXISTS "Admins can manage all booking items" ON public.booking_items;

-- SELECT: items belonging to your own bookings
CREATE POLICY "Users can view their own booking items"
  ON public.booking_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_items.booking_id
        AND (
          b.user_id = auth.uid()
          OR auth.jwt() ->> 'email' = b.customer_email
          OR public.is_admin()
        )
    )
  );

-- INSERT: anyone (guest or logged-in) can insert items for any booking
CREATE POLICY "Anyone can insert booking items"
  ON public.booking_items FOR INSERT
  WITH CHECK (true);

-- ALL: admins
CREATE POLICY "Admins can manage all booking items"
  ON public.booking_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── equipment_availability: also needs anon insert ───────────────────────────
DROP POLICY IF EXISTS "System can insert availability on booking" ON public.equipment_availability;

CREATE POLICY "Anyone can insert availability records"
  ON public.equipment_availability FOR INSERT
  WITH CHECK (true);
