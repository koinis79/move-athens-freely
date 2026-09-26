-- Product meta titles/descriptions (EN + EL) for all 9 active equipment rows.
-- Run in the Supabase SQL Editor. Prerequisite: the meta_*_el ALTER TABLE
-- (supabase/migrations/20260926000000_add_equipment_meta_el.sql).
--
-- Targets: title <= 60, description <= 160. ALL 36 FIELDS ARE WITHIN LIMITS.
-- (Three titles were over on the first pass and were replaced by the owner on
--  Sep 26: transit-wheelchair EN 63->53, electric-mobility-scooter EN 63->51,
--  knee-walker EL 65->55. Nothing was auto-shortened.)
--
-- Claims verified against the DB, not assumed:
--   * every "from EUR X" matches price_tier1 (all 9)
--   * "4-Wheel" for electric-mobility-scooter matches specifications->>'wheels' = 4
--   * "(Knee Scooter)" mirrors knee-walker's own name_en
-- Both PRE-EXISTING descriptions being replaced had STALE prices:
--   foldable-travel-scooter said EUR 100 vs price_tier1 150, and
--   lightweight-folding-wheelchair said EUR 35 vs 79.

-- lightweight-folding-wheelchair  (price_tier1 = 79 -- matches the "from EUR 79" claim)
--   title EN 57 | desc EN 145 | title EL 55 | desc EL 145   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Lightweight Folding Wheelchair Rental Athens | Movability',
  meta_description    = 'Rent our most popular ultra-light wheelchair from €79. Folds in seconds, fits any taxi. Hotel delivery or free store pickup — same-day available.',
  meta_title_el       = 'Ενοικίαση Ελαφρύ Πτυσσόμενο Αμαξίδιο Αθήνα | Movability',
  meta_description_el = 'Το πιο δημοφιλές μας αμαξίδιο από €79. Διπλώνει σε δευτερόλεπτα, χωράει σε κάθε ταξί. Παράδοση στο ξενοδοχείο ή δωρεάν παραλαβή από το κατάστημα.'
WHERE slug = 'lightweight-folding-wheelchair';

-- manual-wheelchair  (price_tier1 = 49 -- matches the "from EUR 49" claim)
--   title EN 53 | desc EN 138 | title EL 57 | desc EL 133   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Manual Wheelchair Rental Athens from €49 | Movability',
  meta_description    = 'Standard self-propel wheelchair with large rear wheels, padded seat and swing-away footrests. Delivered to your hotel or Airbnb in Athens.',
  meta_title_el       = 'Ενοικίαση Χειροκίνητο Αμαξίδιο Αθήνα από €49 | Movability',
  meta_description_el = 'Κλασικό αμαξίδιο με μεγάλους πίσω τροχούς και άνετο κάθισμα. Παράδοση στο ξενοδοχείο ή το Airbnb σας στην Αθήνα, ίδια μέρα διαθέσιμη.'
WHERE slug = 'manual-wheelchair';

-- transit-wheelchair  (price_tier1 = 49 -- matches the "from EUR 49" claim)
--   title EN 53 | desc EN 139 | title EL 47 | desc EL 129   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Compact Transit Wheelchair Rental Athens | Movability',
  meta_description    = 'Companion-pushed transit wheelchair from €49. Light, folds flat, ideal for airports, museums and sightseeing. Delivered anywhere in Athens.',
  meta_title_el       = 'Ενοικίαση Αμαξίδιο Μεταφοράς Αθήνα | Movability',
  meta_description_el = 'Ελαφρύ αμαξίδιο μεταφοράς από €49 για ώθηση από συνοδό. Ιδανικό για αεροδρόμια, μουσεία και αξιοθέατα. Παράδοση σε όλη την Αθήνα.'
WHERE slug = 'transit-wheelchair';

-- foldable-power-wheelchair  (price_tier1 = 150 -- matches the "from EUR 150" claim)
--   title EN 54 | desc EN 134 | title EL 51 | desc EL 140   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Electric Folding Wheelchair Rental Athens | Movability',
  meta_description    = 'Joystick-controlled power wheelchair from €150. Folds flat for taxis and cruise cabins, all-day battery. Explore Athens independently.',
  meta_title_el       = 'Ενοικίαση Ηλεκτροκίνητο Αμαξίδιο Αθήνα | Movability',
  meta_description_el = 'Ηλεκτρικό αμαξίδιο με joystick από €150. Διπλώνει για ταξί και καμπίνες κρουαζιέρας, μπαταρία όλης ημέρας. Εξερευνήστε την Αθήνα ανεξάρτητα.'
WHERE slug = 'foldable-power-wheelchair';

-- foldable-travel-scooter  (price_tier1 = 150 -- matches the "from EUR 150" claim)
--   title EN 52 | desc EN 127 | title EL 56 | desc EL 135   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Foldable Mobility Scooter Rental Athens | Movability',
  meta_description    = 'Our best-seller: folds in seconds, airline-approved battery, fits cruise cabins. From €150 with hotel or Piraeus port delivery.',
  meta_title_el       = 'Ενοικίαση Πτυσσόμενο Scooter Ταξιδίου Αθήνα | Movability',
  meta_description_el = 'Το πιο δημοφιλές μας scooter: διπλώνει σε δευτερόλεπτα, μπαταρία εγκεκριμένη για πτήσεις. Από €150 με παράδοση σε ξενοδοχείο ή Πειραιά.'
WHERE slug = 'foldable-travel-scooter';

-- electric-mobility-scooter  (price_tier1 = 120 -- matches the "from EUR 120" claim)
--   title EN 51 | desc EN 136 | title EL 59 | desc EL 125   [all within limits]
UPDATE public.equipment SET
  meta_title          = '4-Wheel Mobility Scooter Rental Athens | Movability',
  meta_description    = 'Roomy 4-wheel electric scooter with padded seat, 25 km range. From €120, ideal for longer stays. Delivered to your Athens accommodation.',
  meta_title_el       = 'Ενοικίαση Ηλεκτρικό Scooter Αθήνα – Τετράτροχο | Movability',
  meta_description_el = 'Άνετο τετράτροχο scooter με αυτονομία 25 χλμ. Από €120, ιδανικό για μεγαλύτερη διαμονή. Παράδοση στο κατάλυμά σας στην Αθήνα.'
WHERE slug = 'electric-mobility-scooter';

-- rollator-walker  (price_tier1 = 49 -- matches the "from EUR 49" claim)
--   title EN 52 | desc EN 139 | title EL 51 | desc EL 130   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Rollator Walker Rental Athens with Seat | Movability',
  meta_description    = '4-wheel rollator with built-in seat and basket from €49. Rest whenever you need on Athens'' cobbled streets. Hotel delivery or store pickup.',
  meta_title_el       = 'Ενοικίαση Rollator Περιπατητήρας Αθήνα | Movability',
  meta_description_el = 'Τετράτροχος rollator με κάθισμα και καλάθι από €49. Ξεκουραστείτε όποτε χρειάζεται στα λιθόστρωτα της Αθήνας. Παράδοση ή παραλαβή.'
WHERE slug = 'rollator-walker';

-- knee-walker  (price_tier1 = 49 -- matches the "from EUR 49" claim)
--   title EN 60 | desc EN 129 | title EL 55 | desc EL 129   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Knee Scooter Rental Athens – Crutch Alternative | Movability',
  meta_description    = 'Injured foot or ankle? Rent a knee walker from €49 and keep exploring Athens hands-free. Same-day delivery to hotels and Airbnbs.',
  meta_title_el       = 'Ενοικίαση Knee Walker (Knee Scooter) Αθήνα | Movability',
  meta_description_el = 'Τραυματισμός σε πόδι ή αστράγαλο; Νοικιάστε knee walker από €49 και συνεχίστε την εξερεύνηση. Παράδοση ίδιας μέρας σε ξενοδοχεία.'
WHERE slug = 'knee-walker';

-- portable-oxygen-concentrator  (price_tier1 = 120 -- matches the "from EUR 120" claim)
--   title EN 55 | desc EN 135 | title EL 57 | desc EL 130   [all within limits]
UPDATE public.equipment SET
  meta_title          = 'Portable Oxygen Concentrator Rental Athens | Movability',
  meta_description    = 'Travel-size pulse-flow oxygen concentrator, 2.2 kg, 6-hour battery. From €120 with hotel delivery. Stay active in Athens without worry.',
  meta_title_el       = 'Ενοικίαση Φορητός Συμπυκνωτής Οξυγόνου Αθήνα | Movability',
  meta_description_el = 'Φορητός συμπυκνωτής παλμικής ροής, 2,2 κιλά, αυτονομία 6 ωρών. Από €120 με παράδοση στο ξενοδοχείο. Μείνετε δραστήριοι στην Αθήνα.'
WHERE slug = 'portable-oxygen-concentrator';

-- Verify: expect 9 rows, all four columns non-null, every t_* <= 60 and d_* <= 160.
SELECT slug,
       length(meta_title)          AS t_en,
       length(meta_description)    AS d_en,
       length(meta_title_el)       AS t_el,
       length(meta_description_el) AS d_el
FROM public.equipment
WHERE is_active
ORDER BY slug;
