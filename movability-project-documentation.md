# MOVABILITY.GR — Project Documentation

> **Single source of truth** for the Movability project. Updated: June 18, 2026.
> Drop this file in the repo root and have any AI tool (Antigravity, Claude Code, Claude) read it FIRST for full project context.

---

## 1. PROJECT OVERVIEW

**What:** Movability (movability.gr) — Athens-based mobility equipment rental for tourists and locals. Wheelchairs, power wheelchairs, mobility scooters, rollators, knee walkers — delivered to hotels or picked up in-store.

**Owner:** Vasilis (vasileios@koinis.gr) — part of **Koinis Healthcare Group** (founded 1982, Corinth; verified). Stores: Athens Center (Stadiou 31), Kallithea (Davaki 16), Chalandri (Kolokotroni 22).

**Status:** LIVE, taking real bookings (~1 every 2 days, ~15/month).

---

## 2. ⚠️ READ THIS FIRST — HARD-WON LESSONS

1. **A PRICE LIVES IN MORE THAN ONE PLACE.** Changing a price/fee in the Supabase DB is NOT enough — values are also hardcoded in the frontend. After ANY price/fee change, sweep the frontend AND test the real checkout total. Confirmed cases:
   - Equipment prices: DB + `equipmentCatalog.ts` (article CTAs).
   - Delivery fees: DB `delivery_zones` table + hardcoded `ZONES` array in `src/components/checkout/DeliverySection.tsx` (the actual CHECKOUT calculation) + `HowItWorks.tsx` table + article tables. Changing only the DB makes the dropdown show new price but checkout charge the old one.

2. **`INTERNAL_API_KEY` must be IDENTICAL everywhere it lives — now FOUR places:**
   - Supabase → Edge Function Secrets → `INTERNAL_API_KEY` (functions check this)
   - Vercel → Env Vars → `VITE_INTERNAL_API_KEY` (admin frontend sends this)
   - The **pg_cron job SQL** (daily digest) — stores the key inline in the cron command
   - (any curl/test scripts)
   Drift → 401 → emails/digest fail. Rotate = update ALL of them + redeploy functions + redeploy Vercel + re-create the cron job.

3. **NEVER use `SUPABASE_`-prefixed secrets for function-to-function or cron auth** — the edge runtime rewrites the Authorization header. Use `INTERNAL_API_KEY`. (This bit us on send-booking-confirmation AND send-daily-digest.)

4. **Edge functions do NOT deploy from git.** After pushing, manually redeploy in Supabase Dashboard (GitHub → Raw → copy → paste → Deploy). Put the right code in the right function slot (first line: `import Stripe` = stripe-webhook; `import { createClient }` + buildCustomerHtml = send-booking-confirmation).

5. **ONE repo only:** `~/Desktop/move-athens-freely`. (Old duplicate clone `~/Desktop/KOINIS/` retired; assets in `~/Desktop/KOINIS-assets/`.)

6. **Always `npm run build` locally before pushing; confirm Vercel "Ready" (green) after.**

7. **Products & delivery zones live in the Supabase DB**, not code. Add/edit via SQL or admin form; read the real schema first, don't guess columns.

8. **Equipment images** go in the `equipment-images` bucket, `equipment/` folder, as `.webp` (NOT the `assets` bucket). Store filenames with REAL spaces in the DB (e.g. `name (1).webp`); the browser encodes `%20` automatically.

9. **Test edge functions with a curl BEFORE relying on them** (don't wait for a real booking or the cron). 200 + email arrived = working.

---

## 3. TECH STACK

React + Vite + Tailwind · Supabase (Postgres + Auth + Edge Functions + Storage + pg_cron/pg_net) · Stripe (LIVE) · Resend (sender `hello@movability.gr`) · Vercel (auto-deploy from GitHub `main`) · GA4 (G-8RD4VHF74X) + Search Console · Papaki DNS + ImprovMX forwarding (catch-all active) · EN/GR i18n.
Local repo: `~/Desktop/move-athens-freely`. Node v20 reinstalled to /tmp each session (not permanent). GitHub CLI authed as koinis79.

---

## 4. KEY URLS

| Resource | URL |
|---|---|
| Live site | https://movability.gr |
| Admin | https://movability.gr/admin |
| GitHub | https://github.com/koinis79/move-athens-freely |
| Supabase | https://supabase.com/dashboard/project/lmgpuqgwkiapgpdsxvmb |
| Stripe | https://dashboard.stripe.com |
| Resend | https://resend.com/emails |
| Google Review | https://g.page/r/CRIC4z0HieHaEBM/review (also https://movability.gr/review) |

**Supabase Project ID:** `lmgpuqgwkiapgpdsxvmb`

---

## 5. CONTACT & BUSINESS INFO

- Customer sender: hello@movability.gr · Public/reply: info@movability.gr → forwards to info@koinis.gr
- Admin notification + daily digest recipient: info@koinis.gr
- WhatsApp: +30 697 463 3697
- Admin users: vasileios@koinis.gr, kalogeropoulosbill6@gmail.com

---

## 6. EQUIPMENT & PRICING

⚠️ **Per RENTAL PERIOD, not per day.** Source of truth: Supabase `equipment` table.

| Product | Slug | 1–3d | 4–7d | 8–14d | 15–30d |
|---|---|---|---|---|---|
| Manual Wheelchair | manual-wheelchair | €49 | €79 | €149 | €199 |
| Transit Wheelchair | transit-wheelchair | €49 | €79 | €149 | €199 |
| Lightweight Folding Wheelchair | lightweight-folding-wheelchair | €79 | €99 | €179 | €249 |
| Electric Mobility Scooter | electric-mobility-scooter | €120 | €220 | €300 | €400 |
| Foldable Travel Scooter | foldable-travel-scooter | €150 | €250 | €350 | €450 |
| Foldable Power Wheelchair | foldable-power-wheelchair | €150 | €250 | €350 | €450 |
| Rollator Walker | rollator-walker | €49 | €79 | €149 | €199 |
| Knee Walker (Knee Scooter) | knee-walker | €49 | €79 | €149 | €199 |

- **Knee Walker** (added Jun 16): category `walking-aids`, max user 136kg, crutch alternative for foot/ankle recovery. 3 images.
- **Foldable Travel Scooter** (Jun 18): now has a 5-image gallery (`.jpg` thumbnail + 4 `rent-folding-mobility-scooter-with-remote-control-aegle*.webp`).
- All equipment images: bucket `equipment-images`, folder `equipment/`, `.webp` preferred.

### Delivery zones — ONLY 4 ARE ACTIVE (what customers see)

| Customer sees | slug | fee |
|---|---|---|
| Store Pickup | store-pickup | €0 |
| Athens City | athens-city | €20 (was €10, changed Jun 16) |
| Athens Airport | athens-airport | €50 |
| Piraeus Cruise Terminal | piraeus-port | €25 |

⚠️ The DB has 13 zone rows — 9 are `is_active = false` (legacy/duplicates). Customers never see them. Could clean up later but only deactivate (don't delete) anything with bookings. Marketing must say "Free store pickup," never "free delivery."
**Store Pickup** lets the customer choose 1 of 3 stores at checkout (built in `DeliverySection.tsx`, saved to `delivery_address`).

---

## 7. EMAIL & AUTOMATION

```
Stripe checkout → stripe-webhook → send-booking-confirmation
                                     ├── Customer confirmation (hello@movability.gr)
                                     └── Admin notification → info@koinis.gr
Admin marks "Completed" → send-review-request → Customer review email (hello@)
pg_cron daily 08:30 Athens → send-daily-digest → info@koinis.gr (today's deliveries/pickups + tomorrow preview + pending)
```

Auth: ALL functions use `INTERNAL_API_KEY`. webhook→confirmation is server-to-server; admin→review is browser (`VITE_INTERNAL_API_KEY`, must equal Supabase secret); cron→digest sends the key in the cron SQL header. send-review-request body = `booking_id`; send-booking-confirmation body = `booking_number`; send-daily-digest body = `{}`. Resend recipients must be a flat array. Review emails land in Gmail Promotions (acceptable).

### Edge functions
create-checkout-session ✅ · stripe-webhook ✅ · send-booking-confirmation ✅ · send-review-request ✅ · **send-daily-digest ✅ (deployed Jun 18, INTERNAL_API_KEY auth, Europe/Athens timezone)**

### Daily digest cron (LIVE)
- Job: `daily-digest-email`, schedule `30 5 * * *` (05:30 UTC = 08:30 Athens EEST/summer), active.
- ⚠️ **Winter time (late Oct):** Athens becomes UTC+2 → 8:30 local = 06:30 UTC. To keep 8:30, run `SELECT cron.unschedule('daily-digest-email');` then re-create with `30 6 * * *`. (Or leave it and accept ±1hr seasonal drift.)
- Requires pg_cron + pg_net extensions (enabled).
- Check schedule: `SELECT jobid, jobname, schedule, active FROM cron.job;`

### Manual re-send / test commands (run in TERMINAL, not SQL editor)
Re-send a confirmation:
```
curl -s -X POST "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-booking-confirmation" \
  -H "Authorization: Bearer <INTERNAL_API_KEY>" -H "Content-Type: application/json" \
  -d '{"booking_number":"MOV-XXXXXXXXXX"}'
```
Test the digest:
```
curl -s -X POST "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-daily-digest" \
  -H "Authorization: Bearer <INTERNAL_API_KEY>" -H "Content-Type: application/json" -d '{}'
```

---

## 8. SECRETS

| Secret | Location | Notes |
|---|---|---|
| `INTERNAL_API_KEY` | Supabase Edge Function Secrets | Must equal Vercel `VITE_INTERNAL_API_KEY` AND the value in the cron job SQL |
| `VITE_INTERNAL_API_KEY` | Vercel Env Vars | Must equal Supabase `INTERNAL_API_KEY` |
| `RESEND_API_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_SECRET_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_WEBHOOK_SECRET` | Supabase Edge Function Secrets | — |

⚠️ **Rotate `INTERNAL_API_KEY`** — it was exposed in plaintext during debugging. Rotation now touches FOUR places: Supabase secret, Vercel env, the pg_cron job (unschedule + recreate), and redeploy all functions + Vercel. (The Supabase anon key also appeared in chat — fine, it's public-by-design, protected by RLS.)

---

## 9. KEY FILE PATHS (under ~/Desktop/move-athens-freely)

| File | Purpose |
|---|---|
| `src/data/articles.ts` | SEO articles (`guides` + `blogPosts`). Syntax error breaks the WHOLE build. Has hardcoded delivery-fee tables. |
| `src/data/equipmentCatalog.ts` | Static catalog for article CTA cards only |
| `src/components/checkout/DeliverySection.tsx` | Checkout delivery UI + hardcoded ZONES array fees + 3-store pickup picker |
| `src/components/equipment/BookingPanel.tsx` | Product-page booking panel — reads zone fees from DB at runtime; date-picker popover (fixed Jun 16) |
| `src/pages/FAQ.tsx` | English-only hardcoded FAQ; shape `{q, a}` in `items[]` grouped by section `title`; FAQPage JSON-LD auto-generated via `sections.flatMap()` (22 FAQs as of Jun 18) |
| `src/pages/HowItWorks.tsx` | Hardcoded delivery-zones display table |
| `src/pages/admin/BookingsNew.tsx` | Admin bookings + New Booking button + review trigger (`{booking_id: prev.id}`); mobile card view |
| `src/components/admin/NewBookingModal.tsx` | Manual booking wizard (uses `create_booking` RPC) |
| `vercel.json` | `/review` → Google review redirect |
| `supabase/functions/*` | stripe-webhook, send-booking-confirmation, send-review-request, send-daily-digest |
| `.gitignore` | includes `*_files/` (blocks accidental saved-webpage dumps) |

---

## 10. RECENT WORK LOG

### June 18
- Foldable Travel Scooter: 5-image gallery added (kept existing thumbnail, appended 4 `.webp`).
- 5 new FAQs added (17 → 22): knee walker, extend rental, book ahead, store pickup + delivery costs, Greek islands. Auto-included in FAQPage JSON-LD.
- Repo cleanup: removed accidentally committed saved-webpage folder (54 files); added `*_files/` to .gitignore.
- **Daily digest LIVE:** send-daily-digest deployed (INTERNAL_API_KEY auth, Athens timezone, today + tomorrow + pending), scheduled via pg_cron at 08:30 Athens. Tested 200.

### June 16
- Email outage fully fixed (INTERNAL_API_KEY auth, swapped-code corrected, Vercel/Supabase key sync); recovered 2 missed bookings.
- Audit fixes (pricing, free-store-pickup wording, email typo, FAQ pricing/airport fee, Greek "3 locations").
- New Booking button; mobile-friendly admin; date-picker fix.
- Knee Walker product added.
- Store-pickup label clarified.
- Athens City delivery €10 → €20 (DB + all hardcoded spots).
- Repo consolidated to `~/Desktop/move-athens-freely`.

---

## 11. PENDING TASKS

### Soon
- [ ] **Rotate `INTERNAL_API_KEY`** (exposed) — update 4 places (see §8).
- [ ] **Delete stale `~/Desktop/KOINIS/` folder.**
- [ ] **WhatsApp review messages** to past customers (biggest growth lever; templates §12).
- [ ] **Late October:** update digest cron to `30 6 * * *` for winter time.

### Later
- [ ] Knee Walker SEO article ("knee walker / knee scooter rental athens").
- [ ] Clean up 9 inactive duplicate delivery zones (deactivate-safe; check bookings first).
- [ ] Greek FAQ page (FAQ.tsx is English-only) — low priority, mostly tourist audience.
- [ ] Make review email more personal (escape Gmail Promotions).
- [ ] Google Ads (€350 credit, low season Nov–Feb). US conversion (trust signals, cruise keywords). More SEO articles. Instagram/FB + footer links. Cancel Lovable. Install Node permanently.

---

## 12. WHATSAPP REVIEW TEMPLATES

**EN:** Hi [name]! Vasilis from Movability here — hope the equipment made your Athens trip easier! If you have 30 seconds, a Google review would mean the world to our small family business: https://movability.gr/review 🙏

**GR:** Γεια σας [όνομα]! Ο Βασίλης από τη Movability — ελπίζω ο εξοπλισμός να έκανε την επίσκεψή σας στην Αθήνα πιο εύκολη! Αν έχετε 30 δευτερόλεπτα, μια κριτική στο Google θα σήμαινε πολλά για τη μικρή οικογενειακή μας επιχείρηση: https://movability.gr/review 🙏

---

## 13. BRAND

Primary `#2563EB` · Secondary `#F59E0B` · Accent `#65A30D` · Text `#1F2937` · Bg `#FAFAF9`. Warm "you" language, "mobility equipment" not "medical devices," WCAG 2.1 AA. Trust anchor: Koinis Healthcare since 1982.

---

## 14. WORKFLOW

Claude writes prompt → Antigravity edits in `~/Desktop/move-athens-freely` → `npm run build` → push → Vercel green → hard-refresh & verify. Edge functions: redeploy manually in Supabase, then curl-test. DB/zone/product changes: SQL or admin form, read real schema first. After any price change: sweep frontend for hardcoded copies + test real checkout. Fix EN+GR together. Verify in dashboards, never trust UI success alone. curl commands run in TERMINAL, SQL in the Supabase SQL editor — don't mix them up.

---

*Last updated: June 18, 2026*
