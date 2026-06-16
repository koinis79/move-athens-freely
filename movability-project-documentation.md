# MOVABILITY.GR — Project Documentation

> **Single source of truth** for the Movability project. Updated: June 16, 2026 (evening).
> Drop this file in the repo root and have any AI tool (Antigravity, Claude Code, Claude) read it FIRST for full project context.

---

## 1. PROJECT OVERVIEW

**What:** Movability (movability.gr) — Athens-based mobility equipment rental for tourists and locals. Wheelchairs, power wheelchairs, mobility scooters, rollators, **knee walkers** — delivered to hotels or picked up in-store.

**Owner:** Vasilis (vasileios@koinis.gr) — part of **Koinis Healthcare Group** (founded 1982, Corinth; verified). Stores: Athens Center (Stadiou 31), Kallithea (Davaki 16), Chalandri (Kolokotroni 22).

**Status:** LIVE, taking real bookings (~1 every 2 days, ~15/month).

---

## 2. ⚠️ READ THIS FIRST — HARD-WON LESSONS

1. **A PRICE LIVES IN MORE THAN ONE PLACE.** Changing a price/fee in the Supabase DB is NOT enough — values are also hardcoded in the frontend. After ANY price/fee change, sweep the frontend for hardcoded copies. Confirmed cases:
   - Equipment prices: DB + `equipmentCatalog.ts` (article CTAs)
   - **Delivery fees: DB `delivery_zones` table + hardcoded `ZONES` array in `src/components/checkout/DeliverySection.tsx` (this is the actual CHECKOUT calculation) + How It Works table + article tables.** Changing only the DB makes the dropdown show the new price but checkout charge the old one.
   - Always test the real checkout total after a price change.

2. **`INTERNAL_API_KEY` must be IDENTICAL in TWO places:** Supabase Edge Function Secrets (`INTERNAL_API_KEY`) AND Vercel env (`VITE_INTERNAL_API_KEY`). Drift → 401 → emails fail. Change one, change both, redeploy both.

3. **NEVER use `SUPABASE_`-prefixed secrets for function-to-function auth** — the edge runtime rewrites the Authorization header. Use `INTERNAL_API_KEY`.

4. **Edge functions do NOT deploy from git.** After pushing, manually redeploy in Supabase Dashboard (GitHub → Raw → copy → paste → Deploy). Make sure the right code goes in the right function slot (first line: `import Stripe` = stripe-webhook; `import { createClient }` + buildCustomerHtml = send-booking-confirmation).

5. **ONE repo only:** `~/Desktop/move-athens-freely`. (Old duplicate clone at `~/Desktop/KOINIS/` retired; assets in `~/Desktop/KOINIS-assets/`.)

6. **Always `npm run build` locally before pushing; always confirm Vercel "Ready" (green) after.**

7. **Products & delivery zones live in the Supabase DB**, not code. Adding/editing them is a SQL/admin task, not a code push. Read the real schema before writing INSERT/UPDATE — don't guess columns.

8. **Equipment images** go in the `equipment-images` bucket, `equipment/` folder, as `.webp` (NOT the `assets` bucket). Store filenames with real spaces in the DB; the browser encodes `%20` automatically.

---

## 3. TECH STACK

React + Vite + Tailwind · Supabase (Postgres + Auth + Edge Functions + Storage) · Stripe (LIVE) · Resend (sender `hello@movability.gr`) · Vercel (auto-deploy from GitHub `main`) · GA4 (G-8RD4VHF74X) + Search Console · Papaki DNS + ImprovMX forwarding (catch-all active) · EN/GR i18n.
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
- Admin notification email: info@koinis.gr
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
| **Knee Walker (Knee Scooter)** | **knee-walker** | **€49** | **€79** | **€149** | **€199** |

Knee Walker (added June 16): category `walking-aids`, max user 136kg, images in `equipment-images/equipment/rent-knee-rollator-strolly*.webp`. Targets injury-recovery market (foot/ankle surgery, fractures) — crutch alternative.

### Delivery zones — ONLY 4 ARE ACTIVE (what customers see)

| Customer sees | slug | fee | is_active |
|---|---|---|---|
| Store Pickup | store-pickup | €0 | ✅ |
| **Athens City** | **athens-city** | **€20** (was €10, changed June 16) | ✅ |
| Athens Airport | athens-airport | €50 | ✅ |
| Piraeus Cruise Terminal | piraeus-port | €25 | ✅ |

⚠️ The DB has **13 zone rows** — 9 are `is_active = false` (legacy/duplicates: city-center, extended-center, suburbs-riviera, piraeus-cruise, piraeus-ferry, airport, rafina-port, lavrio-port, attractions). Customers never see them. They could be cleaned up later but only after checking no bookings reference them (deactivate, don't delete, anything with bookings). Marketing must say "Free store pickup," never "free delivery."

**Store Pickup** lets the customer choose 1 of 3 stores at checkout (Athens Center/Stadiou 31, Kallithea/Davaki 16, Chalandri/Kolokotroni 22) — built in `DeliverySection.tsx`, saved to `delivery_address`.

---

## 7. EMAIL SYSTEM

```
Stripe checkout → stripe-webhook → send-booking-confirmation
                                     ├── Customer confirmation (hello@movability.gr)
                                     └── Admin notification → info@koinis.gr
Admin marks "Completed" → send-review-request → Customer review email (hello@)
```

Auth: webhook→confirmation uses `INTERNAL_API_KEY` (Supabase secret). Admin→review uses `VITE_INTERNAL_API_KEY` (Vercel) which MUST equal the Supabase `INTERNAL_API_KEY`. send-review-request body expects `booking_id`; send-booking-confirmation body expects `booking_number`. Resend recipients must be a flat array. Review emails land in Gmail Promotions (acceptable).

Manual re-send a confirmation:
```
curl -s -X POST "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-booking-confirmation" \
  -H "Authorization: Bearer <INTERNAL_API_KEY>" -H "Content-Type: application/json" \
  -d '{"booking_number":"MOV-XXXXXXXXXX"}'
```

Edge functions: create-checkout-session ✅, stripe-webhook ✅, send-booking-confirmation ✅, send-review-request ✅, send-daily-digest ❌ (not deployed).

---

## 8. SECRETS (locations only)

| Secret | Location | Must match? |
|---|---|---|
| `INTERNAL_API_KEY` | Supabase Edge Function Secrets | = Vercel `VITE_INTERNAL_API_KEY` |
| `VITE_INTERNAL_API_KEY` | Vercel Env Vars | = Supabase `INTERNAL_API_KEY` |
| `RESEND_API_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_SECRET_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_WEBHOOK_SECRET` | Supabase Edge Function Secrets | — |

⚠️ **Rotate `INTERNAL_API_KEY`** — exposed in plaintext during June 16 debugging. To rotate: same new value in Supabase secret + Vercel `VITE_INTERNAL_API_KEY`, then redeploy 3 functions AND Vercel.
(The Supabase **anon key** also appeared in chat — that's fine, it's public-by-design, protected by RLS.)

---

## 9. KEY FILE PATHS (under ~/Desktop/move-athens-freely)

| File | Purpose |
|---|---|
| `src/data/articles.ts` | SEO articles (`guides` + `blogPosts`). A syntax error breaks the WHOLE build. Has hardcoded delivery-fee tables. |
| `src/data/equipmentCatalog.ts` | Static catalog for article CTA cards only |
| `src/data/equipment.ts` | Mostly dead code; only types/helpers (`getPriceForDays`, `categorySlugMap`) are used |
| `src/components/checkout/DeliverySection.tsx` | Checkout delivery UI + **hardcoded ZONES array with fees** + 3-store pickup picker |
| `src/components/equipment/BookingPanel.tsx` | Product-page booking panel — reads zone fees from DB at runtime |
| `src/pages/HowItWorks.tsx` | Has a hardcoded delivery-zones display table |
| `src/pages/FAQ.tsx` | English-only hardcoded FAQ (no Greek version) |
| `src/pages/admin/BookingsNew.tsx` | Admin bookings + New Booking button + review trigger (`{booking_id: prev.id}`) |
| `src/components/admin/NewBookingModal.tsx` | Manual booking wizard (uses `create_booking` RPC) |
| `vercel.json` | `/review` → Google review redirect |
| `supabase/functions/*` | stripe-webhook, send-booking-confirmation, send-review-request |

---

## 10. JUNE 16 SESSION — COMPLETED

- Full email outage fixed (INTERNAL_API_KEY auth, swapped function code, Vercel/Supabase key sync); recovered 2 missed bookings.
- Audit: per-period pricing, free-store-pickup wording, email typo, FAQ pricing/airport fee, Greek "3 locations" fix.
- New Booking button (manual bookings via `create_booking` RPC).
- Mobile-friendly admin bookings.
- Date-picker popover background/z-index fix.
- **Knee Walker product added** (DB insert + 3 .webp images).
- Store-pickup label clarified on product pages ("choose location at checkout").
- **Athens City delivery €10 → €20** (DB + DeliverySection ZONES array + HowItWorks table + article table).
- Repo cleanup: single repo at `~/Desktop/move-athens-freely`, assets in `~/Desktop/KOINIS-assets`.

---

## 11. PENDING TASKS

### Soon
- [ ] **Rotate `INTERNAL_API_KEY`** (exposed) — same value Supabase + Vercel, redeploy both.
- [ ] **Delete stale `~/Desktop/KOINIS/` folder.**
- [ ] **WhatsApp review messages** to past customers (biggest growth lever; templates §12).
- [ ] Verify checkout shows Athens City €20 for next real booking.

### Later
- [ ] Knee Walker SEO article ("knee walker / knee scooter rental athens" — low competition, high intent).
- [ ] Clean up 9 inactive duplicate delivery zones (deactivate-safe; check bookings first).
- [ ] Greek FAQ page (FAQ.tsx is English-only) — low priority, mostly tourist audience.
- [ ] Make review email more personal (escape Gmail Promotions).
- [ ] Google Ads (€350 credit, low season Nov–Feb).
- [ ] US conversion (trust signals, cruise keywords). New SEO articles. Instagram/FB + footer links. Deploy send-daily-digest. Cancel Lovable. Install Node permanently.

---

## 12. WHATSAPP REVIEW TEMPLATES

**EN:** Hi [name]! Vasilis from Movability here — hope the equipment made your Athens trip easier! If you have 30 seconds, a Google review would mean the world to our small family business: https://movability.gr/review 🙏

**GR:** Γεια σας [όνομα]! Ο Βασίλης από τη Movability — ελπίζω ο εξοπλισμός να έκανε την επίσκεψή σας στην Αθήνα πιο εύκολη! Αν έχετε 30 δευτερόλεπτα, μια κριτική στο Google θα σήμαινε πολλά για τη μικρή οικογενειακή μας επιχείρηση: https://movability.gr/review 🙏

---

## 13. BRAND

Primary `#2563EB` · Secondary `#F59E0B` · Accent `#65A30D` · Text `#1F2937` · Bg `#FAFAF9`. Warm "you" language, "mobility equipment" not "medical devices," WCAG 2.1 AA. Trust anchor: Koinis Healthcare since 1982.

---

## 14. WORKFLOW

Claude writes prompt → Antigravity edits in `~/Desktop/move-athens-freely` → `npm run build` → push → Vercel green → hard-refresh & verify. Edge functions: redeploy manually in Supabase. DB/zone/product changes: SQL or admin form, read real schema first. After any price change: sweep frontend for hardcoded copies + test real checkout. Fix EN+GR together. Verify in dashboards, never trust UI success alone.

---

*Last updated: June 16, 2026 (evening)*
