// Single source of truth for the money rules shared by the monthly accounting
// export (BookingsNew), the admin dashboard (Admin), and the analytics page
// (Analytics). Keep these in ONE place so every surface reconciles to the same
// figure — see lesson 20 (operational flags are not financial filters).

// The owner's own test account — excluded from every money figure everywhere.
// NOTE: pending@moveability.gr is NOT here — it is a placeholder for REAL manual
// bookings whose customer email wasn't captured, so it stays counted.
export const TEST_EMAILS = new Set(["kalogeropoulosbill6@gmail.com"]);

// Minimal structural shape the money rules need. AdminBooking and BookingsNew's
// local Booking type both satisfy it.
export interface MoneyBooking {
  customer_email: string | null;
  payment_status: string;
  total_amount: number | string | null;
  amount_paid: number | string | null;
  amount_due?: number | string | null;
  stripe_payment_intent_id?: string | null;
}

export function isTestBooking(b: MoneyBooking): boolean {
  return TEST_EMAILS.has((b.customer_email ?? "").toLowerCase());
}

// A booking whose money has settled: paid in full, or a deposit put down.
export function isSettled(b: MoneyBooking): boolean {
  return b.payment_status === "paid" || b.payment_status === "deposit_paid";
}

// Effective amount actually received. Handles the pre-Aug-16 webhook artifact
// where fully-paid Stripe rows have amount_paid=0: a settled full payment is
// worth its total, a deposit is worth what was actually put down; anything else
// (pending/failed) is whatever, if anything, came in.
export function effectiveReceived(b: MoneyBooking): number {
  if (b.payment_status === "paid") return Number(b.total_amount || 0);
  if (b.payment_status === "deposit_paid") return Number(b.amount_paid || 0);
  return Number(b.amount_paid || 0);
}

// Channel derivation — Stripe once a payment intent exists (set by the webhook),
// else a manual/cash/WhatsApp booking. Same rule as the accounting export's
// payment_channel column.
export function paymentChannel(b: MoneyBooking): "Stripe" | "Cash/Manual" {
  return b.stripe_payment_intent_id ? "Stripe" : "Cash/Manual";
}
