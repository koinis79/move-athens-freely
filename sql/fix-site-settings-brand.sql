-- Fix the stale brand/contact values in site_settings before the chatbot reads them.
-- Run in the Supabase SQL Editor.
--
-- WHY THIS IS A BLOCKER: the chatbot feeds site_settings into its system prompt.
-- As it stands it would hand customers an email address at a domain we do not own
-- ("moveability.gr" vs "movability.gr") and call the business by a misspelled name.
--
-- These rows are currently read by NO application code (grep for "site_settings"
-- across src/ and supabase/functions/ returns only the generated types file), which
-- is why the drift went unnoticed. The chatbot will be the first consumer.
--
-- Canonical values verified against, not assumed:
--   name    -> "Movability" is the brand (StructuredData.tsx:22, docs §13); the
--              "by Koinis Healthcare" suffix is kept as-is — Koinis Healthcare
--              since 1982 is the documented trust anchor (§13).
--   email   -> info@movability.gr, the public contact that forwards to
--              info@koinis.gr (StructuredData.tsx:27, docs §4). NOT hello@, which
--              is the Resend *sender* address only.
--   og_image-> /images/og-default.jpg DOES NOT EXIST. It returns 200 only because
--              vercel.json rewrites every unmatched path to the SPA — the real
--              content-type is text/html, not an image. The actual asset is
--              /og-image.png (public/og-image.png), and OG images must be absolute
--              URLs for crawlers, on the www host that serves 200 (the apex 308s).
--   suffix  -> "| Movability" matches what SEOHead actually emits site-wide.
--
-- Unchanged on purpose: phone, whatsapp, hours (all already correct).
--
-- These are MERGE updates (`value || jsonb_build_object(...)`), not full-row
-- replacements, so only the named keys move. Anything edited between the audit and
-- this run survives.

BEGIN;

UPDATE public.site_settings
SET value = value || jsonb_build_object(
      'name',  'Movability by Koinis Healthcare',
      'email', 'info@movability.gr'
    )
WHERE key = 'business_info';

UPDATE public.site_settings
SET value = value || jsonb_build_object(
      'title_suffix', '| Movability',
      'og_image',     'https://www.movability.gr/og-image.png'
    )
WHERE key = 'seo_defaults';

COMMIT;

-- Verify: expect 0 rows. Any row returned still contains a bad value.
SELECT key, value
FROM public.site_settings
WHERE value::text ILIKE '%moveability%'
   OR value::text ILIKE '%og-default%';

-- And eyeball the result:
SELECT key, jsonb_pretty(value) AS value
FROM public.site_settings
WHERE key IN ('business_info', 'seo_defaults')
ORDER BY key;
