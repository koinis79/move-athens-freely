import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * i18next resource key -> BCP 47 tag for the `lang` attribute.
 *
 * The resource keys here are "en" and "gr", but "gr" is not a language code —
 * it is the ISO country code for Greece. The correct language subtag for Greek
 * is "el", and that is what assistive technology reads, so the two must not be
 * conflated.
 */
const HTML_LANG: Record<string, string> = {
  en: "en",
  gr: "el",
};

export function htmlLangFor(i18nLanguage: string | undefined): string {
  return HTML_LANG[i18nLanguage ?? ""] ?? "en";
}

/**
 * Keeps `<html lang>` in step with the active UI language.
 *
 * `index.html` ships a hardcoded `lang="en"`, so before this existed a visitor
 * who switched to Greek got Greek text inside a document still declared as
 * English — which makes screen readers pronounce it with English phonetics.
 * That is a real accessibility defect for an accessibility business, not a
 * cosmetic one.
 *
 * Renders nothing; mounted once near the root.
 */
const LanguageSync = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = htmlLangFor(i18n.language);
  }, [i18n.language]);

  return null;
};

export default LanguageSync;
