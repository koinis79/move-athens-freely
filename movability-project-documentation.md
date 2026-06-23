# MOVABILITY.GR — Project Documentation

> **Single source of truth** for the Movability project. Updated: June 22, 2026.
> Drop this file in the repo root and have any AI tool (Antigravity, Claude Code, Claude) read it FIRST for full project context.

---

## 1. PROJECT OVERVIEW

**What:** Movability (movability.gr) — Athens-based mobility equipment rental for tourists and locals. Wheelchairs, power wheelchairs, mobility scooters, rollators, knee walkers — delivered to hotels or picked up in-store.

**Owner:** Vasilis (vasileios@koinis.gr) — part of **Koinis Healthcare Group** (founded 1982, Corinth; verified). Stores: Athens Center (Stadiou 31), Kallithea (Davaki 16), Chalandri (Kolokotroni 22).

**Status:** LIVE, taking real bookings (~1 every 2 days, ~15/month).

---

## 2. ⚠️ READ THIS FIRST — HARD-WON LESSONS

1. **A PRICE/VALUE LIVES IN MORE THAN ONE PLACE.** Changing a value in the Supabase DB is NOT enough — it's often also hardcoded in the frontend, AND may be guarded by a DB CHECK constraint. After ANY such change, sweep ALL the places and test end to end. Confirmed cases:
   - Equipment prices: DB `equipment` table + `equipmentCatalog.ts` (article CTAs).
   - Delivery fees: DB `delivery_zones` table + hardcoded `ZONES` array in `DeliverySection.tsx` (the actual CHECKOUT calc) + `HowItWorks.tsx` table + article tables.
   - **Time-slot values: the code/UI + a DB CHECK constraint on `bookings.delivery_time_slot`.** (See lesson 2.)

2. **DB CHECK CONSTRAINTS will silently block new values → live payment outage.** When the surcharge feature started saving `delivery_time_slot = 'daytime'`, the `bookings_delivery_time_slot_check` constraint only allowed `morning/afternoon/evening/tbc` → every booking with the new default slot was REJECTED at the payment step → customers couldn't pay. Status/price showed fine; the DB write failed last. **Before saving any new value to a column, check its constraints:**
   `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'bookings'::regclass;`
   Other constraints on `bookings`: status, payment_type (full/deposit), payment_status (pending/paid/deposit_paid/refunded/failed).

3. **TEST A COMPLETE BOOKING END TO END, not just the price display.** The surcharge bug slipped through because we verified the *displayed price* and a *unit test of the math*, but never completed a real booking through to a saved/paid row. A self-test booking (admin New Booking, or a tiny real checkout) catches DB-level rejections that display/unit tests cannot. Display correct ≠ saves to DB.

4. **`INTERNAL_API_KEY` must be IDENTICAL everywhere it lives — now ~5 places:** Supabase Edge Function Secrets (`INTERNAL_API_KEY`), Vercel env (`VITE_INTERNAL_API_KEY`), the **pg_cron job SQL** (daily digest), and any curl/test scripts. Drift → 401 → emails/digest fail. Rotation = update ALL + redeploy functions + redeploy Vercel + recreate the cron job.

5. **When scheduling pg_cron jobs, REPLACE the key placeholder.** The digest cron silently failed for 2 days because the schedule SQL was run with the literal text `YOUR_INTERNAL_API_KEY_HERE` instead of the real key → function returned 401. The cron `status` showed "succeeded" (it only means the HTTP request was *sent*, not accepted). Always verify: `SELECT jobname, command FROM cron.job;` shows the real key, and fire a manual test.

6. **NEVER use `SUPABASE_`-prefixed secrets for function/cron auth** — the edge runtime rewrites the Authorization header → 401. Use `INTERNAL_API_KEY`.

7. **Edge functions do NOT deploy from git.** After pushing, manually redeploy in Supabase Dashboard (GitHub → Raw → copy → paste → Deploy). Put the right code in the right slot.

8. **ONE repo only:** `~/Desktop/move-athens-freely`. (Old duplicate `~/Desktop/KOINIS/` retired; assets in `~/Desktop/KOINIS-assets/`.)

9. **Always `npm run build` locally before pushing; confirm Vercel "Ready" (green) after.**

10. **Products & delivery zones live in the Supabase DB**, not code. Edit via SQL/admin; read the real schema first, don't guess columns.

11. **Equipment images:** bucket `equipment-images`, folder `equipment/`, `.webp` (NOT the `assets` bucket). Store filenames with REAL spaces in the DB (e.g. `name (1).webp`); the browser encodes `%20` automatically.

12. **curl runs in the TERMINAL; SQL runs in the Supabase SQL Editor.** Don't paste one into the other (a recurring slip — "syntax error at or near..." usually means JSON or curl got pasted into the SQL editor).

---

## 3. TECH STACK

React + Vite + Tailwind · Supabase (Postgres + Auth + Edge Functions + Storage + pg_cron/pg_net) · Stripe (LIVE) · Resend (sender `hello@movability.gr`) · Vercel (auto-deploy from GitHub `main`) · GA4 (G-8RD4VHF74X) + Search Console · Papaki DNS + ImprovMX forwarding (catch-all active) · EN/GR i18n.
Local repo: `~/Desktop/move-athens-freely`. Workflow tool: **Antigravity** (Google AI IDE). Node v20 reinstalled to /tmp each Antigravity session (not permanent). GitHub CLI authed as koinis79.

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

- **Knee Walker:** category `walking-aids`, max user 136kg, crutch alternative (foot/ankle recovery). Images `equipment-images/equipment/rent-knee-rollator-strolly*.webp`.
- **Foldable Travel Scooter:** 5-image gallery (`.jpg` thumbnail + 4 `rent-folding-mobility-scooter-with-remote-control-aegle*.webp`).

### Delivery zones — ONLY 4 ARE ACTIVE (what customers see)

| Customer sees | slug | zone fee |
|---|---|---|
| Store Pickup | store-pickup | €0 |
| Athens City | athens-city | €20 |
| Athens Airport | athens-airport | €50 |
| Piraeus Cruise Terminal | piraeus-port | €25 |

The DB has 13 zone rows — 9 are `is_active = false` (legacy/duplicates). Could clean up later but only deactivate (never delete) anything with bookings. Marketing must say "Free store pickup," never "free delivery."
**Store Pickup** lets the customer pick 1 of 3 stores at checkout (`DeliverySection.tsx`), saved to `delivery_address`.

### ⭐ DELIVERY SURCHARGES (time + day, on top of zone fee, DELIVERY ONLY)

Time slots (only TWO — no late-night/21:00+ option):
| Slot value | Label | Surcharge |
|---|---|---|
| `daytime` | Daytime (09:00–17:00) | +€0 |
| `evening` | Evening (17:00–21:00) | +€20 |

Weekend rule (REPLACES the time surcharge, does NOT stack):
- Any **Sunday** (any slot) → +€50
- **Saturday evening** (17:00+) → +€50
- Saturday daytime → normal (+€0)

Logic order (in shared `getDeliverySurcharge()` in `DeliverySection.tsx`): pickup → €0; Sunday → €50; Saturday evening → €50; else slot value. Examples: Mon Daytime Athens City €20 · Wed Evening €40 · Sat Daytime €20 · Sat Evening €70 · Sun €70 · Pickup €0. The surcharge is computed from the delivery date (`rentalStart`) day-of-week. Frontend is the authoritative price calc — the `create_booking` RPC is a pass-through with NO server-side validation, so the frontend math must be airtight. Admin New Booking modal uses the same shared surcharge function.

---

## 7. EMAIL & AUTOMATION

```
Stripe checkout → stripe-webhook → send-booking-confirmation
                                     ├── Customer confirmation (hello@movability.gr)
                                     └── Admin notification → info@koinis.gr
Admin New Booking (WhatsApp/phone) → send-booking-confirmation (checkbox, default ON)
Admin marks "Completed" → send-review-request → Customer review email (hello@)
pg_cron daily 08:30 Athens → send-daily-digest → info@koinis.gr (today's deliveries/pickups + tomorrow preview + pending)
```

Auth: ALL functions use `INTERNAL_API_KEY`. Browser-triggered calls (admin review, admin confirmation) use `VITE_INTERNAL_API_KEY` which MUST equal the Supabase secret. Bodies: send-review-request = `{booking_id}`; send-booking-confirmation = `{booking_number}`; send-daily-digest = `{}`. Resend recipients must be a flat array. Review/confirmation emails land in Gmail Promotions (acceptable).

`timeSlotLabel()` maps slot values in send-booking-confirmation, send-daily-digest, and admin BookingsNew: `daytime → "Daytime (09:00–17:00)"`, `evening → "Evening (17:00–21:00)"`, legacy `morning/afternoon` handled, `tbc/null → "To be confirmed"`.

### Edge functions (all deployed, all INTERNAL_API_KEY auth)
create-checkout-session · stripe-webhook · send-booking-confirmation · send-review-request · send-daily-digest

### Daily digest cron (LIVE)
- Job `daily-digest-email`, schedule `30 5 * * *` (05:30 UTC = 08:30 Athens EEST/summer), active. (Current jobid 3 after the placeholder-key fix.)
- ⚠️ **Winter time (late Oct):** Athens → UTC+2 → 8:30 local = 06:30 UTC. To keep 8:30: `SELECT cron.unschedule('daily-digest-email');` then recreate with `30 6 * * *`.
- Requires pg_cron + pg_net (enabled).
- Health checks: `SELECT jobid,jobname,schedule,active FROM cron.job;` and `SELECT * FROM cron.job_run_details WHERE jobid=<N> ORDER BY start_time DESC;`

### Manual test/resend commands (run in TERMINAL)
```
# Resend a confirmation to the customer on a booking
curl -s -X POST "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-booking-confirmation" \
  -H "Authorization: Bearer <INTERNAL_API_KEY>" -H "Content-Type: application/json" \
  -d '{"booking_number":"MOV-XXXXXXXXXX"}'

# Fire the digest now
curl -s -X POST "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/send-daily-digest" \
  -H "Authorization: Bearer <INTERNAL_API_KEY>" -H "Content-Type: application/json" -d '{}'
```

---

## 8. SECRETS

| Secret | Location | Notes |
|---|---|---|
| `INTERNAL_API_KEY` | Supabase Edge Function Secrets | Must equal Vercel `VITE_INTERNAL_API_KEY` AND the value in the cron job SQL |
| `VITE_INTERNAL_API_KEY` | Vercel Env Vars | Browser→function auth (admin review + admin confirmation) |
| `RESEND_API_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_SECRET_KEY` | Supabase Edge Function Secrets | — |
| `STRIPE_WEBHOOK_SECRET` | Supabase Edge Function Secrets | — |

⚠️ **Rotate `INTERNAL_API_KEY`** — exposed in plaintext during debugging. Rotation touches ~5 places: Supabase secret, Vercel env, the pg_cron job (unschedule + recreate), redeploy all functions + Vercel. (The Supabase anon key also appeared in chat — fine, public-by-design, protected by RLS.)

---

## 9. KEY FILE PATHS (under ~/Desktop/move-athens-freely)

| File | Purpose |
|---|---|
| `src/data/articles.ts` | SEO articles (`guides` + `blogPosts`). Syntax error breaks the WHOLE build. Hardcoded delivery-fee tables. |
| `src/data/equipmentCatalog.ts` | Static catalog for article CTA cards only |
| `src/components/checkout/DeliverySection.tsx` | Checkout delivery UI + hardcoded ZONES array + `getDeliverySurcharge()` + `getDeliveryFee()` + 3-store pickup picker + slot picker |
| `src/components/equipment/BookingPanel.tsx` | Product-page booking panel — reads zone fees from DB; surcharge note; date-picker |
| `src/pages/Checkout.tsx` | Threads `rentalStart` into fee calc; saves real slot to `p_delivery_time_slot` |
| `src/pages/FAQ.tsx` | English-only hardcoded FAQ (22 entries); FAQPage JSON-LD auto-generated via `sections.flatMap()` |
| `src/pages/HowItWorks.tsx` | Hardcoded delivery-zones display table |
| `src/pages/admin/BookingsNew.tsx` | Admin bookings + New Booking button + review trigger (`{booking_id}`) + mobile cards + timeSlotLabel |
| `src/components/admin/NewBookingModal.tsx` | Manual booking wizard (create_booking RPC) + surcharge + auto confirmation email (checkbox) |
| `vercel.json` | `/review` → Google review redirect |
| `supabase/functions/*` | the 5 edge functions |
| `.gitignore` | includes `*_files/` (blocks accidental saved-webpage dumps) |

---

## 10. RECENT WORK LOG

### June 22
- **Delivery surcharge feature** (commit 32fb213): evening (+€20) + weekend (+€50) surcharges, slot picker (daytime/evening), shared `getDeliverySurcharge()`, fee breakdown in checkout/email/admin.
- **LIVE PAYMENT OUTAGE fixed:** `bookings_delivery_time_slot_check` constraint didn't allow `daytime` → customers couldn't pay. Dropped + recreated constraint to allow daytime/evening/morning/afternoon/tbc/null.
- **Daily digest cron fixed:** schedule SQL had literal `YOUR_INTERNAL_API_KEY_HERE` → silent 401s for 2 days. Recreated with the real key (jobid 3), verified.
- **Admin New Booking now sends confirmation email** (commit 394c5ef): fire-and-forget to send-booking-confirmation, non-blocking, checkbox default ON.
- Admin New Booking modal aligned to new slots + surcharge (commit cd0370b).
- Foldable Travel Scooter 5-image gallery; 5 new FAQs (17→22); repo cleanup (`*_files/` gitignored).
- Verified booking MOV-DD12F82562 (William Pappas, €69) was genuinely paid (cs_live_ session + webhook-set payment_status).

### June 16–18
- Email outage fixed (INTERNAL_API_KEY auth); recovered 2 missed bookings. Knee Walker product added. Athens City delivery €10 → €20 (DB + hardcoded spots). Daily digest built + scheduled. Date-picker fix. Store-pickup label clarified. Audit fixes. Repo consolidated.

---

## 11. PENDING TASKS

### Soon
- [ ] **Rotate `INTERNAL_API_KEY`** (exposed) — update ~5 places (see §8).
- [ ] **Delete stale `~/Desktop/KOINIS/` folder.**
- [ ] **WhatsApp review messages** to past customers (biggest growth lever; templates §12). Idea: one-tap "Send review request" WhatsApp button in admin.
- [ ] **Late October:** update digest cron to `30 6 * * *` for winter time.

### Later / ideas
- [ ] Knee Walker SEO article ("knee walker / knee scooter rental athens").
- [ ] Abandoned-cart recovery email; checkout upsells (cushion, extra day, 2nd item).
- [ ] Cruise/Piraeus landing page; hotel/Airbnb partnership flyer.
- [ ] WhatsApp booking confirmations; check double-booking/inventory awareness.
- [ ] Clean up 9 inactive duplicate delivery zones (deactivate-safe; check bookings first).
- [ ] Greek FAQ page (FAQ.tsx is English-only). Make review email less "promotional" (escape Gmail Promotions).
- [ ] Google Ads (€350 credit, low season Nov–Feb). US conversion (trust, cruise keywords). Instagram/FB + footer links. Cancel Lovable. Install Node permanently.

---

## 12. WHATSAPP REVIEW TEMPLATES

**EN:** Hi [name]! Vasilis from Movability here — hope the equipment made your Athens trip easier! If you have 30 seconds, a Google review would mean the world to our small family business: https://movability.gr/review 🙏

**GR:** Γεια σας [όνομα]! Ο Βασίλης από τη Movability — ελπίζω ο εξοπλισμός να έκανε την επίσκεψή σας στην Αθήνα πιο εύκολη! Αν έχετε 30 δευτερόλεπτα, μια κριτική στο Google θα σήμαινε πολλά για τη μικρή οικογενειακή μας επιχείρηση: https://movability.gr/review 🙏

---

## 13. BRAND

Primary `#2563EB` · Secondary `#F59E0B` · Accent `#65A30D` · Text `#1F2937` · Bg `#FAFAF9`. Warm "you" language, "mobility equipment" not "medical devices," WCAG 2.1 AA. Trust anchor: Koinis Healthcare since 1982.

---

## 14. WORKFLOW

Claude writes prompt → Antigravity edits in `~/Desktop/move-athens-freely` → `npm run build` → push → Vercel green → hard-refresh & verify. Edge functions: redeploy manually in Supabase, then curl-test. DB/zone/product changes: SQL or admin form, read real schema first. **After any price/value change: sweep frontend for hardcoded copies, check DB CHECK constraints, and complete one real end-to-end booking through payment.** Fix EN+GR together. curl in Terminal, SQL in SQL editor. Verify in dashboards, never trust UI success alone.

---

*Last updated: June 22, 2026*
