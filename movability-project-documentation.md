# MOVABILITY.GR — Project Documentation

> **Single source of truth** for the Movability project. Updated: August 7, 2026.
> Drop this file in the repo root and have any AI tool (Claude Code, Claude, etc.) read it FIRST for full project context.

---

## 1. PROJECT OVERVIEW

**What:** Movability (movability.gr) — Athens-based mobility equipment rental for tourists and locals. Wheelchairs, power wheelchairs, mobility scooters, rollators, knee walkers — delivered to hotels/ports/airport or picked up in-store.

**Owner:** Vasilis (vasileios@koinis.gr) — part of **Koinis Healthcare Group** (founded 1982, Corinth; verified). Stores: Athens Center (Stadiou 31), Kallithea (Davaki 16), Chalandri (Kolokotroni 22).

**Status:** LIVE. **True volume: ~32 bookings / €4,208 per 90 days (~€1,400/mo)** — roughly HALF via WhatsApp/manual admin bookings (invisible to GA4; the bookings table is the source of truth, not analytics). **5 five-star Google reviews** (from zero, via WhatsApp outreach). Google impressions at all-time high; #4 for "wheelchair rental athens". US = premium segment (~€139/booking avg); Greek local market bigger than analytics suggests (WhatsApp bookings are mostly Greek).

---

## 2. ⚠️ READ THIS FIRST — HARD-WON LESSONS

1. **A PRICE LIVES IN THREE LAYERS: frontend, edge functions, AND the create_booking RPC.** The RPC (migration `009_validate_booking_price.sql`, since replaced via SQL) recomputes equipment tier + zone fee + surcharge and REJECTS mismatches ("Price mismatch" / Greek "Ασυμφωνία τιμής"). July outage: surcharges added frontend-only → every surcharged booking silently rejected ~11 days in peak season. **Follow-up bug:** the first RPC fix applied the Sunday +€50 only when a time slot was selected — customers with slot "tbc"/null were still rejected. Fixed: **Sunday surcharge is slot-INDEPENDENT in all three layers** (evening/Sat-evening still require a slot). Any price-logic change → check all three layers.

2. **TEST A MATRIX, NOT A TEST CASE.** After any pricing/booking change: one complete booking per branch — daytime weekday / evening / Sunday / Sunday-with-no-slot / store pickup. The outage survived because every test happened to be a no-surcharge combo.

3. **GREP FOR THE ERROR STRING BEFORE FIXING.** The first outage fix patched create-checkout-session — which contains NO validation. Locate the code that raises the error, then fix that layer. RPC fixes = SQL in the SQL Editor (live instantly); edge functions = manual redeploy + verify the deployed code.

4. **REJECTED PAYMENTS ARE INVISIBLE.** create_booking rejections aren't logged/alerted; customers leave silently. Discovered only via one customer email. → Top pending build: alert on rejected bookings.

5. **Supabase Storage dashboard does NOT overwrite same-named uploads** — it silently keeps the old object. To replace a file: DELETE it, VERIFY it's gone from the list, then upload. (Scripts can use `upsert: true`.) This silently ate an hour during the Piraeus hero swap.

6. **AI-generated images MUST be actually optimized before upload.** Renaming .png→.webp does nothing. Pipeline: generate → Claude Code converts (real WebP, ~1600px, q80, target <300 KB; raw Gemini PNGs are ~9 MB) → **crop the Gemini "sparkle" watermark (bottom-right)** → upload → **Copy URL from the stored file** (never reconstruct URLs from memory) → swap. Delete raw PNGs from Desktop after (wrong-file uploads happened twice).

7. **DB CHECK CONSTRAINTS silently block new values.** Before saving new values: `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'bookings'::regclass;`

8. **New dashboard-created edge functions have "Enforce JWT verification" ON by default** — rejects INTERNAL_API_KEY at the gateway (`UNAUTHORIZED_INVALID_JWT_FORMAT`, ≠ your function's 401). Turn it OFF for INTERNAL_API_KEY functions.

9. **RLS: anonymous forms can INSERT but not SELECT back** (id readback returns null). Pass payloads forward instead of reading back after insert.

10. **Browser-called edge functions: CORS/OPTIONS handled BEFORE auth**, corsHeaders on the 401 (else opaque "network error"). Copy the send-review-request pattern.

11. **`INTERNAL_API_KEY` identical everywhere (~5 places):** Supabase Edge Secrets, Vercel `VITE_INTERNAL_API_KEY`, the pg_cron job SQL, scripts. Never `SUPABASE_`-prefixed secrets for function/cron auth. pg_cron: verify the key placeholder was replaced; "succeeded" only means the HTTP request was sent.

12. **Edge functions do NOT deploy from git** — manual redeploy, then VERIFY the deployed code contains your change.

13. **ONE repo:** `~/Desktop/move-athens-freely`. `npm run build` before push; Vercel green after. Products/zones live in the DB (columns: `rental_start`/`rental_end`). Equipment images: `equipment-images/equipment/`, article heroes: `equipment-images/articles/`, testimonial photos: `equipment-images/testimonials/`. curl in Terminal, SQL in SQL Editor. **articles.ts: a syntax error breaks the WHOLE build.**

14. **SPA meta-tag caveat:** article URLs serve the generic homepage meta tags to non-JS crawlers (react-helmet sets them client-side). Google is fine (executes JS — impressions prove it), but social/WhatsApp link previews of articles show the generic card. Future SEO polish item.

15. **Bulk find-and-replace can miss instances with different indentation.** Jul 15 card-grid unification: replace_all matched the themed-section grids but silently missed Planning & Tips (different whitespace). After any multi-instance edit, grep to confirm ALL intended occurrences changed.

16. **Supabase Vault beats plaintext keys in cron commands.** Typing an API key directly into a scheduled `cron.schedule()` command is error-prone (a placeholder can silently survive a copy-paste — verify with `command LIKE '%PLACEHOLDER%'` after every cron edit, don't trust that pasting worked) and leaves the key exposed in `cron.job` forever. Better: `SELECT vault.create_secret(key, name, description)` once, then reference it in the cron body via `(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = '...')` — no plaintext key in the command at all. Migrate older crons (e.g. the digest job, jobid 3) to this pattern when convenient.

17. **Lovable-era mock/placeholder data can survive into production.** The March Lovable specs seeded components with hardcoded mock data (e.g. "Show 2 mock bookings" in the user dashboard). `MyBookings.tsx` was never wired to the backend at all — it rendered `const bookings = mockBookings` unconditionally, so every logged-in customer saw two fake bookings (found Aug 7 via a customer report). Old mock uses the `MOV-YYYYMMDD-NNN` booking format; **real** bookings use random hex (e.g. `MOV-AB8D8BE48D`). When auditing: grep for the old `MOV-[0-9]{8}-[0-9]{3}` format and known mock strings, and confirm each data-driven component **actually calls the backend** — a component can look finished but never fetch. Dead `src/data/admin*MockData.ts` files also linger (not imported by live code; safe to delete when convenient).

18. **A DB-driven-looking layer can still be constrained upstream by a hardcoded list feeding it.** Checkout *looked* DB-driven — `Checkout.tsx` queried `delivery_zones` to resolve slug→id — but the **slug it queried with came from a hardcoded 4-zone array** (`DeliverySection.ZONES`) + a keyword detector, so the DB lookup could only ever return one of those four. Two zones added to the DB (`suburbs-riviera` €30, `rafina-port` €50, both active) were selectable in the DB-driven admin/product-panel but **invisible at checkout**, where a Glyfada address silently priced as `athens-city` €20 and a Rafina address as `piraeus-port` €25. **The RPC did not reject it** — client under-quoted, server recomputed the *same* under-quote from the wrong zone id it was handed, totals matched → booking succeeded at the wrong price/zone (a silent undercharge, worse than a hard error because nothing surfaces). Fix (Aug 15): all customer surfaces fetch zones from one `useDeliveryZones()` hook; the fee helpers take the fetched list. Lesson: when tracing "is this DB-driven?", follow the value all the way to its **origin**, not just to the nearest DB call — a query is only as dynamic as its inputs.

19. **The backend must read EVERY money field the frontend sends.** Checkout sent `payment_type: "deposit"` to `create-checkout-session`, but the function destructured only `{ booking_number, customer_email }` — the field was silently dropped and it always built full-amount line items. So a customer who chose "Pay 30% deposit now" and clicked a button labeled "Pay €X Deposit" was charged **100%** at Stripe. It passed every casual test because the *default* (full) path is correct; only the deposit path was wrong, and nothing errored. Rule: when the frontend sends a field that changes what money moves, grep the receiving function to confirm it actually reads and acts on it — an ignored field is a silent 100%-vs-30% bug, not a validation error. Corollary: the amount shown on the button and the amount charged must be computed the **same way** on both sides (here, identical `Math.ceil(total*0.30)`), or they drift.

---

## 3. TECH STACK & TOOLS

React + Vite + Tailwind · Supabase (Postgres + Edge Functions + Storage + pg_cron/pg_net) · Stripe (LIVE) · Resend (`hello@movability.gr`) · Vercel (auto from GitHub `main`) · GA4 (G-8RD4VHF74X) + Search Console · Papaki DNS + ImprovMX · EN/GR i18n.

**Coding tool: Claude Code** (`cd ~/Desktop/move-athens-freely && claude`; resume with `claude --continue`). Reads this doc first; edits, builds, commits, pushes. Node gets reinstalled to /tmp per session when needed. Image optimization happens through it (see lesson 6). Claude-in-Chrome browser automation has been unreliable — human eyeballs the live site instead.

---

## 4. KEY URLS

| Resource | URL |
|---|---|
| Live site / Admin | https://movability.gr · /admin |
| GitHub | https://github.com/koinis79/move-athens-freely |
| Supabase | https://supabase.com/dashboard/project/lmgpuqgwkiapgpdsxvmb |
| Stripe / Resend | dashboard.stripe.com · resend.com/emails |
| Google Review | https://g.page/r/CRIC4z0HieHaEBM/review (= movability.gr/review) |

Contacts: hello@movability.gr (sender) · info@movability.gr → info@koinis.gr (admin/digest/notifications) · WhatsApp +30 697 463 3697 · Admins: vasileios@koinis.gr, kalogeropoulosbill6@gmail.com (Bill).

---

## 5. EQUIPMENT & PRICING

⚠️ **Per RENTAL PERIOD, not per day.** Source of truth: `equipment` table.

| Product | 1–3d | 4–7d | 8–14d | 15–30d |
|---|---|---|---|---|
| Manual / Transit Wheelchair, Rollator, Knee Walker | €49 | €79 | €149 | €199 |
| Lightweight Folding Wheelchair | €79 | €99 | €179 | €249 |
| Electric Mobility Scooter | €120 | €220 | €300 | €400 |
| Foldable Travel Scooter / Foldable Power Wheelchair | €150 | €250 | €350 | €450 |

Product pages show per-day equivalents ("~€16/day") + "from €49" badges. "Most Popular" badge on 4–7d (intentional).

### Delivery zones (6 active)
Source of truth: `delivery_zones` table. Real columns: `id, name_en, name_el, slug, delivery_fee, pickup_fee, estimated_time, is_active, sort_order, created_at` (the fee column is **`delivery_fee`**, numeric). Active zones (by sort_order): Store Pickup €0 `store-pickup` (choose 1 of 3 stores) · Athens City €20 `athens-city` · Suburbs & Riviera €30 `suburbs-riviera` (Glyfada, Kifisia, Vouliagmeni, Voula) · Athens Airport €50 `athens-airport` · Piraeus Cruise Terminal €25 `piraeus-port` · Rafina Port €50 `rafina-port`. (**7** inactive legacy rows — deactivate, never delete.) "Free store pickup," never "free delivery." **All customer-facing surfaces now fetch zones from the DB via `useDeliveryZones()`** (checkout `DeliverySection`, product-page `BookingPanel`, `HowItWorks`) + admin `NewBookingModal` — so a new/edited DB zone appears everywhere with no code change. Address auto-detection keywords in `DeliverySection.detectZoneFromAddress()` are the only per-zone code left, and are a convenience only — the "Change zone" dropdown is the truth.

### Surcharges (delivery only, on top of zone fee)
`daytime` 09–17 +€0 · `evening` 17–21 +€20. Weekend REPLACES: **Sunday any slot (or NO slot) → +€50** · Saturday evening → +€50 · Saturday daytime normal. Implemented in THREE agreeing layers: frontend `getDeliverySurcharge()` (DeliverySection.tsx) · create_booking RPC (SQL) · admin NewBookingModal. Day-of-week: `EXTRACT(DOW FROM p_rental_start)`, Sunday=0, timezone-safe.

---

## 6. EMAIL & AUTOMATION

```
Stripe checkout → stripe-webhook → send-booking-confirmation (customer + admin)
Admin New Booking → send-booking-confirmation (checkbox, default ON)
Admin "Completed" → send-review-request
/contact + /partners → contact_inquiries + send-contact-notification → info@koinis.gr
pg_cron 08:30 Athens → send-daily-digest (deliveries/pickups/tomorrow/pending + unread inquiries)
Admin/system: booking abandoned 2h-7d, no payment → send-abandoned-cart-email (hourly cron, jobid 6, Vault-backed auth)
```
All INTERNAL_API_KEY auth. Browser-called functions: CORS-before-auth + JWT-verification OFF. Bodies: review `{booking_id}` · confirmation `{booking_number}` · contact-notification direct payload · digest `{}` · abandoned-cart `{booking_id}`.
7 functions deployed: create-checkout-session · stripe-webhook · send-booking-confirmation · send-review-request · send-daily-digest · send-contact-notification · **send-abandoned-cart-email**.
Digest cron `30 5 * * *` (=08:30 Athens summer), jobid 3. **Late Oct → `30 6 * * *`.**
**Abandoned-cart cron** `0 * * * *` (hourly), **jobid 6, live + tested Aug 6** (MOV-CCD731E344). Warm, low-pressure recovery email from `hello@movability.gr`: booking summary (equipment/dates/total) + a **fresh** Stripe payment link (mints a new checkout session — the original session URL expires ~24h, so old carts need a new one) + reply/WhatsApp option. Dedup via `bookings.abandoned_email_sent_at`. Only touches rows with `stripe_session_id IS NOT NULL` (real checkout attempts) — never manual/store/WhatsApp/partner entries. **Auth is Vault-backed** — INTERNAL_API_KEY stored as vault secret `internal_api_key`, pulled per-run via `vault.decrypted_secrets`, so no plaintext key sits in the cron command (unlike the digest cron; see lesson 16). ⚠️ The committed `sql/abandoned_cart_cron.sql` still shows the earlier plaintext-placeholder approach — update it to the Vault pattern in a follow-up.

---

## 7. BOOKING & PAYMENT INTERNALS

- **create_booking RPC** = insert + PRICE VALIDATION (tier + zone + surcharge; Sunday slot-independent). Rejections say "Price mismatch: expected X, got Y". Current version replaced via SQL Jul 5–7 (fix_create_booking.sql pattern; latest includes the tbc-slot Sunday fix). **Source-controlled copy: `sql/create_booking_rpc.sql`** — any SQL Editor change to the RPC must update this file in the same commit.
- **create-checkout-session** = Stripe line items from the saved row; NO price validation here. **Reads `payment_type`** (Aug 15): `full` → per-item + delivery line items; `deposit` (Προκαταβολή) → a single 30% line item, `Math.ceil(total_amount * 0.30)` (identical rounding to the frontend button, so the two always match), with the 70% balance collected in person on delivery. Passes `payment_type` + `full_total` in Stripe metadata and persists `payment_type` on the booking. The abandoned-cart re-mint mirrors this (a deposit booking re-mints at 30%, not full).
- **stripe-webhook** (`checkout.session.completed`) records the payment from Stripe's authoritative `amount_total` + metadata: `full` → `payment_status='paid'`, `amount_paid=total`, `amount_due=0`; `deposit` → `payment_status='deposit_paid'`, `amount_paid=` charged, `amount_due=full_total − charged`. `status='confirmed'` either way. **Two deposit concepts — do not conflate (lesson 19):** *Προκαταβολή* = this 30% online down-payment (`bookings.payment_type/amount_paid/amount_due`); *Εγγύηση* = per-product refundable security deposit (`equipment.deposit_amount`), collected in person at delivery, DISPLAY-ONLY, never charged online, never in any total.
- `payment_status` (webhook truth) ≠ `status` (manual label). Admin states: Paid in full / Deposit (`deposit_paid`) / **Unpaid–Awaiting payment** + badges + update buttons. Verify real payments in Stripe (cs_live_ + Succeeded).
- **`stripe_session_id`** distinguishes channel: NOT NULL = a real website checkout attempt; NULL = manual/store/WhatsApp/partner entry. This is the key filter for abandoned-cart recovery (never chase NULL rows).
- **`abandoned_email_sent_at`** (timestamptz, added Aug 6) = dedup guard for the abandoned-cart email, same pattern as `review_requested_at`. Set once, only after a successful send. Migration: `supabase/migrations/20260806000000_add_abandoned_email_sent_at.sql`.
- Admin New Booking = fallback path when checkout misbehaves (bypasses Stripe flow).
- **~Half of all bookings are WhatsApp/manual** — GA4 sees none of them; conversion analytics describe only the website slice. Mobile "drop-offs" partly convert via WhatsApp. True volume: query the bookings table.

---

## 8. CONTENT & SEO

### Articles (in `src/data/articles.ts` — syntax error breaks the build)
~17 guides + blog posts, organized on the Accessible Athens page (Jul 15) into: **⭐ Featured/Start Here** (Acropolis guide first · Honest Truth · Airport arrival) + themed sections (Sights/Food & Beaches · Equipment Guides · Getting Around · Planning/Tips), driven by each article's `category` field. Slugs/URLs unchanged (SEO history preserved). **All sections render identical 3-up ArticleCard grids** (Jul 15) — Start Here distinguished by its tinted band + ⭐ header only, not by card styling.

Key pieces:
- **Acropolis wheelchair guide** (`/accessible-athens/acropolis-wheelchair-guide`) — flagship; refreshed Jul 14 with verified facts + **Eliana's REAL customer photo of the lift** (unique online; `testimonials/eliana-acropolis-lift.jpg`, credited). Verified facts: lift on the north slope (Dec 2020 panoramic elevator, 2 wheelchairs+companions), call ahead +30 210 321 4172, green-gate taxi drop-off, free admission for disabled visitors, Akropoli metro Line 2 accessible.
- **Knee walker article** (`knee-walker-rental-athens`) — new Jul 14; targets "knee walker/knee scooter rental athens" + local Greek recovery market.
- **Piraeus cruise guide** (`piraeus-cruise-port-wheelchair-guide`) — MERGED Jul 15 (old thin logistics piece + new rental-focused content) into one ~1,000-word definitive guide on the original slug. Landing page for the Nov US ads.

### Article images
- The article renderer (renderMarkdown in ArticleDetail.tsx) supports inline images: a `![caption](url)` line alone → centered figure + caption (added Jul 14).
- Hero pipeline: generate (Gemini/Ideogram) → optimize via Claude Code (lesson 6) → upload to `equipment-images/articles/` → Copy URL → swap the article's `image` field. Heroes live: knee-walker-athens-guide.webp · acropolis-wheelchair-guide.webp · piraeus-cruise-guide.webp.
- Generated images are for atmosphere/heroes only — product detail photos stay real. Real customer photos (permission required — Eliana granted, credited "Foto: Eliana F.") beat generated ones.
- **Image work convention:** all optimization sessions happen inside `/image-work/` (gitignored, along with root-level .webp/.png/.jpg) so artifacts can never be committed by accident.

### Homepage
Real testimonials (Susan K. · Berk G. · Eliana F. with Italian + translation + her real hotel-room photo) + "See all on Google" link (hover fixed). Header: one-line nav (collapses to hamburger below 1280px), "Partner With Us" link. Pricing display: per-day equivalents.

### Review engine (proven playbook — §13 of previous docs)
WhatsApp ask AFTER rental ends, name+equipment personalized, "family business" wording → 5 reviews from ~14 asks. Always reply publicly in the reviewer's language. Recipients query: bookings where rental_end < today, phone present, status delivered/completed. Photos need explicit permission; review text on-site OK with first-name + initial.

---

## 9. ANALYTICS TRUTHS (as of Jul 2026)

- GA4 sees only website bookings (half the business). GSC is the SEO truth: impressions ~90–105/day (all-time high), #4 "wheelchair rental athens". The 16 "page with redirect" GSC items = old stable noise.
- Channels (website slice): Organic = the booking engine · Direct inflated by self-testing · **AI Assistant** (ChatGPT/Copilot) = small but high-converting emerging channel — structured data/FAQ-friendliness feeds it · Referral ≈ Stripe bounce-backs, ignore.
- Devices: mobile majority (recent) and growing; desktop converts ~2× on-site BUT mobile users partly convert via WhatsApp instead. Mobile flow human-tested = smooth.
- Countries (website): US = premium (~€139/booking) · Greece bigger than it looks (WhatsApp) · long EU tail. Nov–Feb Google Ads (€350 credit): target US first.

---

## 10. KEY FILE PATHS

| File | Purpose |
|---|---|
| `src/data/articles.ts` | All articles; categories drive the organized listing; ⚠️ fragile |
| `src/pages/ArticleDetail.tsx` | renderMarkdown incl. `![caption](url)` image support |
| Accessible Athens listing page | Shared `ArticleCard` component + unified 3-up grid (`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`) across all sections — card styling lives in ONE place |
| `src/components/checkout/DeliverySection.tsx` | ZONES + getDeliverySurcharge/getDeliveryFee + store picker + slot picker |
| `src/components/equipment/BookingPanel.tsx` | Product booking panel (per-day display) |
| `src/pages/Checkout.tsx` | Fee calc + create_booking call |
| `src/pages/Contact.tsx` / `Partners.tsx` | Forms → contact_inquiries + notification |
| `src/pages/admin/BookingsNew.tsx` / `NewBookingModal.tsx` | Admin bookings; payment states; surcharge; confirmation email |
| `src/components/.../TestimonialsSection.tsx` | Real reviews + Eliana's photo |
| `Header.tsx` / `Footer.tsx` | One-line nav (xl breakpoint), Partner With Us |
| `sql/create_booking_rpc.sql` | Source-controlled copy of the live create_booking RPC — update in the SAME commit as any SQL Editor change to the RPC |
| `supabase/migrations/009_validate_booking_price.sql` | Where price validation originated (RPC since replaced via SQL) |
| `supabase/functions/*` | 6 edge functions |
| `scripts/upload-testimonial-images.ts` | Service-role storage upload pattern (upsert) |

---

## 11. RECENT WORK LOG

- **Aug 15 (deposit features — down-payment fix + security-deposit display):** Two distinct deposit concepts were both broken/missing (→ lesson 19). **A) Προκαταβολή (30% down-payment) was charging 100%.** `Checkout.tsx` sent `payment_type` to `create-checkout-session`, but the function only read `{booking_number, customer_email}` and always built full-amount line items — so anyone choosing "Pay 30% deposit now" (button "Pay €X Deposit") was charged the full total at Stripe. Fixed: the function now reads `payment_type`; `deposit` → a single line item of `Math.ceil(total_amount*0.30)` (same rounding as the button, so they match to the cent) with the 70% balance noted as due on delivery, and it passes `payment_type`+`full_total` in Stripe metadata and persists `payment_type` on the booking. `stripe-webhook` now records from Stripe's `amount_total`: deposit → `payment_status='deposit_paid'`, `amount_paid`=charged, `amount_due`=full−charged; full → `paid`/full/0; `status='confirmed'` either way — so admin shows "Deposit / €X due" and the confirmation page + email (which already read `payment_type`/`amount_paid`/`amount_due`) render correctly. The abandoned-cart re-mint was made deposit-aware too (a deposit booking re-mints at 30% with matching metadata + an email note), so the recovery path can't reintroduce the 100% bug. **B) Εγγύηση (per-product security deposit, `equipment.deposit_amount`) was admin-only, invisible to customers.** `mapRow` dropped the column; added `depositAmount` to `EquipmentItem`. Now displayed (bilingual, new `product.securityDeposit*` i18n keys EN+GR): on the product page (`BookingPanel`, near pricing) and as an informational line in the Checkout order summary — explicitly **not** added to the total, collected in person at delivery. Fixed the contradictory static copy: `en.json`/`gr.json` `faq1a` (claimed "required at time of booking" — false) and `FAQ.tsx` ("may apply" — vague) now both say: refundable, shown per product, collected at delivery, never online; also corrected the Greek `faq1q`/`faq1a` which wrongly used *προκαταβολή* for the security deposit (→ *εγγύηση*). Affected products: Foldable Travel Scooter €150, Portable Oxygen Concentrator €150, Electric Mobility Scooter €200, Foldable Power Wheelchair €150, Lightweight Folding Wheelchair €50. `npm run build` + `tsc` green. **Manual redeploy required (lesson 12):** `create-checkout-session`, `stripe-webhook`, `send-abandoned-cart-email`. **Payment-logic test matrix pending** (full vs 30% booking → Stripe charge == button amount; admin paid/due correct).
- **Aug 15 (delivery-zones silent-undercharge fix):** Read-only audit of how delivery zones flow through all layers surfaced two surprises: (1) the two zones the owner was "considering adding" — Suburbs & Riviera €30 (`suburbs-riviera`) and Rafina Port €50 (`rafina-port`) — **already existed as active DB rows**, and (2) the doc's zone schema/counts were stale (fee column is `delivery_fee`; 7 inactive legacy rows, not 9). **The bug:** checkout only *looked* DB-driven. `DeliverySection.tsx` held a hardcoded 4-zone `ZONES` array + keyword detector; the slug it produced was then resolved to an id against the DB by `Checkout.tsx`. So the two new zones were selectable in the DB-driven admin modal & product-page `BookingPanel` but **invisible at checkout** — a Glyfada delivery silently priced as `athens-city` €20 (−€10), a Rafina delivery as `piraeus-port` €25 (−€25) *and mislabeled*. The create_booking RPC did **not** reject these: the client under-quoted, the server recomputed the same under-quote from the wrong zone id it was handed, totals matched, booking succeeded at the wrong price — a silent revenue leak, not an error (→ lesson 18). **Fix:** new `useDeliveryZones()` hook (active zones by sort_order — same query `BookingPanel` already used); `DeliverySection` now fetches zones and its fee helpers (`getDeliveryFee`/`getDeliveryZoneFee`) take the fetched list, with a graceful loading state; `detectZoneFromAddress()` gained Glyfada/Kifisia/Vouliagmeni/Voula→suburbs-riviera and Rafina→rafina-port keywords (**Rafina tested before the generic "port" match** so it stops falling through to Piraeus); `HowItWorks` zone cards now render from the DB too (presentation-only icon/color map by slug). **Cart→checkout handoff fixed:** `CartItem` gained `deliveryZoneSlug`, `BookingPanel` stores it, and `Checkout` seeds it as the delivery `manualZone` on mount — so a zone chosen on the product page **wins over address auto-detection** instead of being silently re-detected/re-priced. `npm run build` + `tsc --noEmit` both green. **Not committed (owner runs in SQL Editor):** a `sort_order` cleanup — `suburbs-riviera` and `athens-airport` both sit at 3, and `rafina-port` at 7. **Post-push manual test matrix required per lesson 2** (one full Stripe booking each: Suburbs & Riviera daytime, Rafina daytime, Athens City regression, and a Sunday/surcharge combo on a new zone).
- **Aug 7 (customer dashboard bug):** Customer reported two fake bookings on "My Bookings" — MOV-20260401-001 (Lightweight Folding Wheelchair, €60, "Confirmed") and MOV-20260315-003 (Portable Mobility Scooter, €125, "Completed"), both confirmed absent from the DB. **Root cause:** `src/components/dashboard/MyBookings.tsx` was never wired to Supabase — it rendered a hardcoded `mockBookings` array (leftover from the March Lovable spec's "Show 2 mock bookings") unconditionally, so *every* logged-in customer saw the same two fakes. **Fix:** replaced with a real user-scoped Supabase fetch — `.or(user_id.eq…,customer_email.eq…)`, matching the RLS SELECT policy (`auth.uid()=user_id OR jwt email=customer_email OR is_admin()`); the explicit filter also stops an admin from seeing *all* bookings on their own customer dashboard — plus proper loading (spinner), empty ("No bookings yet"), and error states, so no fake cards render under any condition. Also dropped the fabricated "Visa ending in 4242" card field (the DB never stored card data) in favour of the real payment status. Verified the fetch returns real joined bookings and the fake numbers don't exist. **Thoroughness** (grepped `MOV-20260401`/`MOV-20260315` across `src/`): MyBookings was the only *live* offender; the admin `admin*MockData.ts` chain is dead code (referenced only within `src/data/`, never imported by a live page/component — flagged for cleanup, not shipping fake data). → lesson 17.
- **Aug 6 (SQL investigation + abandoned-cart build):** Full revenue audit via direct SQL against the bookings table (not analytics) — confirmed true 90-day figures: **37 paid bookings, €4,619 revenue, €124.84 avg.** Channel split via `stripe_session_id` presence: website 76% of bookings/62% of revenue (€102.61 avg), manual/WhatsApp 24%/38% (€194.00 avg — worth ~2x per booking). Month-over-month: Apr €98 → May €708 → Jun €1,459 → Jul €2,223 (record month DESPITE the price-validation outage) → Aug pacing similarly. Product breakdown: Foldable Travel Scooter is the clear leader (8 bookings/€1,500); Electric Mobility Scooter was the clear laggard (1 booking/€120) — investigated and found its description competed head-on with the Foldable Travel Scooter's "travel" framing instead of differentiating; rewrote `description_en` to position it as the roomier, more comfortable option for longer/local stays, explicitly deferring the portability angle to the Foldable model by name (DB-only change, no deploy needed). `is_popular` flag spot-checked against real 90-day bookings — holds up reasonably well, no action needed. Delivery zones: Athens City dominates (28 bookings/€3,386); Piraeus Cruise Terminal has only 1 booking despite being the intended Nov–Feb ad landing page — flagged to re-check before committing ad budget. Review automation confirmed healthy: 96.2% of completed bookings got a review request (25/26). Pending-bookings deep dive: of 24 "pending" records (€3,107 total), 22 were already cancelled (€2,901, historical — proof of a pattern, not live risk), 1 was a Motion4Rent referral booking (cash-on-delivery by design, not abandoned), 1 was genuinely live (Andrew O'Kola, €99, pickup scheduled same day — emailed him directly). True abandoned-cart trend (noise excluded) confirmed real and growing: Apr €49 → May €249 → Jun €488 → Jul €918 → Aug (6d) €405, tracking ~20–36% of paid volume monthly. This reprioritized abandoned-cart recovery ahead of the rejected-bookings alert.
  Built same day — full abandoned-cart recovery system:
  - **DB:** added `bookings.abandoned_email_sent_at` (mirrors `review_requested_at` pattern).
  - **New edge function `send-abandoned-cart-email`:** INTERNAL_API_KEY auth, CORS-before-auth (copied send-review-request pattern), mints a FRESH Stripe checkout session per send (discovered original sessions expire ~24h, so reused create-checkout-session's line-item logic rather than the stale session URL). Guards against re-emailing, already-paid, and non-checkout (manual/partner) bookings via `stripe_session_id IS NOT NULL`.
  - **Tested end-to-end** via a real admin-created booking with a genuine Stripe session (MOV-CCD731E344) — confirmed `{"success":true}`, `abandoned_email_sent_at` stamped, email rendered correctly (warm copy, booking summary, working "Complete your booking" button → live Stripe checkout).
  - **Cron:** scheduled hourly (jobid 6) via Supabase Vault instead of a plaintext key in the cron command — INTERNAL_API_KEY stored as vault secret `internal_api_key`, pulled dynamically per-run via `vault.decrypted_secrets`. Now MORE secure than the digest cron (jobid 3), which still has its key in plaintext — a good future migration target.
  - **Filters:** `payment_status='pending'`, `stripe_session_id NOT NULL`, `abandoned_email_sent_at IS NULL`, `created_at` between 2h and 7d old.
  Also handled: replied to two contact_form inquiries that didn't fit the standard booking flow — Helen Kuhnsman (3-city Athens/Santorini/Mykonos wheelchair needs, sister in cancer treatment) and Shari Leary (one-way Piraeus→Ravenna cruise, asked about an Italy office — replied honestly: no Italy office, no one-way rentals, offered the Piraeus-side delivery/pickup instead).
- **Jul 15 (content pass):** Refurbished the three launch-era blog posts (`5-tips-wheelchair-travel-greece`, `what-to-pack-accessible-trip-athens`, `athens-becoming-more-accessible`) — thin `body[]` paragraphs → scannable markdown `content` (~800 words each: 807/808/811), date→Jul 15. Slugs/URLs/titles/categories/hero images unchanged. **Accuracy-first:** used only verified facts (Dec 2020 Acropolis panoramic elevator on north slope, 2 chairs + companions, call-ahead +30 210 321 4172, green-gate taxi drop-off, free admission for disabled visitors, Akropoli Line 2 step-free, Seatrac beaches, Type C/F 230V) and **removed prior unverified claims** (elevators at every metro station, "verified accessible hotel list", coastal tram accessible). Each links `/equipment` + 1–3 relevant guides and ends with a rental CTA. Edited one article at a time via a guarded splice script, `npm run build` green after each. **Follow-up (Quick Takeaways):** the three posts had been rendering the ArticleDetail placeholder ("Key points from this guide will appear here.") because they lacked a `takeaways` field — added real 3-bullet takeaways to each (facts drawn from the article bodies). A full scan confirmed **all 19 articles now define `takeaways`** — none left on the placeholder. **Refinement:** tightened the what-to-pack free-Acropolis-admission point (bullet + matching takeaway) to the precise conditions — documented **67%+ disability + one companion**, any nationality; official certificate/ID checked on-site; free tickets issued at the **on-site ticket desk, not online**.
- **Jul 15 (later session):** Accessible Athens card layout unified — Start Here, all three themed sections, and Planning & Tips now render the identical compact 3-up grid through one shared ArticleCard component (featured per-card ring/shadow removed; Start Here distinguished by tinted band only). Layout-only change, articles.ts untouched, build green. Mid-task catch: replace_all missed the Planning & Tips grid (different indentation) → fixed explicitly, all grids verified identical (→ lesson 15). Repo housekeeping DONE (commit 83aa3b9): image artifacts deleted (verified gone), fix_create_booking.sql → `sql/create_booking_rpc.sql` with sync-note header (158-line RPC body intact), .gitignore consolidated into one documented image block (`/image-work/` + root .webp/.png/.jpg/.jpeg/.heic). Workflow rule added: every session ends with this doc updated (work log, pending tasks, new lessons) and re-uploaded to Claude project knowledge.
- **Jul 15:** Piraeus cruise guide merged+expanded (1,011 words, original slug) + optimized watermark-cropped hero. Accessible Athens page reorganized (featured band + themed sections, blog posts pulled in). Storage overwrite lesson learned.
- **Jul 14:** Knee walker article live. Acropolis guide: Eliana's lift photo inserted (renderer taught image syntax) + generated cover. Knee walker hero (8.8MB→179KB optimization saga → pipeline established). Header nav wrapping fixed (xl breakpoint). Reviews-button hover fixed. **5th review (Thomas B.)**.
- **Jul 7:** Sunday-surcharge tbc-slot follow-up bug fixed in RPC (slot-independent). Christos booked manually (MOV-C96C1CF52B).
- **Jul 5:** THE PRICE-VALIDATION OUTAGE fixed (RPC, after wrong-layer first attempt). Claude Code adopted. Traffic investigation: no SEO problem; impressions record-high; "drop" = comparison artifact + reduced self-testing.
- **Late June:** contact/partner forms fixed + notification system (JWT + RLS lessons). Payment-status feature. Review engine launched → 4 reviews. Eliana's photos approved + testimonial photo live. Pricing display clarified. Partner With Us surfaced.

---

## 12. PENDING TASKS

### Queue (priority order)
- [ ] **Migrate the digest cron (jobid 3) to Supabase Vault**, same pattern as the new abandoned-cart cron — also serves as key rotation once done (generate a fresh key, store it in Vault, retire the old plaintext one from cron + Edge Secrets + Vercel `VITE_INTERNAL_API_KEY`).
- [ ] **Rejected-bookings alert** (create_booking "Price mismatch" → email info@koinis.gr) — HIGH VALUE, now #2 behind the completed abandoned-cart email.
- [ ] **booking_source field** on admin bookings — confirmed Aug 6 the column doesn't exist; currently inferring channel via `stripe_session_id` presence as a workaround.
- [ ] **Message Sameh Adly** (3 duplicate pending attempts, €720 total, same Glyfada address typed 3 ways — likely a confused repeat booking attempt, not 3 real orders).
- [ ] **Verify the two completed-status deposits were actually refunded in Stripe:** Yael Lasry (€150, MOV-EFD7EEC3A8) and Cindy Lou Rogers (€150, MOV-D781FD0B79).
- [ ] **Visual check: Electric Mobility Scooter page** — new description + confirm armrests are visible in the product photo as claimed.
- [ ] **Visual check: three refurbished blog posts** + Quick Takeaway boxes on live site.
- [ ] **Visual check:** /accessible-athens 3-up grid on mobile.
- [ ] **RPC sync check:** `SELECT pg_get_functiondef('create_booking'::regproc);` vs `sql/create_booking_rpc.sql`.
- [ ] **Re-check Piraeus Cruise Terminal bookings** before committing the Nov–Feb Google Ads budget there — only 1 booking in 90 days as of Aug 6 despite being the intended landing segment.
- [ ] **Late October:** digest cron → `30 6 * * *`.

### Future / not urgent
- [ ] **Inquiry-tracking system** for custom/multi-city/one-way `contact_form` inquiries (e.g. Helen's 3-city request, Shari's one-way cruise question) that fall outside the normal booking flow — track as records with status (open/replied/converted/expired) + auto-follow-up if stale. Current volume low (6 inquiries/90 days, per Aug 6 check) — revisit if volume grows.

### Content / marketing
- Nov–Feb Google Ads (€350, US-first) — landing page: the Piraeus cruise guide.
- Next articles: accessible beaches (seasonal) · metro/transport deep-dive · cobblestones guide (from customer feedback).
- ~~Refurbish the three thin launch-era blog posts~~ DONE Jul 15 — all three now accurate + ~800 words, scannable.
- Add 4th/5th reviews to homepage testimonials rotation someday. Article social-preview meta tags (lesson 14). Instagram/FB. Greek FAQ.

---

## 13. BRAND

Primary `#2563EB` · Secondary `#F59E0B` · Accent `#65A30D` · Text `#1F2937` · Bg `#FAFAF9`. Warm "you" language, "mobility equipment" not "medical devices," WCAG 2.1 AA. Trust anchor: Koinis Healthcare since 1982.

---

## 14. WORKFLOW

Claude (chat) writes prompts → **Claude Code** executes in the repo (reads this doc first) → build → push → Vercel green → **human eyeballs the live site**. Edge functions: manual redeploy + verify deployed code. RPC: SQL in SQL Editor + sync `sql/create_booking_rpc.sql` in the same commit. **Price/booking changes: test the full matrix through to Stripe (incl. Sunday-no-slot).** Images: the §8 pipeline, inside `/image-work/`. Storage replacements: delete → verify gone → upload. Grep error strings before fixing; after multi-instance edits, grep to confirm ALL occurrences changed (lesson 15). Copy URLs from stored files. curl in Terminal, SQL in SQL Editor. Verify in dashboards; never trust UI success alone.

**End of every session:** update this doc — Recent Work Log, Pending Tasks (check off done / add new), and any new hard-won lesson — commit it to the repo AND re-upload it to Claude project knowledge so the next chat session starts current.

---

*Last updated: August 15, 2026*
