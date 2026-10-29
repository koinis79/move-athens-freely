-- customer_blacklist + is_blacklisted() — pulled from the DB.
--
-- Applied directly to the live DB on 14 Oct 2026 (version 20261014121130 in
-- supabase_migrations.schema_migrations) without being committed. This file is
-- the source-controlled copy, with two deliberate omissions:
--
-- 1. The seed INSERT INTO customer_blacklist (names, emails, phone numbers and
--    reasons of real customers) is NOT reproduced. This repo is PUBLIC; that
--    data is personal data (GDPR) and lives only in the DB. Manage rows in the
--    SQL Editor, never here.
-- 2. The CREATE OR REPLACE FUNCTION create_booking(...) in the original
--    migration is omitted. It was rewritten from the pre-September base and
--    dropped the Sunday collection surcharge and the 30-day cap; it is
--    superseded by 20261029000000_merge_create_booking.sql, which produces the
--    same final state on replay.

CREATE TABLE IF NOT EXISTS public.customer_blacklist (
  id SERIAL PRIMARY KEY,
  customer_name TEXT,
  email TEXT,
  phone TEXT,
  reason TEXT,
  added_by TEXT DEFAULT 'Vasilis',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.customer_blacklist ENABLE ROW LEVEL SECURITY;
-- no public policies: only service role / SECURITY DEFINER functions can read it

CREATE OR REPLACE FUNCTION public.is_blacklisted(p_email TEXT, p_phone TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customer_blacklist bl
    WHERE (bl.email IS NOT NULL AND p_email IS NOT NULL AND LOWER(TRIM(bl.email)) = LOWER(TRIM(p_email)))
       OR (bl.phone IS NOT NULL AND p_phone IS NOT NULL
           AND LENGTH(REGEXP_REPLACE(p_phone, '\D', '', 'g')) >= 8
           AND RIGHT(REGEXP_REPLACE(bl.phone, '\D', '', 'g'), 9) = RIGHT(REGEXP_REPLACE(p_phone, '\D', '', 'g'), 9))
  );
$$;
REVOKE ALL ON FUNCTION public.is_blacklisted(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
