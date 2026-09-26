-- Greek SEO metadata for equipment.
--
-- The existing meta_title / meta_description columns hold the ENGLISH values and
-- keep that meaning — this only adds the Greek counterparts alongside them, so
-- nothing has to be backfilled or renamed.
--
-- Both columns are nullable on purpose: EquipmentDetail falls back to the EN
-- column when the _el value is null, so a product with no Greek copy yet still
-- renders a sensible title rather than an empty one.
--
-- Applied live via the SQL Editor on 2026-09-26; this file is the
-- source-controlled copy.

ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS meta_title_el text,
  ADD COLUMN IF NOT EXISTS meta_description_el text;

COMMENT ON COLUMN public.equipment.meta_title IS
  'English <title> for the product page. NULL falls back to a generated "<name> Rental Athens | Movability".';
COMMENT ON COLUMN public.equipment.meta_description IS
  'English meta description for the product page. NULL falls back to a generated one.';
COMMENT ON COLUMN public.equipment.meta_title_el IS
  'Greek <title>, used when the UI language is "gr". NULL falls back to meta_title.';
COMMENT ON COLUMN public.equipment.meta_description_el IS
  'Greek meta description, used when the UI language is "gr". NULL falls back to meta_description.';
