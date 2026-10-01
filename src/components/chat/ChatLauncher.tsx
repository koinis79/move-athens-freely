import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, Sparkles, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

const WHATSAPP_URL =
  "https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens.";

/**
 * Single floating launcher that expands to two choices, WhatsApp first.
 *
 * Why one launcher and not two stacked buttons: the 678px mobile-overflow bug
 * (docs §11, Sep 16) was caused by a fixed off-canvas element widening the
 * document. One launcher keeps the single fixed footprint and z-index that were
 * already validated at 320-414px, and leaves room above the sticky product CTA
 * bar that pushes this control to bottom-24 on mobile.
 *
 * The cost, accepted deliberately: WhatsApp is two taps instead of one. It is
 * therefore listed FIRST and visually primary, and both paths carry
 * data-analytics attributes so the trade can actually be measured rather than
 * argued about.
 *
 * Nothing is rendered off-screen. The menu and the panel mount and unmount;
 * neither is parked outside the viewport with a transform.
 */
const ChatLauncher = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Escape closes the menu; click outside dismisses it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); launcherRef.current?.focus(); }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !launcherRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  const openPanel = () => { setMenuOpen(false); setPanelOpen(true); };

  const closePanel = () => {
    setPanelOpen(false);
    // Return focus to where it came from, so keyboard users are not dumped at
    // the top of the document.
    launcherRef.current?.focus();
  };

  if (panelOpen) return <ChatPanel onClose={closePanel} />;

  return (
    <>
      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t("chat.launcherAria")}
          className="fixed bottom-[6.5rem] right-3 z-50 w-[17rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:bottom-24 md:right-6"
        >
          {/* WhatsApp first and visually primary — it is the proven channel. */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            data-analytics="chat-launcher-whatsapp"
            onClick={() => setMenuOpen(false)}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="h-4 w-4 text-white" fill="white" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                {t("chat.optionWhatsapp")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t("chat.optionWhatsappHint")}
              </span>
            </span>
          </a>

          <button
            type="button"
            role="menuitem"
            onClick={openPanel}
            data-analytics="chat-launcher-bot"
            className="flex w-full items-start gap-3 border-t border-border px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                {t("chat.optionBot")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t("chat.optionBotHint")}
              </span>
            </span>
          </button>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={t("chat.launcherAria")}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="fixed bottom-24 right-6 z-50 flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:bottom-6 max-md:h-[50px] max-md:w-[50px]"
        style={{ backgroundColor: "#25D366" }}
      >
        {menuOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-7 w-7 max-md:h-6 max-md:w-6 text-white" fill="white" />
        )}
      </button>
    </>
  );
};

export default ChatLauncher;
