import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import gr from "./gr.json";

const STORAGE_KEY = "i18nextLng";

/**
 * Initial language for a FIRST visit only.
 *
 * The browser reports Greek as "el" / "el-GR", but this app's resource key is
 * "gr" — so plain navigator detection matched nothing and every Greek visitor
 * silently landed on the English UI. This maps that case to "gr".
 *
 * Returns undefined when it should not interfere, which leaves the normal
 * detector chain (localStorage -> navigator) in charge:
 *   - a stored choice already exists -> never re-detect, the header toggle and
 *     any earlier decision always win
 *   - the browser is not Greek -> unchanged behaviour
 */
function resolveInitialLanguage(): string | undefined {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode / blocked storage: fall through and let the detector cope.
  }
  if (stored) return undefined;

  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean) as string[];

  if (!candidates.some((l) => l.toLowerCase().startsWith("el"))) return undefined;

  // Persist it so this detection runs exactly once, ever.
  try {
    localStorage.setItem(STORAGE_KEY, "gr");
  } catch {
    // Non-fatal: without storage the choice simply isn't remembered.
  }
  return "gr";
}

const initialLanguage = resolveInitialLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      gr: { translation: gr },
    },
    ...(initialLanguage ? { lng: initialLanguage } : {}),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
  });

// Set once up front so the document is correctly declared on first paint;
// LanguageSync then keeps it in step with the header toggle.
document.documentElement.lang = i18n.language === "gr" ? "el" : "en";

export default i18n;
