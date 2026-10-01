import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Send, MessageCircle, RotateCcw } from "lucide-react";
import { useChatStream } from "./useChatStream";
import { autolink } from "./autolink";

const WHATSAPP_URL =
  "https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens.";

interface Props {
  onClose: () => void;
}

/**
 * The conversation panel.
 *
 * Layout note (docs §2 lesson 15 territory): width is capped with
 * `max-w-[calc(100vw-1.5rem)]` and the panel is anchored by `right-3`, so it can
 * never widen the document the way the old off-canvas header drawer did — that
 * bug made every page pan sideways at 390px. Nothing here is rendered
 * off-screen; when the panel is closed it is unmounted, not translated away.
 */
const ChatPanel = ({ onClose }: Props) => {
  const { t } = useTranslation();
  const { messages, status, send, reset, atLimit } = useChatStream();
  const [draft, setDraft] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Focus the input on open so a keyboard user lands somewhere useful.
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Escape closes from anywhere inside the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep the newest message in view as it streams.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft;
    setDraft("");
    void send(text);
  };

  const streaming = status === "streaming";
  const showNotice = messages.length === 0;

  return (
    <div
      role="dialog"
      aria-label={t("chat.panelTitle")}
      className="fixed bottom-3 right-3 z-50 flex w-[22rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:bottom-6 md:right-6"
      style={{ maxHeight: "min(32rem, calc(100vh - 1.5rem))" }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <h2 className="truncate text-sm font-heading font-semibold text-foreground">
          {t("chat.panelTitle")}
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              aria-label={t("chat.newChat")}
              title={t("chat.newChat")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t("chat.close")}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transcript. aria-live so a screen reader hears the reply arrive, but
          "polite" so it never interrupts the user mid-typing. */}
      <div
        ref={logRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("chat.empty")}</p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground"
            }
          >
            {m.role === "assistant" ? (
              <span className="whitespace-pre-wrap break-words">
                {m.content ? autolink(m.content) : (
                  <span className="text-muted-foreground">{t("chat.thinking")}</span>
                )}
              </span>
            ) : (
              <span className="whitespace-pre-wrap break-words">{m.content}</span>
            )}
          </div>
        ))}

        {status === "error" && (
          <p role="alert" className="text-sm text-destructive">{t("chat.errorMessage")}</p>
        )}
        {status === "limit" && (
          <p role="alert" className="text-sm text-destructive">{t("chat.limitMessage")}</p>
        )}
      </div>

      {/* Persistent WhatsApp escape hatch — always reachable, not only after a
          handoff suggestion. */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics="chat-panel-whatsapp"
        className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <MessageCircle className="h-4 w-4 shrink-0" style={{ color: "#25D366" }} />
        <span className="truncate">{t("chat.whatsappInPanel")}</span>
      </a>

      {/* Composer */}
      <form onSubmit={submit} className="shrink-0 border-t border-border px-3 pb-3 pt-2">
        {showNotice && (
          <p id="chat-privacy-notice" className="mb-2 text-[11px] leading-snug text-muted-foreground">
            {t("chat.notice")}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            {t("chat.placeholder")}
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("chat.placeholder")}
            disabled={atLimit}
            maxLength={1000}
            autoComplete="off"
            aria-describedby={showNotice ? "chat-privacy-notice" : undefined}
            className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || atLimit || !draft.trim()}
            aria-label={t("chat.send")}
            className="shrink-0 rounded-xl bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
