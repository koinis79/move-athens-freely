/**
 * generate-privacy-policy.mjs
 *
 * Builds src/data/privacyPolicy.ts from the lawyer-reviewed markdown:
 *
 *   privacy-policy-el.md  ->  gr   (AUTHORITATIVE text)
 *   privacy-policy-en.md  ->  en   (provided for convenience)
 *
 * WHY GENERATED, not hand-copied: this is legal text with ten sections, seven
 * tables and two languages. Transcribing it by hand risks a silent error in a
 * document whose whole value is accuracy, and the lawyer will revise it again —
 * at which point this is one command instead of a careful re-read.
 *
 * The "Internal notes" section of the EN file is EXCLUDED: it is a working
 * checklist, not public policy, and it names the reviewer.
 *
 * Usage:
 *   node scripts/generate-privacy-policy.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "data", "privacyPolicy.ts");

/** Publication date, in each language's own format. */
const LAST_UPDATED = { en: "2 October 2026", gr: "2 Οκτωβρίου 2026" };

/** Sections whose heading matches this are never published. */
const EXCLUDE_HEADING = /^internal notes/i;

/** The author byline above section 1 is internal, not policy text. */
const BYLINE = /·\s*@/;

/** "Last updated: ..." is rendered from LAST_UPDATED, not from the body. */
const LAST_UPDATED_LINE = /^(Last updated|Τελευταία ενημέρωση)\s*:/i;

const META = {
  en: {
    metaTitle: "Privacy Policy | Movability",
    metaDescription:
      "How Movability (KOINIS IKE) collects, uses and retains your personal data when you rent mobility equipment in Athens.",
    lastUpdatedLabel: "Last updated",
    pendingLabel: "Pending",
    contactLine: "Questions about this policy? Email us at",
  },
  gr: {
    metaTitle: "Πολιτική Απορρήτου | Movability",
    metaDescription:
      "Πώς η ΚΟΪΝΗΣ ΙΚΕ συλλέγει, χρησιμοποιεί και διατηρεί τα προσωπικά σας δεδομένα κατά την ενοικίαση εξοπλισμού κινητικότητας στην Αθήνα.",
    lastUpdatedLabel: "Τελευταία ενημέρωση",
    pendingLabel: "Εκκρεμεί",
    contactLine: "Ερωτήσεις για αυτήν την πολιτική; Στείλτε email στο",
  },
};

/** Split a markdown table row into trimmed cells. */
const cells = (line) =>
  line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

const isTableRow = (l) => /^\s*\|/.test(l);
const isTableSep = (l) => /^\s*\|[\s:|-]+\|?\s*$/.test(l);

/** Strip markdown escapes the lawyer's editor inserted (e.g. \[date\]). */
const unescape = (s) => s.replace(/\\([[\]()*_])/g, "$1");

/**
 * Parse one policy file into { intro, sections }.
 *
 * Deliberately a small purpose-built parser rather than a markdown library: the
 * input is two known files with a fixed shape, and a dependency that renders
 * arbitrary markdown into a React page would also be a way for the wrong thing
 * to end up as markup.
 */
function parsePolicy(md) {
  const lines = md.split("\n");
  const intro = [];
  const sections = [];
  let current = null;
  let buffer = [];
  let seenH1 = false;

  const flushParagraph = () => {
    const text = unescape(buffer.join(" ").trim());
    buffer = [];
    if (!text || LAST_UPDATED_LINE.test(text)) return;
    (current ? current.body : intro).push(text);
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (/^#\s/.test(line)) { seenH1 = true; continue; }

    if (/^##\s/.test(line)) {
      flushParagraph();
      const heading = unescape(line.replace(/^##\s*/, "").trim());
      current = EXCLUDE_HEADING.test(heading)
        ? null                                  // swallow the rest of that section
        : { heading, body: [] };
      if (current) sections.push(current);
      continue;
    }

    // Inside an excluded section: ignore everything until the next heading.
    if (current === null && sections.length > 0) continue;

    if (!line.trim()) { flushParagraph(); continue; }
    if (!seenH1) continue;
    if (BYLINE.test(line)) continue;

    // Table
    if (isTableRow(line)) {
      flushParagraph();
      const headers = cells(line);
      let j = i + 1;
      if (j < lines.length && isTableSep(lines[j])) j++;
      const rows = [];
      while (j < lines.length && isTableRow(lines[j]) && !isTableSep(lines[j])) {
        rows.push(cells(lines[j]));
        j++;
      }
      (current ? current.body : intro).push({ headers, rows });
      i = j - 1;
      continue;
    }

    // Bulleted list
    if (/^[-*]\s/.test(line)) {
      flushParagraph();
      const items = [];
      let j = i;
      while (j < lines.length && /^[-*]\s/.test(lines[j].trim())) {
        items.push(unescape(lines[j].trim().replace(/^[-*]\s*/, "")));
        j++;
      }
      (current ? current.body : intro).push(items);
      i = j - 1;
      continue;
    }

    buffer.push(line.trim());
  }
  flushParagraph();
  return { intro, sections };
}

async function build(lang, file) {
  const md = await readFile(join(ROOT, file), "utf-8");
  const { intro, sections } = parsePolicy(md);

  if (sections.length !== 10) {
    throw new Error(`${file}: expected 10 published sections, parsed ${sections.length}`);
  }
  if (JSON.stringify(sections).toLowerCase().includes("internal notes")) {
    throw new Error(`${file}: the Internal notes section leaked into the output`);
  }
  if (JSON.stringify(sections).includes("@")) {
    const stray = sections.flatMap((s) =>
      JSON.stringify(s).match(/\S*@\S*/g) ?? []).filter((m) => !m.includes("movability.gr"));
    if (stray.length) throw new Error(`${file}: unexpected @ handles in output: ${stray.join(", ")}`);
  }

  return {
    ...META[lang],
    title: lang === "gr" ? "Πολιτική Απορρήτου" : "Privacy Policy",
    lastUpdated: LAST_UPDATED[lang],
    intro,
    sections: sections.map((s, i) => ({ id: String(i + 1), ...s })),
  };
}

async function main() {
  const en = await build("en", "privacy-policy-en.md");
  const gr = await build("gr", "privacy-policy-el.md");

  const file = `// GENERATED by scripts/generate-privacy-policy.mjs — DO NOT EDIT BY HAND.
//
// Source of truth: privacy-policy-el.md (AUTHORITATIVE) and privacy-policy-en.md
// (for convenience). Edit those, then re-run the script.
//
// The "Internal notes" section of the EN file is excluded on purpose: it is a
// working checklist, not public policy.
//
// Generated: ${new Date().toISOString().slice(0, 10)}
// Sections: en ${en.sections.length}, gr ${gr.sections.length}

/** A table inside a policy section. */
export interface PolicyTable {
  headers: string[];
  rows: string[][];
}

/** A string is a paragraph, a string[] is a bulleted list, else a table. */
export type PolicyBlock = string | string[] | PolicyTable;

export interface PolicySection {
  id: string;
  heading: string;
  body: PolicyBlock[];
}

export interface PolicyDoc {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  pendingLabel: string;
  intro: PolicyBlock[];
  sections: PolicySection[];
  contactLine: string;
}

export const privacyPolicy: Record<"en" | "gr", PolicyDoc> = ${JSON.stringify({ en, gr }, null, 2)};
`;

  await writeFile(OUT, file, "utf-8");
  console.log(`privacy policy: en ${en.sections.length} sections, gr ${gr.sections.length} sections`);
}

main().catch((err) => {
  console.error(`privacy policy: generation FAILED — ${err?.message ?? err}`);
  process.exit(1);
});
