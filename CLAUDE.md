# CLAUDE.md

## Database rules

Why: on 14 Oct 2026 two DB-only migrations rebuilt `create_booking` from an old base and silently removed the Sunday collection surcharge and the 30-day cap; Sunday-collection bookings failed from 14 Oct to 29 Oct 2026 (15 days).

1. Never change the database (functions, tables, policies, cron) without the same change committed to the repo in the same session. Migrations go in `supabase/migrations`, the RPC in `sql/create_booking_rpc.sql`.
2. Before and after ANY change to `create_booking`, run `sql/verify_create_booking.sql` — every column must be true.
3. Before rewriting a function, read the LIVE definition with `pg_get_functiondef` and diff it against the repo. Never rebuild from an older copy.
4. Edge functions and cron jobs live in the repo too (`supabase/functions`, `sql/*_cron.sql`).
