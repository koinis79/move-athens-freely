-- chat_conversations — transcript log for the site chatbot (claude-chat edge function).
--
-- One row per CONVERSATION, not per message: the owner's use case is "read what
-- people ask", which reads far better as one row with a collapsible transcript
-- (mirroring the AdminInquiries pattern) than as N rows to reassemble.
-- The edge function upserts on session_id as the conversation grows.
--
-- RLS: admin-read-only. Deliberately NO anon INSERT policy, unlike
-- contact_inquiries. The edge function writes with the service role, which bypasses
-- RLS entirely, so an anon INSERT policy would grant nothing the function needs
-- while letting anyone holding the publishable key forge conversation rows.
-- Same read behaviour as contact_inquiries, smaller attack surface.
--
-- ip_hash is a SALTED HASH, never a raw IP. A raw IP is personal data under GDPR
-- and this is an EU business; the hash supports per-IP rate limiting without
-- storing an identifier. The salt lives in Edge Secrets (CHAT_IP_SALT), so the
-- column is useless on its own.
--
-- Applied live via the SQL Editor on 2026-10-01; this file is the
-- source-controlled copy.

CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client-generated conversation id; the upsert key.
  session_id        uuid NOT NULL,

  -- Salted SHA-256 of the client IP (see note above). Nullable: the header can
  -- be absent, and a missing hash must not block logging the conversation.
  ip_hash           text,
  user_agent        text,

  -- UI language the visitor was using: 'en' | 'gr' (the app's i18next resource
  -- keys — note 'gr', not the 'el' used for the <html lang> attribute).
  language          text NOT NULL DEFAULT 'en',

  -- Full transcript: [{ "role": "user"|"assistant", "content": "...", "at": "<iso>" }]
  messages          jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Server-side turn counter, enforced against the 20-turn cap in the function.
  turn_count        integer NOT NULL DEFAULT 0,

  -- Observability: which model answered and what it cost. cache_read_tokens is
  -- the one to watch — if it stays 0 the system-prompt cache is silently broken
  -- (Sonnet 5 needs a >=1024-token prefix to cache at all).
  model             text,
  input_tokens      integer,
  output_tokens     integer,
  cache_read_tokens integer,

  -- Where the bot routed them, if it did. The bot never books; it hands off.
  handoff_type      text CHECK (handoff_type IN ('whatsapp', 'product', 'contact', 'phone')),
  handoff_target    text,

  -- Admin triage, same shape as contact_inquiries.
  is_read           boolean NOT NULL DEFAULT false,
  admin_notes       text,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Upsert key.
CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_session_id_key
  ON public.chat_conversations (session_id);

-- Admin listing: newest first.
CREATE INDEX IF NOT EXISTS chat_conversations_created_at_idx
  ON public.chat_conversations (created_at DESC);

-- Rate limiting: "how many conversations from this hash since <time>".
CREATE INDEX IF NOT EXISTS chat_conversations_ip_hash_created_at_idx
  ON public.chat_conversations (ip_hash, created_at DESC);

-- Unread badge in the admin sidebar.
CREATE INDEX IF NOT EXISTS chat_conversations_unread_idx
  ON public.chat_conversations (created_at DESC)
  WHERE is_read = false;

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Reuses the existing is_admin() helper, same as contact_inquiries.
DROP POLICY IF EXISTS "Admins can read and manage chat conversations" ON public.chat_conversations;
CREATE POLICY "Admins can read and manage chat conversations"
  ON public.chat_conversations
  FOR ALL
  USING (public.is_admin());

-- Reuses the existing set_updated_at() trigger function.
DROP TRIGGER IF EXISTS chat_conversations_set_updated_at ON public.chat_conversations;
CREATE TRIGGER chat_conversations_set_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.chat_conversations IS
  'Site chatbot transcripts, one row per conversation, upserted on session_id by the claude-chat edge function. Admin-read-only RLS; writes come from the service role.';
COMMENT ON COLUMN public.chat_conversations.ip_hash IS
  'Salted SHA-256 of the client IP (salt in Edge Secrets as CHAT_IP_SALT). Never store a raw IP — personal data under GDPR.';
COMMENT ON COLUMN public.chat_conversations.cache_read_tokens IS
  'usage.cache_read_input_tokens. Zero across turns means the system-prompt cache is not working (Sonnet 5 minimum cacheable prefix is 1024 tokens).';
COMMENT ON COLUMN public.chat_conversations.language IS
  'i18next resource key the visitor was using: en | gr.';
