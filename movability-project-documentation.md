# MOVABILITY.GR — Project Documentation

> **Single source of truth** for the Movability project. Updated: June 16, 2026.
> Drop this file in the repo root and have any AI tool (Antigravity, Claude Code, Claude) read it FIRST for full project context.

---

## 1. PROJECT OVERVIEW

**What:** Movability (movability.gr) — Athens-based mobility equipment rental for tourists and locals. Wheelchairs, power wheelchairs, mobility scooters, rollators — delivered to hotels or picked up in-store.

**Owner:** Vasilis (vasileios@koinis.gr) — part of **Koinis Healthcare Group** (founded 1982, Corinth; verified). Stores: Athens Center (Stadiou 31), Kallithea (Davaki 16), Chalandri (Kolokotroni 22).

**Status:** LIVE, taking real bookings (~1 every 2 days, ~15/month).

---

## 2. ⚠️ READ THIS FIRST — HARD-WON LESSONS (June 2026)

These caused a multi-hour outage. Do not repeat them.

1. **`INTERNAL_API_KEY` must be IDENTICAL in TWO places:**
   - Supabase → Edge Functions → Secrets → `INTERNAL_API_KEY` (what the functions CHECK)
   - Vercel → Environment Variables → `VITE_INTERNAL_API_KEY` (what the admin FRONTEND sends)
   - If these drift apart → review emails fail with **401**. Server-to-server calls (webhook → confirmation) use the Supabase secret; browser calls (admin → review) use the Vercel value. **Change one, change both, then redeploy both.**

2. **NEVER use `SUPABASE_`-prefixed secrets for function-to-function auth.** Supabase's edge runtime rewrites the Authorization header on internal calls, so `SUPABASE_SERVICE_ROLE_KEY` as a bearer token gets replaced → receiving function sees a wrong token → **401**. Use `INTERNAL_API_KEY` for all inter-function auth.

3. **When redeploying functions via the dashboard, paste the RIGHT code into the RIGHT function.** They got swapped once (stripe-webhook code ended up in send-booking-confirmation → "Missing stripe-signature" errors). The first line tells you which is which: `import Stripe` = stripe-webhook; `import { createClient }` + buildCustomerHtml = send-booking-confirmation.

4. **ONE repo only:** `~/Desktop/move-athens-freely`. A duplicate clone at `~/Desktop/KOINIS/` caused code confusion — now retired. Assets archived in `~/Desktop/KOINIS-assets/`. The old `KOINIS/` folder is stale (delete when convenient).

5. **Always `npm run build` locally before pushing**, and **always confirm Vercel shows "Ready" (green)** after. A failing build means the live site silently stays on the last good version.

6. **Edge functions do NOT deploy from git.** After pushing, manually redeploy in Supabase Dashboard (GitHub → Raw → copy → paste → Deploy).

---

## 3. TECH STACK

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind (built originally in Lovable, now independent) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions + Storage) |
| Payments | Stripe (LIVE) |
| Email | Resend (`hello@movability.gr` customer-facing) |
| Hosting | Vercel (auto-deploys from GitHub `main`) |
| Analytics | GA4 (G-8RD4VHF74X) + Search Console |
| Domain / email forwarding | Papaki (DNS) + ImprovMX (forwarding; catch-all alias active) |
| Local repo path | **`~/Desktop/move-athens-freely`** (the ONLY valid path) |
| Local tooling | Node v20 (reinstall to /tmp each session — not permanent); GitHub CLI authed as koinis79 |

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
| Google Review link | https://g.page/r/CRIC4z0HieHaEBM/review (also via https://movability.gr/review) |

**Supabase Project ID:** `lmgpuqgwkiapgpdsxvmb`

---

## 5. CONTACT & BUSINESS INFO

- **Customer email (sender):** hello@movability.gr
- **Public/reply email:** info@movability.gr → forwards to **info@koinis.gr** (ImprovMX catch-all)
- **Admin notification email:** info@koinis.gr
- **WhatsApp:** +30 697 463 3697
- **Admin users:** vasileios@koinis.gr, kalogeropoulosbill6@gmail.com

---

## 6. EQUIPMENT & PRICING

⚠️ **Prices are PER RENTAL PERIOD, not per day.** Never display "/day". Source of truth: `src/data/equipmentCatalog.ts`.

| Product | Slug | 1–3d | 4–7d | 8–14d | 15–30d |
|---|---|---|---|---|---|
| Manual Wheelchair | manual-wheelchair | €49 | €79 | €149 | €199 |
| Transit Wheelchair | transit-wheelchair | €49 | €79 | €149 | €199 |
| Lightweight Folding Wheelchair | lightweight-folding-wheelchair | €79 | €99 | €179 | €249 |
| Electric Mobility Scooter | electric-mobility-scooter | €120 | €220 | €300 | €400 |
| Foldable Travel Scooter | foldable-travel-scooter | €150 | €250 | €350 | €450 |
| Foldable Power Wheelchair | foldable-power-wheelchair | €150 | €250 | €350 | €450 |
| Rollator Walker | rollator-walker | €49 | €79 | €149 | €199 |

**Delivery zones (authoritative):** Store Pickup **Free** · Athens City **€10** · Piraeus Cruise Terminal **€25** · Athens Airport **€50**.
⚠️ Marketing must say "Free store pickup," NOT "free delivery."

---

## 7. EMAIL SYSTEM

### Flow
```
Stripe checkout → stripe-webhook → send-booking-confirmation
                                     ├── Customer confirmation (from hello@movability.gr)
                                     └── Admin notification → info@koinis.gr

Admin marks "Completed" (admin dashboard) → send-review-request → Customer review email (from hello@)
```

### Auth model (CRITICAL — see Lessons §2)
- **stripe-webhook → send-booking-confirmation:** server-to-server, Authorization `Bearer ${INTERNAL_API_KEY}` (the Supabase secret). Both functions read/check `INTERNAL_API_KEY`.
- **admin dashboard → send-review-request:** browser call, sends `VITE_INTERNAL_API_KEY` (Vercel). Function checks `INTERNAL_API_KEY` (Supabase). **These two values MUST be identical.**

### Edge Functions

| Function | Status | Notes |
|---|---|---|
| `create-checkout-session` | ✅ Live | |
| `stripe-webhook` | ✅ Live | Sends INTERNAL_API_KEY to confirmation fn |
| `send-booking-confirmation` | ✅ Live | Customer (hello@) + admin (info@koinis.gr); auth = INTERNAL_API_KEY; body expects `booking_number` |
| `send-review-request` | ✅ Live | Fires on "Completed"; auth = INTERNAL_API_KEY; body expects `booking_id`; dedupe via `review_requested_at` |
| `send-daily-digest` | ❌ Not deployed | Deferred |

### Manual re-send of a confirmation (for missed bookings)
```
curl -s -w "\n\nHTTP_STATUS: %{http_code}\n" -X POST \
  "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-booking-confirmation" \
  -H "Authorization: Bearer <INTERNAL_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"booking_number":"MOV-XXXXXXXXXX"}'
```
200 + `{"sent":true}` = customer + admin emails sent. (Used June 16 to recover 2 missed bookings.)

### Other email facts
- Resend recipients must be a flat array: `to: ["x@y.com"]` — never comma-string, never nested array.
- `moveability_cart` localStorage key keeps the OLD typo on purpose — renaming wipes carts. Leave it.
- Review emails currently land in Gmail **Promotions** (acceptable). To improve: make the email more personal/less HTML-heavy. WhatsApp follow-up converts far better for reviews.

---

## 8. SECRETS (locations only — values not stored here)

| Secret | Location | Must match? |
|---|---|---|
| `INTERNAL_API_KEY` | Supabase Edge Function Secrets | **Must equal** Vercel's `VITE_INTERNAL_API_KEY` |
| `VITE_INTERNAL_API_KEY` | Vercel Env Vars | **Must equal** Supabase's `INTERNAL_API_KEY` |
| `RESEND_API_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_SECRET_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_WEBHOOK_SECRET` | Supabase Edge Function Secrets | — |

⚠️ **Rotate `INTERNAL_API_KEY` soon** — it was exposed in plaintext during the June 16 debugging session. To rotate: set the SAME new value in both Supabase secret + Vercel `VITE_INTERNAL_API_KEY`, then redeploy the 3 functions AND redeploy Vercel.

---

## 9. KEY FILE PATHS (all under ~/Desktop/move-athens-freely)

| File | Purpose |
|---|---|
| `src/data/articles.ts` | SEO articles: `guides` array + `blogPosts` array. ⚠️ A syntax error here breaks the WHOLE Vercel build |
| `src/data/equipmentCatalog.ts` | Authoritative price tiers |
| `src/i18n/en.json` / `gr.json` | UI translations — fix BOTH on copy changes |
| `src/pages/FAQ.tsx` | FAQ (pricing, fees, accessibility claims) |
| `src/pages/admin/BookingsNew.tsx` | Admin bookings list + New Booking button + review-request trigger (sends `{booking_id: prev.id}`) |
| `src/components/admin/NewBookingModal.tsx` | Manual booking wizard (uses `create_booking` RPC) |
| `src/components/admin/AdminLayout.tsx` | Admin shell (mobile hamburger, overflow-x-hidden) |
| `vercel.json` | Contains `/review` → Google review redirect (before SPA rewrite) |
| `supabase/functions/stripe-webhook/index.ts` | Stripe webhook (`import Stripe...`) |
| `supabase/functions/send-booking-confirmation/index.ts` | Customer + admin email (`import { createClient }...`) |
| `supabase/functions/send-review-request/index.ts` | Review email |

---

## 10. ADMIN DASHBOARD FEATURES

- Booking management with forward-only status workflow (Confirmed → Delivered → Completed). To revert a status, edit the `status` field directly in the Supabase table editor.
- **New Booking button** — manual bookings for phone/WhatsApp orders (uses the same `create_booking` RPC as Stripe checkout; review email fires normally; `review_requested_at` stays NULL on creation).
- **Mobile-friendly** (June 16): below md breakpoint, bookings render as cards with on-card quick-action status buttons — no phone rotation needed. Detail panel full-screen on mobile. NewBookingModal full-height on mobile.
- Booking timeline/history, real-time notifications + sound, print packing slip, bulk actions (Archive All, Export CSV w/ UTF-8 BOM), equipment rental status, calendar view.

---

## 11. JUNE 2026 — WORK COMPLETED

- Audit fixes: pricing consistency (per-period framing, real numbers), "free delivery" → "free store pickup" (EN+GR), email typo `moveability`→`movability` (4 files), FAQ pricing + Acropolis precision + airport fee €30→€50.
- Electric wheelchair SEO article moved inside `guides` array (was breaking the build).
- New Booking button (manual bookings via `create_booking` RPC).
- Mobile-friendly admin bookings.
- **Email outage fully resolved:** (a) review-request `booking_number`→`booking_id` body fix; (b) deliverability — hello@ sender + reply_to + same-domain /review link + ImprovMX hello@ alias; (c) the big one — `SUPABASE_SERVICE_ROLE_KEY` → `INTERNAL_API_KEY` for webhook→confirmation auth; (d) corrected swapped function code; (e) synced Vercel `VITE_INTERNAL_API_KEY` to Supabase value (was the final 401 on review emails).
- Recovered 2 real bookings (MOV-E5A97DABEF, MOV-EA79C52F4E) that came in during the outage.
- Repo cleanup: retired duplicate clone, moved working repo to `~/Desktop/move-athens-freely`, archived assets to `~/Desktop/KOINIS-assets`.

---

## 12. PENDING TASKS

### Soon
- [ ] **Rotate `INTERNAL_API_KEY`** (exposed in chat) — same value in Supabase + Vercel, redeploy both.
- [ ] **Delete stale `~/Desktop/KOINIS/` folder** (assets safe in KOINIS-assets; repo moved out).
- [ ] **WhatsApp review messages** to past customers (biggest growth lever; templates below).
- [ ] **Greek FAQ** — confirm gr.json mirrors the June FAQ fixes.
- [ ] Store pickup clarity — name the 3 locations in the booking form.
- [ ] Date-picker overlay z-index glitch on product pages.

### Deferred
- [ ] Make review email more personal (less HTML) to escape Gmail Promotions.
- [ ] Google Ads (€350 credit) — low season Nov–Feb. Best CVR: Italy 50%, NL 33%, AU 33%, Greece ~29%, USA 12.7%.
- [ ] US conversion: trust signals, international FAQ, USD hint, cruise keywords.
- [ ] New SEO articles: Accessible Hotels, 3-Day Itinerary, Power Wheelchair Rental.
- [ ] Instagram/Facebook accounts + real footer links.
- [ ] Deploy `send-daily-digest` + pg_cron.
- [ ] Cancel Lovable subscription.
- [ ] Install Node permanently on the Mac.

---

## 13. WHATSAPP REVIEW TEMPLATES

**EN:** Hi [name]! Vasilis from Movability here — hope the equipment made your Athens trip easier! If you have 30 seconds, a Google review would mean the world to our small family business: https://movability.gr/review 🙏

**GR:** Γεια σας [όνομα]! Ο Βασίλης από τη Movability — ελπίζω ο εξοπλισμός να έκανε την επίσκεψή σας στην Αθήνα πιο εύκολη! Αν έχετε 30 δευτερόλεπτα, μια κριτική στο Google θα σήμαινε πολλά για τη μικρή οικογενειακή μας επιχείρηση: https://movability.gr/review 🙏

---

## 14. BRAND

Primary Mediterranean Blue `#2563EB` · Secondary Warm Orange `#F59E0B` · Accent Olive Green `#65A30D` · Text Charcoal `#1F2937` · Background Warm White `#FAFAF9`. Tone: warm, direct "you" language, "mobility equipment" not "medical devices." WCAG 2.1 AA. Trust anchor: Koinis Healthcare since 1982.

---

## 15. WORKFLOW

Claude (chat) writes prompt → Antigravity edits in `~/Desktop/move-athens-freely` → `npm run build` locally → push → Vercel green → hard-refresh & verify live. Edge functions: redeploy manually in Supabase after push. Fix EN+GR together. Verify in Supabase/Resend/Stripe dashboards, never trust UI success alone. Never expose secret values in code or docs.

---

*Last updated: June 16, 2026*
