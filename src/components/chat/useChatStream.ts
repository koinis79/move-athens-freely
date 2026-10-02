import { useCallback, useRef, useState } from "react";
import i18n from "@/i18n";

/**
 * SSE consumer for the claude-chat edge function.
 *
 * The function emits three event types:
 *   event: delta  { text }    - append to the in-flight assistant message
 *   event: done   { usage }   - turn finished
 *   event: error  { error }   - upstream failure or a model refusal
 */

const FUNCTION_URL = "https://lmgpuqgwkiapgpdsxvmb.supabase.co/functions/v1/claude-chat";
// Same publishable key the app already ships in integrations/supabase/client.ts.
// JWT verification is ON for this function and this key IS a valid JWT.
const PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ3B1cWd3a2lhcGdwZHN4dm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjc1NzksImV4cCI6MjA4Nzk0MzU3OX0.WTs1-rimMSZtPoedl7qgxiWXGOJm8-yMaUEKfU7XuCI";

/** Server caps user turns at 20; stop offering the input at the same number. */
export const MAX_USER_TURNS = 20;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Status = "idle" | "streaming" | "error" | "limit";

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const sessionId = useRef<string>(crypto.randomUUID());
  const abort = useRef<AbortController | null>(null);

  const userTurns = messages.filter((m) => m.role === "user").length;

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === "streaming") return;
      if (userTurns >= MAX_USER_TURNS) { setStatus("limit"); return; }

      // Snapshot the history we post, so a mid-flight state update cannot
      // change what the server is answering.
      const history: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setStatus("streaming");

      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;

      const appendToLast = (chunk: string) =>
        setMessages((prev) => {
          const next = [...prev];
          const i = next.length - 1;
          if (i >= 0 && next[i].role === "assistant") {
            next[i] = { ...next[i], content: next[i].content + chunk };
          }
          return next;
        });

      try {
        const res = await fetch(FUNCTION_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            apikey: PUBLISHABLE_KEY,
            Authorization: `Bearer ${PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            session_id: sessionId.current,
            language: i18n.language === "gr" ? "gr" : "en",
            messages: history,
          }),
        });

        if (res.status === 429) {
          const body = await res.json().catch(() => ({}));
          setStatus(body?.error === "conversation_limit" ? "limit" : "error");
          return;
        }
        if (!res.ok || !res.body) { setStatus("error"); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let sawError = false;

        // SSE frames are separated by a blank line; a chunk can split one, so
        // only complete frames are consumed and the remainder stays buffered.
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let split: number;
          while ((split = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, split);
            buffer = buffer.slice(split + 2);

            let event = "message";
            const dataLines: string[] = [];
            for (const line of frame.split("\n")) {
              if (line.startsWith("event:")) event = line.slice(6).trim();
              else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
            }
            if (!dataLines.length) continue;

            let payload: { text?: string; error?: string };
            try { payload = JSON.parse(dataLines.join("\n")); } catch { continue; }

            if (event === "delta" && payload.text) appendToLast(payload.text);
            else if (event === "error") sawError = true;
          }
        }

        setStatus(sawError ? "error" : "idle");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setStatus("error");
      }
    },
    [messages, status, userTurns],
  );

  const reset = useCallback(() => {
    abort.current?.abort();
    sessionId.current = crypto.randomUUID();
    setMessages([]);
    setStatus("idle");
  }, []);

  return { messages, status, send, reset, userTurns, atLimit: userTurns >= MAX_USER_TURNS };
}
