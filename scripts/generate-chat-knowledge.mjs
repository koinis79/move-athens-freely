/**
 * generate-chat-knowledge.mjs
 *
 * Rewrites the GENERATED KNOWLEDGE region inside
 * supabase/functions/claude-chat/index.ts from the real sources, so the
 * chatbot's knowledge cannot silently drift from the website:
 *
 *   chatbot-system-prompt.md  -> PROMPT_TEMPLATE   (editable source of truth)
 *   src/pages/FAQ.tsx         -> FAQ               (€-bearing answers EXCLUDED)
 *   src/pages/HowItWorks.tsx  -> HOW_IT_WORKS      (steps + its own small faqs)
 *   src/data/articles.ts      -> ARTICLE_INDEX     (slug, title, one-liner)
 *
 * WHY GENERATED: edge functions run in Deno and cannot import from src/, so the
 * alternative is hand-copying website prose into the function — a second copy
 * that drifts the moment someone edits the FAQ page. This script makes the copy
 * derived and re-runnable instead.
 *
 * WHY € IS STRIPPED: feeding a hardcoded price list into the system prompt would
 * make the bot a fourth price layer (docs §2 lesson 1). Prices come from the LIVE
 * equipment fetch at request time, never from this file. The script fails loudly
 * if a € ever survives into the output.
 *
 * Edge functions do NOT deploy from git (docs §2 lesson 12) — after running this,
 * redeploy claude-chat manually and verify the deployed code contains the change.
 *
 * Usage:
 *   node scripts/generate-chat-knowledge.mjs
 */

import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// index.ts is deliberately SELF-CONTAINED so it can be pasted into the Supabase
// dashboard editor, so the knowledge is spliced into it between markers rather
// than written to a module it would have to import.
const OUT = join(ROOT, "supabase", "functions", "claude-chat", "index.ts");
const BEGIN = "/* ── BEGIN GENERATED KNOWLEDGE";
const END = "/* ── END GENERATED KNOWLEDGE ─────────────────────────────────────────────── */";

/** Stores we offer free pickup at. Korinthos is in site_settings but is ~80km
 *  from Athens, and the system prompt promises "three Athens stores" — so it is
 *  deliberately not a pickup option. Change here if that ever changes. */
const ATHENS_PICKUP_STORES = ["Athens Center", "Kallithea", "Chalandri"];

/** Decode the \uXXXX escapes articles.ts/FAQ.tsx use for non-ASCII. */
const decode = (s) =>
  s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
   .replace(/\\"/g, '"')
   .replace(/\\\\/g, "\\");

/** Pull `q:`/`a:` pairs out of a literal array block. */
function extractQA(source, arrayName) {
  const start = source.indexOf(arrayName);
  if (start < 0) throw new Error(`${arrayName} not found`);
  const block = source.slice(start);
  const out = [];
  const re = /q:\s*"((?:[^"\\]|\\.)*)"\s*,\s*\n?\s*a:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(block))) out.push({ q: decode(m[1]), a: decode(m[2]) });
  return out;
}

async function buildFaq() {
  const src = await readFile(join(ROOT, "src", "pages", "FAQ.tsx"), "utf-8");
  const all = extractQA(src, "const sections");
  if (all.length < 15) throw new Error(`FAQ.tsx: only parsed ${all.length} pairs — parser is stale`);

  // Also fold in the small faqs array on the How It Works page. FAQ.tsx wins on
  // a duplicate question — it is the canonical FAQ surface.
  const hiw = await readFile(join(ROOT, "src", "pages", "HowItWorks.tsx"), "utf-8");
  const extra = extractQA(hiw, "const faqs");

  const seen = new Set(all.map((x) => x.q.toLowerCase()));
  for (const item of extra) {
    if (!seen.has(item.q.toLowerCase())) { all.push(item); seen.add(item.q.toLowerCase()); }
  }

  const kept = all.filter((x) => !x.a.includes("€") && !x.q.includes("€"));
  const dropped = all.filter((x) => x.a.includes("€") || x.q.includes("€"));
  return { kept, dropped };
}

async function buildHowItWorks() {
  const src = await readFile(join(ROOT, "src", "pages", "HowItWorks.tsx"), "utf-8");
  const start = src.indexOf("const steps");
  if (start < 0) throw new Error("HowItWorks.tsx: const steps not found");
  const block = src.slice(start, src.indexOf("const BLUE"));
  const steps = [];
  const re = /title:\s*"((?:[^"\\]|\\.)*)"\s*,\s*\n?\s*desc:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(block))) steps.push({ title: decode(m[1]), desc: decode(m[2]) });
  if (steps.length < 4) throw new Error(`HowItWorks.tsx: only parsed ${steps.length} steps — parser is stale`);
  return steps.filter((s) => !s.desc.includes("€"));
}

/** Bundle articles.ts via esbuild (asset imports stubbed) to read the real exports. */
async function buildArticleIndex() {
  const { build } = await import("esbuild");
  const tmp = await mkdtemp(join(tmpdir(), "chat-knowledge-"));
  const outfile = join(tmp, "articles.mjs");
  try {
    await build({
      entryPoints: [join(ROOT, "src", "data", "articles.ts")],
      outfile, bundle: true, format: "esm", platform: "node", logLevel: "silent",
      plugins: [{
        name: "stub-assets",
        setup(b) {
          b.onResolve({ filter: /\.(jpe?g|png|webp|svg|gif|avif)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
          b.onResolve({ filter: /^@\// }, (a) => ({ path: join(ROOT, "src", a.path.slice(2)) }));
          b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "export default '';", loader: "js" }));
        },
      }],
    });
    const mod = await import(pathToFileURL(outfile).href);
    // A summary carrying a € amount is dropped, not kept: three article
    // seoDescriptions quote tier-1 prices, and a price in the chatbot feed is a
    // baked-in price layer however small. The prompt tells the bot to LINK
    // articles rather than paraphrase them, so title + url is sufficient.
    const map = (arr, basePath) => (arr ?? []).map((a) => {
      const summary = a.seoDescription ?? a.excerpt ?? "";
      return {
        title: a.title,
        url: `${basePath}/${a.slug}`,
        summary: summary.includes("\u20ac") ? "" : summary,
      };
    });
    return [...map(mod.guides, "/accessible-athens"), ...map(mod.blogPosts, "/blog")];
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

async function main() {
  const promptTemplate = await readFile(join(ROOT, "chatbot-system-prompt.md"), "utf-8");

  const required = ["{{HOW_IT_WORKS}}", "{{FAQ}}", "{{BUSINESS_INFO}}",
                    "{{ARTICLE_INDEX}}", "{{EQUIPMENT}}", "{{DELIVERY_ZONES}}"];
  const missing = required.filter((p) => !promptTemplate.includes(p));
  if (missing.length) throw new Error(`chatbot-system-prompt.md is missing placeholders: ${missing.join(", ")}`);

  const { kept: faq, dropped } = await buildFaq();
  const howItWorks = await buildHowItWorks();
  const articleIndex = await buildArticleIndex();

  const payload = { faq, howItWorks, articleIndex, athensPickupStores: ATHENS_PICKUP_STORES };

  // Hard guarantee: no price may reach the system prompt from this file.
  const serialized = JSON.stringify(payload, null, 2);
  if (serialized.includes("€")) throw new Error("A € amount survived into the generated knowledge — refusing to write");

  const region = [
    "/* ── BEGIN GENERATED KNOWLEDGE ─────────────────────────────────────────────",
    " * Written by scripts/generate-chat-knowledge.mjs. DO NOT EDIT BY HAND —",
    " * the script replaces everything between these two markers.",
    " * Derived from chatbot-system-prompt.md, FAQ.tsx, HowItWorks.tsx, articles.ts.",
    " * Contains NO prices: every euro amount is stripped at generation time, because",
    " * prices must come from the live per-request fetch only (docs §2 lesson 1).",
    " * ---------------------------------------------------------------------- */",
    "",
    `const PROMPT_TEMPLATE = ${JSON.stringify(promptTemplate)};`,
    "",
    `const KNOWLEDGE = ${serialized} as const;`,
    "",
    END,
  ].join("\n");

  const current = await readFile(OUT, "utf-8");
  const from = current.indexOf(BEGIN);
  const to = current.indexOf(END);
  if (from < 0 || to < 0 || to < from) {
    throw new Error(
      "Could not find the GENERATED KNOWLEDGE markers in index.ts — refusing to write. " +
      "Restore both marker comments before re-running."
    );
  }
  const next = current.slice(0, from) + region + current.slice(to + END.length);
  await writeFile(OUT, next, "utf-8");
  console.log(`chat knowledge: ${faq.length} FAQ pairs kept, ${dropped.length} excluded (price), ` +
              `${howItWorks.length} steps, ${articleIndex.length} articles`);
  for (const d of dropped) console.log(`  excluded (price): ${d.q}`);
}

main().catch((err) => {
  console.error(`chat knowledge: generation FAILED — ${err?.message ?? err}`);
  process.exit(1);
});
