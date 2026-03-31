-- 1. Secure admin_dashboard_stats view: recreate as SECURITY INVOKER and add RLS-like protection
-- Since it's a view and RLS doesn't apply to views directly, we'll drop and recreate with security_invoker
DROP VIEW IF EXISTS public.admin_dashboard_stats;
CREATE VIEW public.admin_dashboard_stats
WITH (security_invoker = true)
AS
SELECT
  (SELECT count(*) FROM bookings WHERE status = ANY(ARRAY['delivered','in_use'])) AS active_rentals,
  (SELECT count(*) FROM bookings WHERE rental_start = CURRENT_DATE AND status = 'confirmed') AS todays_deliveries,
  (SELECT count(*) FROM bookings WHERE status = 'pending_payment') AS pending_requests,
  (SELECT COALESCE(sum(total_amount), 0) FROM bookings WHERE date(created_at) = CURRENT_DATE AND payment_status = 'paid') AS todays_revenue,
  (SELECT count(*) FROM bookings WHERE rental_end >= CURRENT_DATE AND rental_end <= CURRENT_DATE + '3 days'::interval AND status = ANY(ARRAY['delivered','in_use'])) AS upcoming_pickups;

-- Revoke public access, grant only to authenticated
REVOKE ALL ON public.admin_dashboard_stats FROM anon, authenticated;
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;

-- 2. Restrict equipment_availability INSERT to only via the create_booking function (service role)
-- Remove the overly permissive "Anyone can insert" policy
DROP POLICY IF EXISTS "Anyone can insert availability records" ON public.equipment_availability;

-- 3. Storage bucket RLS policies
CREATE POLICY "Public can read storage objects"
  ON storage.objects FOR SELECT
  USING (true);

CREATE POLICY "Admins can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('assets', 'equipment-images') AND public.is_admin());

CREATE POLICY "Admins can update files"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('assets', 'equipment-images') AND public.is_admin());

CREATE POLICY "Admins can delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('assets', 'equipment-images') AND public.is_admin());

-- 4. Fix mutable search_path on functions that lack it
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  random_part TEXT;
BEGIN
  -- Use random alphanumeric booking numbers to prevent enumeration
  random_part := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10));
  NEW.booking_number := 'MOV-' || random_part;
  RETURN NEW;
END;
$$;