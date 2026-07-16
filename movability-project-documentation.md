# MOVABILITY.GR — Project Documentation

> **Single source of truth** for the Movability project. Updated: July 15, 2026.
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

### Delivery zones (4 active)
Store Pickup €0 (choose 1 of 3 stores) · Athens City €20 · Athens Airport €50 · Piraeus Cruise Terminal €25. (9 inactive legacy rows — deactivate, never delete.) "Free store pickup," never "free delivery."

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
```
All INTERNAL_API_KEY auth. Browser-called functions: CORS-before-auth + JWT-verification OFF. Bodies: review `{booking_id}` · confirmation `{booking_number}` · contact-notification direct payload · digest `{}`.
6 functions deployed: create-checkout-session · stripe-webhook · send-booking-confirmation · send-review-request · send-daily-digest · send-contact-notification.
Digest cron `30 5 * * *` (=08:30 Athens summer), jobid 3. **Late Oct → `30 6 * * *`.**

---

## 7. BOOKING & PAYMENT INTERNALS

- **create_booking RPC** = insert + PRICE VALIDATION (tier + zone + surcharge; Sunday slot-independent). Rejections say "Price mismatch: expected X, got Y". Current version replaced via SQL Jul 5–7 (fix_create_booking.sql pattern; latest includes the tbc-slot Sunday fix). **Source-controlled copy: `sql/create_booking_rpc.sql`** — any SQL Editor change to the RPC must update this file in the same commit.
- **create-checkout-session** = Stripe line items from the saved row; NO validation here.
- `payment_status` (webhook truth) ≠ `status` (manual label). Admin states: Paid in full / Deposit / **Unpaid–Awaiting payment** + badges + update buttons. Verify real payments in Stripe (cs_live_ + Succeeded).
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

## 11. RECENT WORK LOG (July)

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
- [ ] **Alert on rejected bookings** (create_booking "Price mismatch" etc. → email info@koinis.gr). Would have caught the 11-day outage on day one. HIGHEST VALUE.
- [ ] **Verify `sql/create_booking_rpc.sql` matches the live RPC**: `SELECT pg_get_functiondef('create_booking'::regproc);` in SQL Editor — if it differs (esp. Sunday slot-independent logic), paste the live definition into the file in a follow-up commit.
- [ ] **Visual check** movability.gr/accessible-athens after deploy — 3-up grids on desktop, clean 1-column collapse on mobile (hard refresh).
- [ ] **Abandoned-cart recovery email** — targets the mobile-browse-book-later pattern the device data revealed.
- [ ] **booking_source field** on admin bookings (WhatsApp/Phone/Walk-in dropdown) → true channel mix forever.
- [ ] **Rotate INTERNAL_API_KEY** (~5 places).
- [ ] Mark ended rentals "Completed" (fires auto review email); keep WhatsApp review routine.
- [ ] Sameh Adly (3 pending bookings, scooter Jul 14–19) — was dropped; check if resolved/expired.
- [ ] **Late October:** digest cron → `30 6 * * *`.

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

*Last updated: July 15, 2026*
