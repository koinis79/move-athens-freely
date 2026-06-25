# MOVABILITY.GR — Project Documentation

> **Single source of truth** for the Movability project. Updated: June 25, 2026.
> Drop this file in the repo root and have any AI tool (Antigravity, Claude Code, Claude) read it FIRST for full project context.

---

## 1. PROJECT OVERVIEW

**What:** Movability (movability.gr) — Athens-based mobility equipment rental for tourists and locals. Wheelchairs, power wheelchairs, mobility scooters, rollators, knee walkers — delivered to hotels or picked up in-store.

**Owner:** Vasilis (vasileios@koinis.gr) — part of **Koinis Healthcare Group** (founded 1982, Corinth; verified). Stores: Athens Center (Stadiou 31), Kallithea (Davaki 16), Chalandri (Kolokotroni 22).

**Status:** LIVE, taking real bookings (~1 every 2 days, ~15/month). Customer base is mostly international tourists (US, UK, EU).

---

## 2. ⚠️ READ THIS FIRST — HARD-WON LESSONS

1. **A PRICE/VALUE LIVES IN MORE THAN ONE PLACE.** Changing a value in the DB is NOT enough — it's often hardcoded in the frontend too, AND may be guarded by a DB CHECK constraint. After ANY such change, sweep ALL places and test end to end. Cases: equipment prices (DB + `equipmentCatalog.ts`); delivery fees (DB `delivery_zones` + hardcoded `ZONES` in `DeliverySection.tsx` + `HowItWorks.tsx` + article tables); time-slot values (code/UI + DB CHECK constraint).

2. **DB CHECK CONSTRAINTS silently block new values → live payment outage.** When the surcharge feature saved `delivery_time_slot = 'daytime'`, the constraint only allowed old values → bookings REJECTED at payment. Before saving any new value to a column, check its constraints:
   `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'bookings'::regclass;`
   Known constraints on `bookings`: status, payment_type (full/deposit), payment_status (pending/paid/deposit_paid/refunded/failed), delivery_time_slot (daytime/evening/morning/afternoon/tbc/null).

3. **TEST A COMPLETE BOOKING END TO END, not just the price display.** Display correct ≠ saves to DB. Complete a real booking (admin New Booking, or tiny real checkout) — that's the only test that catches DB-level rejections.

4. **Browser-called edge functions need CORS + OPTIONS handled BEFORE auth.** When the admin browser started calling `send-booking-confirmation` (historically webhook-only), it failed with an opaque "network error." Cause: the browser sends an `OPTIONS` preflight with NO auth header; the function ran the auth check first → 401 (without CORS headers) → browser blocked everything. Fix (matches `send-review-request`): handle `OPTIONS` FIRST, include `corsHeaders` on the 401 response, add `Access-Control-Allow-Methods`. **Any function called from the admin browser must follow this order.**

5. **`INTERNAL_API_KEY` must be IDENTICAL everywhere — ~5 places:** Supabase Edge Function Secrets (`INTERNAL_API_KEY`), Vercel env (`VITE_INTERNAL_API_KEY`), the pg_cron job SQL, and any curl/test scripts. Drift → 401. Rotation = update ALL + redeploy functions + redeploy Vercel + recreate cron.

6. **When scheduling pg_cron jobs, REPLACE the key placeholder.** The digest cron silently 401'd for 2 days because the SQL kept the literal `YOUR_INTERNAL_API_KEY_HERE`. Cron `status: succeeded` only means the HTTP request was *sent*, not accepted. Verify with `SELECT jobname, command FROM cron.job;` and a manual fire.

7. **NEVER use `SUPABASE_`-prefixed secrets for function/cron auth** — runtime rewrites the Authorization header → 401. Use `INTERNAL_API_KEY`.

8. **Edge functions do NOT deploy from git.** After pushing, manually redeploy in Supabase Dashboard (GitHub → Raw → copy → paste → Deploy). Right code in the right slot.

9. **ONE repo only:** `~/Desktop/move-athens-freely`. (Old `~/Desktop/KOINIS/` retired; assets in `~/Desktop/KOINIS-assets/`.)

10. **Always `npm run build` before pushing; confirm Vercel "Ready" after.**

11. **Products & delivery zones live in the Supabase DB**, not code. Edit via SQL/admin; read the real schema first, don't guess columns. (e.g. date columns are `rental_start`/`rental_end`, not `start_date`/`end_date`.)

12. **Equipment images:** bucket `equipment-images`, folder `equipment/`, `.webp`. Store filenames with REAL spaces in the DB; the browser encodes `%20`.

13. **curl runs in the TERMINAL; SQL in the Supabase SQL Editor.** Don't paste one into the other ("syntax error at or near..." usually means JSON/curl got pasted into the SQL editor).

---

## 3. TECH STACK

React + Vite + Tailwind · Supabase (Postgres + Auth + Edge Functions + Storage + pg_cron/pg_net) · Stripe (LIVE) · Resend (sender `hello@movability.gr`) · Vercel (auto-deploy from GitHub `main`) · GA4 (G-8RD4VHF74X) + Search Console · Papaki DNS + ImprovMX forwarding (catch-all active) · EN/GR i18n.
Local repo: `~/Desktop/move-athens-freely`. Tool: **Antigravity** (Google AI IDE). Node v20 reinstalled to /tmp each session. GitHub CLI authed as koinis79.

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
- Admin users: vasileios@koinis.gr, kalogeropoulosbill6@gmail.com (Bill / Vasilis Giannakopoulos)

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

Knee Walker: category `walking-aids`, max 136kg, crutch alternative. Foldable Travel Scooter: 5-image gallery. Images in `equipment-images/equipment/*.webp`.

### Delivery zones — ONLY 4 ACTIVE

| Customer sees | slug | zone fee |
|---|---|---|
| Store Pickup | store-pickup | €0 |
| Athens City | athens-city | €20 |
| Athens Airport | athens-airport | €50 |
| Piraeus Cruise Terminal | piraeus-port | €25 |

13 rows total; 9 inactive (legacy/dupes). Deactivate (never delete) anything with bookings. Say "Free store pickup," never "free delivery." Store Pickup → customer picks 1 of 3 stores at checkout (saved to `delivery_address`).

### ⭐ DELIVERY SURCHARGES (time + day, on top of zone fee, DELIVERY ONLY)

Slots (only two): `daytime` Daytime 09:00–17:00 → +€0 · `evening` Evening 17:00–21:00 → +€20.
Weekend (REPLACES time surcharge): any Sunday → +€50; Saturday evening → +€50; Saturday daytime → +€0.
Logic order in shared `getDeliverySurcharge()` (DeliverySection.tsx): pickup→€0; Sunday→€50; Sat evening→€50; else slot value. Computed from `rentalStart` day-of-week. Frontend is the authoritative price calc (create_booking RPC is a pass-through, no server validation). Admin New Booking modal uses the same shared function.

---

## 7. EMAIL & AUTOMATION

```
Stripe checkout → stripe-webhook → send-booking-confirmation
                                     ├── Customer confirmation (hello@movability.gr)
                                     └── Admin notification → info@koinis.gr
Admin New Booking (WhatsApp/phone) → send-booking-confirmation (checkbox, default ON)
Admin marks "Completed" → send-review-request → Customer review email (hello@)
pg_cron daily 08:30 Athens → send-daily-digest → info@koinis.gr
```

Auth: ALL functions use `INTERNAL_API_KEY`. Browser-triggered calls (admin review, admin confirmation) use `VITE_INTERNAL_API_KEY` (must equal Supabase secret) — and the function MUST handle CORS/OPTIONS before auth (see lesson 4). Bodies: send-review-request = `{booking_id}`; send-booking-confirmation = `{booking_number}`; send-daily-digest = `{}`. Resend recipients must be a flat array. Emails land in Gmail Promotions (acceptable). The confirmation email says "Booking Confirmed" (not "Payment received"), so it's safe for unpaid bookings.

`timeSlotLabel()` (in send-booking-confirmation, send-daily-digest, admin BookingsNew): daytime→"Daytime (09:00–17:00)", evening→"Evening (17:00–21:00)", legacy morning/afternoon handled, tbc/null→"To be confirmed".

### Edge functions (all deployed, all INTERNAL_API_KEY auth)
create-checkout-session · stripe-webhook · send-booking-confirmation (now CORS-safe for browser) · send-review-request · send-daily-digest

### Daily digest cron (LIVE)
Job `daily-digest-email`, `30 5 * * *` (05:30 UTC = 08:30 Athens summer), active.
⚠️ **Winter (late Oct):** `SELECT cron.unschedule('daily-digest-email');` then recreate with `30 6 * * *`.
Health: `SELECT jobid,jobname,schedule,active FROM cron.job;` / `SELECT * FROM cron.job_run_details WHERE jobid=<N> ORDER BY start_time DESC;`

### Manual test/resend (run in TERMINAL)
```
curl -s -X POST ".../functions/v1/send-booking-confirmation" -H "Authorization: Bearer <KEY>" -H "Content-Type: application/json" -d '{"booking_number":"MOV-XXXX"}'
curl -s -X POST ".../functions/v1/send-daily-digest" -H "Authorization: Bearer <KEY>" -H "Content-Type: application/json" -d '{}'
```

---

## 8. PAYMENT STATUS (admin)

Admin New Booking offers 3 payment states (mapped to existing constraint values):
- **Paid in full** → payment_status `paid`, payment_type `full` (default)
- **Deposit paid** → `deposit_paid` / `deposit`
- **Unpaid / Awaiting payment** → `pending` / `full` (we do NOT offer "pay on delivery" as a service — this is just an internal "not paid yet" state)

Admin bookings list/cards/slide-over show a color-coded payment badge (green Paid, blue Deposit, amber Unpaid, grey Refunded, red Failed). The slide-over has buttons to UPDATE payment status after creation (mark Paid when money arrives). ⚠️ `payment_status` (money truth, set by Stripe webhook for website bookings) is independent of `status` (operational label you click). To verify a real payment, check Stripe (a `cs_live_` session + Succeeded charge) — not the manual status.

---

## 9. SECRETS

| Secret | Location |
|---|---|
| `INTERNAL_API_KEY` | Supabase Edge Function Secrets (must equal Vercel key + cron SQL) |
| `VITE_INTERNAL_API_KEY` | Vercel Env (browser→function auth) |
| `RESEND_API_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Supabase Edge Function Secrets |

⚠️ **Rotate `INTERNAL_API_KEY`** — exposed in plaintext during debugging. Touches ~5 places: Supabase secret, Vercel env, pg_cron job (unschedule + recreate), redeploy all functions + Vercel.

---

## 10. KEY FILE PATHS (under ~/Desktop/move-athens-freely)

| File | Purpose |
|---|---|
| `src/data/articles.ts` | SEO articles; syntax error breaks WHOLE build; hardcoded delivery-fee tables |
| `src/data/equipmentCatalog.ts` | Static catalog for article CTA cards only |
| `src/components/checkout/DeliverySection.tsx` | Checkout delivery UI + ZONES array + getDeliverySurcharge/getDeliveryFee + 3-store picker + slot picker |
| `src/components/equipment/BookingPanel.tsx` | Product-page booking panel (reads zone fees from DB); surcharge note; date-picker |
| `src/pages/Checkout.tsx` | Threads rentalStart into fee calc; saves slot to p_delivery_time_slot |
| `src/pages/FAQ.tsx` | English-only FAQ (22 entries); FAQPage JSON-LD auto via sections.flatMap() |
| `src/pages/HowItWorks.tsx` | Hardcoded delivery-zones table |
| `src/pages/admin/BookingsNew.tsx` | Admin bookings + New Booking + review trigger + payment badges + updatePaymentStatus + timeSlotLabel |
| `src/components/admin/NewBookingModal.tsx` | Manual booking wizard (create_booking RPC) + surcharge + payment selector + auto confirmation email (checkbox) |
| `vercel.json` | /review redirect |
| `supabase/functions/*` | the 5 edge functions |
| `.gitignore` | includes `*_files/` |

---

## 11. RECENT WORK LOG

### June 25
- **Admin payment-status clarity** (commit 8015e04, reworded 221c197): 3 payment states + color badges in list/cards/slide-over + update-after-creation. "Unpaid / Awaiting payment" wording (not "pay on delivery").
- **CORS bug fixed** in send-booking-confirmation (commit f4fb760): OPTIONS preflight moved before auth + corsHeaders on 401, so the admin "send confirmation email" works from the browser. Redeployed.
- Verified payment of MOV-DD12F82562 (William Pappas, €69 — cs_live_ session, webhook-set paid).
- **WhatsApp review push:** sent personalized (name + equipment) review-request messages to 13 customers whose rentals had ENDED. Skipped customers still renting. (First real review-collection effort.)

### Earlier June (16–22)
- Delivery surcharge feature + live constraint outage fix. Daily digest built, scheduled, cron placeholder-key fixed. Admin New Booking auto-confirmation email. Knee Walker product. Athens City €10→€20. Foldable scooter gallery. 5 new FAQs. Email outage fixed. Date-picker fix. Repo consolidated + cleaned.

---

## 12. PENDING TASKS

### Soon
- [ ] **Rotate `INTERNAL_API_KEY`** (exposed) — ~5 places (§9).
- [ ] **Delete stale `~/Desktop/KOINIS/` folder.**
- [ ] **Mark ended rentals "Completed"** (most sit on "delivered") so the automated review email fires. Many past bookings never triggered it.
- [ ] **Make review outreach a routine** — every week or two, WhatsApp the batch whose rental just ended. (Idea: one-tap "Send review request" WhatsApp button in admin.)
- [ ] **Late October:** digest cron → `30 6 * * *` for winter.

### Later / ideas
- Knee Walker SEO article. Abandoned-cart email. Checkout upsells. Cruise/Piraeus landing page. Hotel/Airbnb flyer. WhatsApp booking confirmations. Double-booking/inventory check. Clean 9 inactive zones. Greek FAQ page. Less-promotional review email. Google Ads (€350 credit, low season). US conversion. Instagram/FB + footer links. Cancel Lovable. Install Node permanently.

---

## 13. WHATSAPP REVIEW TEMPLATES

Personalize name + equipment; send only AFTER the rental has ENDED (not while customer still has the item). Send to most-recent first.

**EN:** Hi [name]! Vasilis from Movability here — hope the [equipment] made your Athens trip easier! If you have 30 seconds, a Google review would mean the world to our family business: https://movability.gr/review 🙏

**GR:** Γεια σας [όνομα]! Ο Βασίλης από τη Movability — ελπίζω ο εξοπλισμός να έκανε την επίσκεψή σας στην Αθήνα πιο εύκολη! Αν έχετε 30 δευτερόλεπτα, μια κριτική στο Google θα σήμαινε πολλά για την οικογενειακή μας επιχείρηση: https://movability.gr/review 🙏

Find recipients (rental ended, has phone):
```sql
SELECT b.booking_number, b.customer_name, b.customer_phone, e.name_en AS equipment, b.rental_end
FROM bookings b
LEFT JOIN booking_items bi ON bi.booking_id = b.id
LEFT JOIN equipment e ON e.id = bi.equipment_id
WHERE b.customer_phone IS NOT NULL AND b.customer_phone != ''
  AND b.rental_end < CURRENT_DATE
  AND b.status IN ('completed','picked_up','delivered','in_use')
ORDER BY b.rental_end DESC LIMIT 30;
```

---

## 14. BRAND

Primary `#2563EB` · Secondary `#F59E0B` · Accent `#65A30D` · Text `#1F2937` · Bg `#FAFAF9`. Warm "you" language, "mobility equipment" not "medical devices," WCAG 2.1 AA. Trust anchor: Koinis Healthcare since 1982.

---

## 15. WORKFLOW

Claude writes prompt → Antigravity edits in `~/Desktop/move-athens-freely` → `npm run build` → push → Vercel green → hard-refresh & verify. Edge functions: redeploy manually in Supabase, then curl-test. DB/zone/product changes: SQL or admin, read real schema first. **After any price/value change: sweep frontend for hardcoded copies, check DB CHECK constraints, complete one real end-to-end booking through payment.** Browser-called functions need CORS/OPTIONS before auth. Fix EN+GR together. curl in Terminal, SQL in SQL editor. Verify in dashboards, never trust UI success alone.

---

*Last updated: June 25, 2026*
