/**
 * claude-chat — site chatbot backend (Claude Sonnet 5).
 *
 * The bot ROUTES; it never transacts. It has no tools and is given no
 * availability data, so "never confirms a booking" and "never promises
 * availability" are capability facts, not instructions a jailbreak can argue
 * with. Prompt rules are the second layer, not the only one.
 *
 * Prices are fetched LIVE per request and never hardcoded here. A bot with baked
 * -in prices would be a fourth price layer (docs §2 lesson 1).
 *
 * Edge Secrets required:
 *   ANTHROPIC_API_KEY  - Anthropic API key. NOT SUPABASE_-prefixed (lesson 11).
 *   CHAT_IP_SALT       - random string; salts the IP hash so the stored hash is
 *                        useless on its own. Raw IPs are personal data (GDPR).
 *
 * "Enforce JWT verification" should stay ON for this function. Unlike
 * send-review-request (server-to-server, INTERNAL_API_KEY, needs it OFF — lesson
 * 8), this is browser-called with the publishable key, which IS a valid JWT.
 *
 * Deploy manually and verify the deployed code contains your change (lesson 12).
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.69.0";
import { PROMPT_TEMPLATE, KNOWLEDGE } from "./knowledge.generated.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const CHAT_IP_SALT = Deno.env.get("CHAT_IP_SALT") ?? "";

const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 1024;           // replies are 2-5 sentences by design
const MAX_USER_TURNS = 20;         // enforced server-side; never trust the client
const RATE_LIMIT_WINDOW_MIN = 60;
const RATE_LIMIT_MAX_CONVERSATIONS = 8;
const WHATSAPP_NUMBER = "306974633697";
const SITE = "https://www.movability.gr";

// CORS first, and on every error response (lesson 10) — otherwise a 4xx shows up
// in the browser as an opaque "network error".
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Salted SHA-256. Never store or log the raw IP. */
async function hashIp(ip: string): Promise<string | null> {
  if (!ip) return null;
  const data = new TextEncoder().encode(`${CHAT_IP_SALT}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ── System prompt assembly ─────────────────────────────────────────────────
 * Two cache breakpoints:
 *   block 1  stable knowledge — identical for every visitor, so it caches
 *            globally, not per conversation.
 *   block 2  live equipment + delivery zones — changes only when the DB changes,
 *            which is exactly when the cache SHOULD be invalidated.
 * Both are serialized deterministically (sorted rows, fixed key order). Unsorted
 * JSON would silently invalidate the cache on every single request.
 * Sonnet 5 needs a >=1024-token prefix to cache at all, and a miss is silent —
 * watch cache_read_input_tokens, logged on every conversation row.
 * ------------------------------------------------------------------------- */

interface EquipmentRow {
  slug: string; name_en: string; name_el: string | null;
  price_tier1: number; price_tier2: number; price_tier3: number; price_tier4: number;
  deposit_amount: number | null;
  equipment_categories: { slug: string } | null;
}
interface ZoneRow { name_en: string; slug: string; delivery_fee: number; }

function renderFaq(): string {
  return KNOWLEDGE.faq.map((x) => `Q: ${x.q}\nA: ${x.a}`).join("\n\n");
}

function renderHowItWorks(): string {
  return KNOWLEDGE.howItWorks.map((s, i) => `${i + 1}. ${s.title} — ${s.desc}`).join("\n");
}

function renderArticleIndex(): string {
  return KNOWLEDGE.articleIndex
    .map((a) => `- ${a.title} — ${SITE}${a.url}\n  ${a.summary}`)
    .join("\n");
}

function renderBusinessInfo(business: Record<string, unknown>, stores: Array<Record<string, string>>): string {
  const hours = (business.hours ?? {}) as Record<string, string>;
  const pickup = stores.filter((s) => KNOWLEDGE.athensPickupStores.includes(s.name));
  return [
    `Name: ${business.name ?? "Movability"}`,
    `Phone: ${business.phone ?? ""}`,
    `WhatsApp: ${business.whatsapp ?? ""}`,
    `Email: ${business.email ?? ""}`,
    "Opening hours (store/phone; WhatsApp outside these hours is answered the next morning):",
    `- Monday & Wednesday: ${hours.mon_wed ?? "-"}`,
    `- Tuesday, Thursday, Friday: ${hours.tue_thu_fri ?? "-"}`,
    `- Saturday: ${hours.sat ?? "-"}`,
    `- Sunday: closed. NOTE: Sunday DELIVERY is still available as a paid service — being closed does not mean no delivery.`,
    "Free store pickup (Athens):",
    ...pickup.map((s) => `- ${s.name} — ${s.address} — ${s.phone}`),
  ].join("\n");
}

function renderEquipment(rows: EquipmentRow[]): string {
  return rows
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((r) => {
      const cat = r.equipment_categories?.slug;
      const url = cat ? `${SITE}/equipment/${cat}/${r.slug}` : "";
      const dep = Number(r.deposit_amount ?? 0);
      return [
        `- ${r.name_en}${r.name_el ? ` (Greek: ${r.name_el})` : ""}`,
        `  price per rental period: 1-3 days EUR ${r.price_tier1}; 4-7 days EUR ${r.price_tier2}; 8-14 days EUR ${r.price_tier3}; 15+ days EUR ${r.price_tier4}`,
        `  refundable deposit: ${dep > 0 ? `EUR ${dep}, collected in person at delivery` : "none"}`,
        `  book here: ${url}`,
      ].join("\n");
    })
    .join("\n");
}

function renderZones(rows: ZoneRow[]): string {
  // Only active zones reach here, but the table also holds inactive legacy rows
  // with DUPLICATE display names ("Piraeus Cruise Terminal" and "Athens Airport"
  // each appear twice). Dedupe by name so the bot never offers two of the same.
  const seen = new Set<string>();
  return rows
    .slice()
    .sort((a, b) => Number(a.delivery_fee) - Number(b.delivery_fee))
    .filter((r) => (seen.has(r.name_en) ? false : (seen.add(r.name_en), true)))
    .map((r) => `- ${r.name_en}: delivery fee EUR ${Number(r.delivery_fee)}`)
    .join("\n");
}

/** The template references "the handoff format provided by the system" but does
 *  not define it, so the format is supplied here. */
function handoffBlock(): string {
  return [
    "## Handoff format (use exactly these)",
    `WhatsApp: ${`https://wa.me/${WHATSAPP_NUMBER}?text=`}<url-encoded message>`,
    "Build the message from what you actually know — equipment name, dates, delivery",
    "area, first name — and nothing you are unsure of. Example shape before encoding:",
    '  "Hi! I\'d like to rent the Lightweight Folding Wheelchair, 12-16 May, delivery to a hotel in Athens City. Name: Maria"',
    "Product pages: use the exact `book here:` URL from the equipment data. Never",
    "construct an equipment URL yourself — a hand-built one-segment path redirects",
    "to the listing page and loses the customer.",
    `Contact page: ${SITE}/contact   How It Works: ${SITE}/how-it-works`,
    "Do NOT link to /checkout — it redirects to the equipment list unless a cart",
    "already exists in that browser. Always link the product page instead.",
  ].join("\n");
}

function buildSystemBlocks(
  business: Record<string, unknown>,
  stores: Array<Record<string, string>>,
  equipment: EquipmentRow[],
  zones: ZoneRow[],
) {
  const stable = PROMPT_TEMPLATE
    .replace("{{HOW_IT_WORKS}}", renderHowItWorks())
    .replace("{{FAQ}}", renderFaq())
    .replace("{{BUSINESS_INFO}}", renderBusinessInfo(business, stores))
    .replace("{{ARTICLE_INDEX}}", renderArticleIndex())
    // Live blocks are rendered into the second cache block, not this one.
    .replace("{{EQUIPMENT}}", "(see the live equipment data below)")
    .replace("{{DELIVERY_ZONES}}", "(see the live delivery zone data below)");

  const live = [
    "## Equipment we rent right now (live, authoritative)",
    renderEquipment(equipment),
    "",
    "## Delivery zones right now (live, authoritative)",
    renderZones(zones),
    "",
    "Store pickup is free. Never say 'free delivery'.",
  ].join("\n");

  return [
    { type: "text" as const, text: `${stable}\n\n${handoffBlock()}`, cache_control: { type: "ephemeral" as const } },
    { type: "text" as const, text: live, cache_control: { type: "ephemeral" as const } },
  ];
}

/* ── Handler ─────────────────────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let sessionId: string;
  let clientMessages: Array<{ role: "user" | "assistant"; content: string }>;
  let language: string;
  try {
    const body = await req.json();
    sessionId = String(body.session_id ?? "");
    language = body.language === "gr" ? "gr" : "en";
    clientMessages = Array.isArray(body.messages) ? body.messages : [];
    if (!/^[0-9a-f-]{36}$/i.test(sessionId)) throw new Error("bad session_id");
    if (!clientMessages.length) throw new Error("no messages");
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  // Turn cap, enforced here rather than trusting the client's array length.
  const userTurns = clientMessages.filter((m) => m.role === "user").length;
  if (userTurns > MAX_USER_TURNS) {
    return json({ error: "conversation_limit", max_turns: MAX_USER_TURNS }, 429);
  }

  // Normalise and bound the history we actually send.
  const messages = clientMessages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!messages.length || messages[0].role !== "user") {
    return json({ error: "Invalid request body" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ipHash = await hashIp(ip);

  // Per-IP rate limit. Counts distinct conversations started in the window, so a
  // long legitimate chat is not punished — only conversation spamming is.
  if (ipHash) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60_000).toISOString();
    const { count } = await supabase
      .from("chat_conversations")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .neq("session_id", sessionId)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_MAX_CONVERSATIONS) {
      return json({ error: "rate_limited", retry_after_minutes: RATE_LIMIT_WINDOW_MIN }, 429);
    }
  }

  // Live catalogue. Deliberately NOT selecting equipment_availability — the bot
  // cannot promise availability because it is never told any.
  const [{ data: equipRows }, { data: zoneRows }, { data: settings }] = await Promise.all([
    supabase.from("equipment")
      .select("slug, name_en, name_el, price_tier1, price_tier2, price_tier3, price_tier4, deposit_amount, equipment_categories(slug)")
      .eq("is_active", true),
    supabase.from("delivery_zones")
      .select("name_en, slug, delivery_fee")
      .eq("is_active", true),
    supabase.from("site_settings").select("key, value").in("key", ["business_info", "stores"]),
  ]);

  const business = (settings?.find((s) => s.key === "business_info")?.value ?? {}) as Record<string, unknown>;
  const stores = (settings?.find((s) => s.key === "stores")?.value ?? []) as Array<Record<string, string>>;

  const system = buildSystemBlocks(
    business,
    stores,
    (equipRows ?? []) as unknown as EquipmentRow[],
    (zoneRows ?? []) as unknown as ZoneRow[],
  );

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  let assistantText = "";
  let usage: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number } = {};

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (event: string, data: unknown) =>
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

      try {
        const result = anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system,
          messages,
          // Latency over depth for a chat widget. If answer quality disappoints,
          // switch to thinking: { type: "adaptive" } and raise effort.
          thinking: { type: "disabled" },
          output_config: { effort: "low" },
        });

        for await (const event of result) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            assistantText += event.delta.text;
            send("delta", { text: event.delta.text });
          }
        }

        const final = await result.finalMessage();
        usage = final.usage ?? {};

        // A refusal arrives as HTTP 200 with stop_reason "refusal" — check it
        // rather than assuming content is present.
        if (final.stop_reason === "refusal") {
          send("error", { error: "refusal" });
        }
        send("done", { usage });
      } catch (err) {
        console.error("claude-chat stream error:", err instanceof Error ? err.message : err);
        send("error", { error: "upstream_error" });
      } finally {
        controller.close();
      }

      // Log after the reply is delivered, so a logging failure can never cost the
      // customer their answer.
      try {
        const transcript = [...messages, { role: "assistant", content: assistantText }]
          .map((m) => ({ ...m, at: new Date().toISOString() }));
        await supabase.from("chat_conversations").upsert({
          session_id: sessionId,
          ip_hash: ipHash,
          user_agent: (req.headers.get("user-agent") ?? "").slice(0, 500),
          language,
          messages: transcript,
          turn_count: userTurns,
          model: MODEL,
          input_tokens: usage.input_tokens ?? null,
          output_tokens: usage.output_tokens ?? null,
          cache_read_tokens: usage.cache_read_input_tokens ?? null,
        }, { onConflict: "session_id" });
      } catch (err) {
        console.error("claude-chat logging error:", err instanceof Error ? err.message : err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});
