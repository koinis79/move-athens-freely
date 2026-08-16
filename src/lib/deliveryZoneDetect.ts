/**
 * Best-effort keyword match of a free-text address to a delivery-zone slug.
 *
 * ADVISORY ONLY — the zone dropdown / admin selection is always the source of
 * truth. This never blocks or auto-switches anything; it only powers gentle
 * "did you mean…" hints (checkout) and a review warning (admin).
 *
 * Returns null when no keyword matches. Matching is case- AND accent-insensitive
 * across both Latin and Greek script: NFD normalization splits accented letters
 * into base + combining mark, and we strip the combining marks (U+0300–U+036F),
 * so "Γλυφάδα", "ΓΛΥΦΑΔΑ" and "glyfada" all collapse to the same stem.
 */
export function detectZoneFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const l = address
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (l.trim().length < 3) return null;

  // Airport — checked first ("airport" contains "port", which the Piraeus rule
  // below would otherwise catch).
  if (/airport|venizelos|eleftherios|aerodrom|αεροδρομ/.test(l)) return "athens-airport";

  // Rafina — MUST precede the generic Piraeus/port rule, or Rafina addresses
  // fall through to piraeus-port (the old silent-undercharge trap).
  if (/rafina|ραφην/.test(l)) return "rafina-port";

  // Piraeus / cruise / ferry / port
  if (/piraeus|πειραι|cruise|ferry|port|λιμαν/.test(l)) return "piraeus-port";

  // Southern suburbs & Athens Riviera
  if (/glyfada|γλυφαδ|kifisia|kifissia|κηφισ|vouliagmeni|βουλιαγμ|voula|βουλα/.test(l)) return "suburbs-riviera";

  return null;
}
