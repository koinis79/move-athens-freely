import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";

const DISMISS_KEY = "article_sticky_cta_dismissed";

export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  });

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      // Show after scrolling past ~400px (past hero/intro)
      setShow(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !show) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.1)] md:hidden">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <p className="text-sm font-medium text-foreground flex-1 truncate">
          Need equipment?
        </p>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-1 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
        >
          Rent Now <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
