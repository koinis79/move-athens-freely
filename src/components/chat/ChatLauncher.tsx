import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { MessageSquareText, MessageCircle, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ChatPanel from "./ChatPanel";

/** Set once the teaser has been seen or the chat opened — never shown again. */
const TEASER_KEY = "chat_teaser_seen";
const TEASER_DELAY_MS = 8000;

const WHATSAPP_URL =
  "https://wa.me/306974633697?text=Hi!%20I%27m%20interested%20in%20renting%20mobility%20equipment%20in%20Athens.";

/** Reads the flag defensively: private mode and blocked storage both throw. */
function teaserAlreadySeen(): boolean {
  try {
    return localStorage.getItem(TEASER_KEY) === "1";
  } catch {
    // No storage means we cannot promise "once per visitor", so suppress the
    // teaser rather than risk showing it on every page view.
    return true;
  }
}

function markTeaserSeen() {
  try {
    localStorage.setItem(TEASER_KEY, "1");
  } catch {
    /* non-fatal */
  }
}

/**
 * Floating chat launcher: a labelled pill, not a bare circle.
 *
 * The round green circle tested badly for discoverability — it read as the
 * WhatsApp button it replaced, so visitors did not know a chat existed. This is
 * brand blue with a visible text label, which is also why the label is real text
 * rather than an icon with a tooltip: a tooltip is invisible on touch.
 *
 * Still exactly ONE fixed element, at the same anchor, keeping the single
 * footprint validated at 320-414px. `bottom-24` on mobile clears the sticky
 * product CTA bar; `md:bottom-6` drops it on desktop where no such bar exists.
 * Nothing is rendered off-screen — the teaser and panel mount and unmount rather
 * than being parked outside the viewport with a transform, which is the mistake
 * that made every page pan sideways at 390px (docs §11, Sep 16).
 */
const ChatLauncher = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [teaserOpen, setTeaserOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Checkout is a payment flow — never interrupt it with a promotional bubble.
  const suppressTeaser = pathname.startsWith("/checkout");

  useEffect(() => {
    if (suppressTeaser || panelOpen || teaserAlreadySeen()) return;
    const id = window.setTimeout(() => {
      setTeaserOpen(true);
      markTeaserSeen();              // shown once, whatever happens next
      trackEvent("chat_teaser_shown");
    }, TEASER_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [suppressTeaser, panelOpen]);

  const openPanel = (source: "launcher" | "teaser") => {
    setTeaserOpen(false);
    markTeaserSeen();
    setPanelOpen(true);
    trackEvent(source === "teaser" ? "chat_teaser_clicked" : "chat_launcher_click");
  };

  const dismissTeaser = () => {
    setTeaserOpen(false);
    markTeaserSeen();
    trackEvent("chat_teaser_dismissed");
  };

  const closePanel = () => {
    setPanelOpen(false);
    // Focus returns to the launcher so a keyboard user is not dumped at the top
    // of the document.
    launcherRef.current?.focus();
  };

  if (panelOpen) return <ChatPanel onClose={closePanel} />;

  return (
    <>
      {teaserOpen && (
        /* Deliberately NOT role="alert"/aria-live: an unprompted promotional
           bubble must not interrupt a screen reader or steal focus. It sits in
           DOM order before the launcher so it is still reachable by keyboard.
           No transition class, so prefers-reduced-motion has nothing to honour —
           the bubble simply appears.
           Offsets are derived, not guessed. The launcher ROW is as tall as its
           tallest child, which is the 44px WhatsApp button (the pill is 40px on
           mobile) — so on mobile the row occupies 96-140px from bottom-24 and
           the teaser must clear 148px, hence 9.5rem (152px). On md the row is
           44px at bottom-6, occupying 24-68px, so 5.25rem (84px) clears it. */
        <div className="fixed bottom-[9.5rem] right-3 z-50 w-[15rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-background p-3 shadow-xl md:bottom-[5.25rem] md:right-6">
          <button
            type="button"
            onClick={dismissTeaser}
            aria-label={t("chat.teaserDismiss")}
            className="absolute right-1.5 top-1.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openPanel("teaser")}
            className="block w-full pr-5 text-left text-sm leading-snug text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("chat.teaser")}
          </button>
        </div>
      )}

      {/* ONE fixed container, two controls. Keeping both inside a single fixed
          element preserves the single footprint and z-index already validated at
          320-414px, instead of adding a second independently-positioned box. */}
      <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 md:bottom-6">
        <button
          ref={launcherRef}
          type="button"
          onClick={() => openPanel("launcher")}
          aria-label={t("chat.launcherAria")}
          className="flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-md:px-3.5 max-md:py-2.5"
          style={{ backgroundColor: "#2563EB" }}
        >
          <MessageSquareText className="h-5 w-5 shrink-0" aria-hidden="true" />
          {/* Two labels rather than JS width detection: the short one shows at
              <=480px via Tailwind's max-[480px] variant, so there is no layout
              shift on resize and no hydration mismatch. */}
          <span className="whitespace-nowrap text-sm font-semibold max-[480px]:hidden">
            {t("chat.launcherLabel")}
          </span>
          <span className="hidden whitespace-nowrap text-sm font-semibold max-[480px]:inline">
            {t("chat.launcherLabelShort")}
          </span>
        </button>

        {/* One-tap WhatsApp, restored without a menu.
            44x44 minimum target (WCAG 2.5.5). Fill #075E54 measures 7.67:1
            against the white glyph, and 7.37:1 against the light page
            background — but only 2.32:1 against the dark-mode background, which
            FAILS the 3:1 non-text minimum (WCAG 1.4.11). The dark-mode-only
            white ring restores separation at 17.81:1. */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("chat.waLauncherAria")}
          data-analytics="wa-launcher"
          onClick={() => trackEvent("wa_launcher_click")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:ring-2 dark:ring-white"
          style={{ backgroundColor: "#075E54" }}
        >
          <MessageCircle className="h-5 w-5" fill="white" aria-hidden="true" />
        </a>
      </div>
    </>
  );
};

export default ChatLauncher;
