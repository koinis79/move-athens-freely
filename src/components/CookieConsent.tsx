import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie_consent";
const EXPIRY_DAYS = 365;

function getConsent(): { accepted: boolean; expires: number } | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expires && parsed.expires > Date.now()) return parsed;
    localStorage.removeItem(CONSENT_KEY);
    return null;
  } catch {
    return null;
  }
}

function setConsent(accepted: boolean) {
  const expires = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted, expires }));
}

const GA_ID = "G-8RD4VHF74X";

/**
 * Injects GA4 — only ever called after the visitor accepts.
 *
 * The dataLayer shim is defined BEFORE the script tag is appended, which is the
 * order Google's own snippet uses and the reason the previous version's
 * `w.gtag?.(...)` calls did nothing: the script is async, so `window.gtag` did
 * not exist yet and the optional chaining silently swallowed both calls.
 */
function enableGA() {
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;

  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag(...args: unknown[]) { w.dataLayer!.push(args); };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    // Returning visitor who already accepted: load GA now. Previously this never
    // ran, because the tag in index.html made it unnecessary.
    if (consent.accepted) enableGA();
  }, []);

  const handleAccept = () => {
    setConsent(true);
    enableGA();
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[60] animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="rounded-xl border border-border bg-background shadow-lg p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <Cookie className="h-5 w-5 shrink-0 text-primary mt-0.5 sm:mt-0" />
              <p className="text-sm text-foreground/80">
                We use cookies to improve your experience and analyze site traffic.{" "}
                <Link
                  to="/privacy-policy"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
            <div className="flex gap-2 sm:shrink-0">
              {/* Equal prominence, deliberately: both buttons use the SAME
                  variant, size and width. A filled Accept next to an outline
                  Decline is the nudge pattern the EDPB and the Greek DPA single
                  out, and it makes consent arguably not freely given. */}
              <Button variant="outline" size="sm" onClick={handleDecline} className="flex-1 sm:w-28">
                Decline
              </Button>
              <Button variant="outline" size="sm" onClick={handleAccept} className="flex-1 sm:w-28">
                Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
