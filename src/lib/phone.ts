/**
 * International phone validation — deliberately NOT country-limited.
 *
 * Accepts any E.164-style number: a "+" (or the "00" international prefix)
 * followed by 7–15 digits. Spaces, dashes, dots and parentheses are tolerated
 * as separators. Returns the canonical E.164 form ("+819012345678") or null.
 */
const SEPARATORS = /[\s\-.()]/g;

export function normalizePhone(raw: string): string | null {
  let s = raw.trim().replace(SEPARATORS, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  return /^\+[1-9]\d{6,14}$/.test(s) ? s : null;
}

export const PHONE_ERROR =
  "Enter your number with its country code, e.g. +44 7700 900123 or +30 694 123 4567";
