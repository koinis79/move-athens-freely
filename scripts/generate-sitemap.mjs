/**
 * generate-sitemap.mjs
 *
 * Regenerates public/sitemap.xml from the real sources of truth instead of a
 * hand-maintained list:
 *
 *   - equipment + equipment_categories  → Supabase (only is_active rows)
 *   - guides + blogPosts                → src/data/articles.ts
 *
 * Runs automatically via the `prebuild` npm script, so adding a product in SQL
 * or an article in articles.ts can no longer silently leave the sitemap stale.
 *
 * Products are emitted at their canonical two-segment path
 * (/equipment/:categorySlug/:slug) — the one-segment form does not resolve to a
 * product page.
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 */

import { writeFile, readFile, mkdtemp, rm } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_FILE = join(ROOT, "public", "sitemap.xml");

// The apex domain 307-redirects to www, so www is the host that serves 200.
// Sitemap URLs must be the ones that actually resolve.
const SITE = "https://www.movability.gr";

// Public, anon-key read of public catalogue data — same values the browser
// client ships with, so no extra build-time secret is needed on Vercel.
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://lmgpuqgwkiapgpdsxvmb.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3B1cWd3a2lhcGdwZHN4dm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjc1NzksImV4cCI6MjA4Nzk0MzU3OX0.WTs1-rimMSZtPoedl7qgxiWXGOJm8-yMaUEKfU7XuCI";

/** Static routes that are not driven by data. */
const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/equipment", changefreq: "weekly", priority: "0.9" },
  { path: "/how-it-works", changefreq: "monthly", priority: "0.6" },
  { path: "/accessible-athens", changefreq: "weekly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/partners", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms-of-service", changefreq: "yearly", priority: "0.3" },
];

const today = () => new Date().toISOString().slice(0, 10);

/** yyyy-mm-dd, or today when the value is missing/unparseable. */
function isoDate(value) {
  if (!value) return today();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? today() : d.toISOString().slice(0, 10);
}

function xmlEscape(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos" }[c]};`);
}

async function supabaseSelect(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json();
}

/**
 * Load the article arrays out of the TS source. articles.ts imports image
 * assets, so bundle it with esbuild first and stub those imports out — that
 * gives the real exported data rather than a regex guess at it.
 */
async function loadArticles() {
  const { build } = await import("esbuild");
  const tmp = await mkdtemp(join(tmpdir(), "sitemap-"));
  const outfile = join(tmp, "articles.mjs");
  try {
    await build({
      entryPoints: [join(ROOT, "src", "data", "articles.ts")],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      logLevel: "silent",
      plugins: [
        {
          name: "stub-assets",
          setup(b) {
            // Image imports (@/assets/... and any bare image path)
            b.onResolve({ filter: /\.(jpe?g|png|webp|svg|gif|avif)$/ }, (a) => ({
              path: a.path,
              namespace: "stub",
            }));
            // Any other @/ alias import articles.ts might pick up later
            b.onResolve({ filter: /^@\// }, (a) => ({
              path: join(ROOT, "src", a.path.slice(2)),
            }));
            b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
              contents: "export default '';",
              loader: "js",
            }));
          },
        },
      ],
    });
    const mod = await import(pathToFileURL(outfile).href);
    return { guides: mod.guides ?? [], blogPosts: mod.blogPosts ?? [] };
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

function urlEntry({ path, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(SITE + path)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

async function main() {
  const [categories, equipment, articles] = await Promise.all([
    supabaseSelect("equipment_categories?select=slug,updated_at&is_active=eq.true&order=sort_order"),
    supabaseSelect(
      "equipment?select=slug,updated_at,equipment_categories(slug)&is_active=eq.true&order=slug"
    ),
    loadArticles(),
  ]);

  const entries = [];

  for (const r of STATIC_ROUTES) {
    entries.push({ path: r.path, lastmod: today(), changefreq: r.changefreq, priority: r.priority });
  }

  for (const c of categories) {
    entries.push({
      path: `/equipment/${c.slug}`,
      lastmod: isoDate(c.updated_at),
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  const skipped = [];
  for (const e of equipment) {
    const catSlug = e.equipment_categories?.slug;
    if (!catSlug) {
      // No category means no canonical two-segment URL exists for it.
      skipped.push(e.slug);
      continue;
    }
    entries.push({
      path: `/equipment/${catSlug}/${e.slug}`,
      lastmod: isoDate(e.updated_at),
      changefreq: "weekly",
      priority: "0.9",
    });
  }

  for (const g of articles.guides) {
    entries.push({
      path: `/accessible-athens/${g.slug}`,
      lastmod: isoDate(g.date),
      changefreq: "monthly",
      priority: "0.7",
    });
  }
  for (const b of articles.blogPosts) {
    entries.push({
      path: `/blog/${b.slug}`,
      lastmod: isoDate(b.date),
      changefreq: "monthly",
      priority: "0.6",
    });
  }

  // A sitemap with no products means the query shape broke — that is the exact
  // silent drift this script exists to prevent, so fail rather than publish it.
  const productCount = entries.filter((e) => e.path.split("/").length === 4).length;
  if (productCount === 0) {
    throw new Error("Refusing to write a sitemap with zero product URLs");
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by scripts/generate-sitemap.mjs — do not edit by hand. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(urlEntry),
    "</urlset>",
    "",
  ].join("\n");

  await writeFile(OUT_FILE, xml, "utf-8");

  console.log(
    `sitemap: ${entries.length} URLs ` +
      `(${productCount} products, ${categories.length} categories, ` +
      `${articles.guides.length} guides, ${articles.blogPosts.length} blog posts)`
  );
  if (skipped.length) {
    console.warn(`sitemap: skipped ${skipped.length} product(s) with no category: ${skipped.join(", ")}`);
  }
}

main().catch(async (err) => {
  // A broken build blocks the whole deploy, which is worse than a stale
  // sitemap. Keep whatever is already committed and surface the reason.
  console.error(`sitemap: generation failed — keeping existing public/sitemap.xml`);
  console.error(`sitemap: ${err?.message ?? err}`);
  try {
    await readFile(OUT_FILE, "utf-8");
    process.exit(0);
  } catch {
    // Nothing to fall back to — this one really should fail the build.
    console.error("sitemap: no existing sitemap.xml to fall back to");
    process.exit(1);
  }
});
