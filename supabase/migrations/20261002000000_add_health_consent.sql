-- Explicit consent for the special-requirements free-text field.
--
-- WHY: the field invites things like "narrow doorways", but customers also type
-- conditions into it. Under GDPR Art. 9 health data needs an explicit legal
-- basis, and for this purpose that is Art. 9(2)(a) explicit consent. The
-- checkbox is unticked by default and submission is blocked while the field has
-- content and the box is unticked, so the consent is a real affirmative act.
--
-- We store WHETHER and WHEN, not the wording. If the wording changes later, add
-- a version column rather than reinterpreting old rows.
--
-- NOTE on which column the text lives in: checkout writes the field to
-- bookings.delivery_notes (DeliverySection "specialInstructions" ->
-- p_delivery_notes). The bookings.special_requirements column exists but is NOT
-- written by checkout. The 60-day blanking job must therefore clear
-- delivery_notes, and clears special_requirements too in case anything else
-- ever used it.
--
-- Applied live via the SQL Editor on 2026-10-02; this file is the
-- source-controlled copy.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS health_consent     boolean,
  ADD COLUMN IF NOT EXISTS health_consent_at  timestamptz;

COMMENT ON COLUMN public.bookings.health_consent IS
  'TRUE when the customer ticked the explicit-consent box because they entered free text in special requirements (GDPR Art. 9(2)(a)). NULL when the field was left empty and no consent was needed.';
COMMENT ON COLUMN public.bookings.health_consent_at IS
  'When that consent was given. NULL when no consent was required.';

-- Catches the invalid state directly: consent recorded without a timestamp, or
-- a timestamp without consent.
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_health_consent_coherent;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_health_consent_coherent
  CHECK (
    (health_consent IS NULL     AND health_consent_at IS NULL)
    OR (health_consent IS NOT NULL AND health_consent_at IS NOT NULL)
  );

-- ── Recording the consent ──────────────────────────────────────────────────
-- A plain UPDATE from the browser does NOT work for guest bookings: the RLS
-- policy is (auth.uid() = user_id AND status = 'pending'), and an anonymous
-- booking has user_id NULL, so NULL = NULL is NULL and the write is silently
-- dropped. Same family as docs §2 lesson 9 (anon can INSERT but not SELECT back).
--
-- So: a narrow SECURITY DEFINER function instead of either widening the RLS
-- policy or adding parameters to create_booking. Widening UPDATE on bookings for
-- anonymous callers would expose every column; changing the signature of the
-- price-validating RPC is risk with no benefit.
--
-- The surface is deliberately tiny:
--   * it can only ever set health_consent / health_consent_at
--   * only while health_consent IS NULL, so it cannot be flipped or re-dated
--   * only within 1 hour of the booking being created, so it cannot be used to
--     retroactively mark historic bookings as consented
CREATE OR REPLACE FUNCTION public.record_health_consent(p_booking_number text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.bookings
  SET health_consent = true,
      health_consent_at = now()
  WHERE booking_number = p_booking_number
    AND health_consent IS NULL
    AND created_at > now() - interval '1 hour';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

COMMENT ON FUNCTION public.record_health_consent(text) IS
  'Records GDPR Art. 9(2)(a) consent for a booking''s special-requirements text. Narrow by design: sets only the two consent columns, only while unset, only within an hour of booking creation. Needed because anonymous checkout cannot UPDATE bookings under RLS.';

GRANT EXECUTE ON FUNCTION public.record_health_consent(text) TO anon, authenticated;
