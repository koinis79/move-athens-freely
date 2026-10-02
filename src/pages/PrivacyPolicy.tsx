import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";
import {
  privacyPolicy,
  type PolicyBlock,
  type PolicyTable,
} from "@/data/privacyPolicy";

/**
 * Privacy policy.
 *
 * Content comes from src/data/privacyPolicy.ts, which is GENERATED from
 * privacy-policy-el.md (authoritative) and privacy-policy-en.md. Edit the
 * markdown and re-run scripts/generate-privacy-policy.mjs — do not edit either
 * the data file or this component to change wording.
 *
 * Styled like the article pages: `container` + `mx-auto max-w-prose`, the same
 * measure ArticleDetail uses, so a legal document still reads like the site.
 */

const isTable = (b: PolicyBlock): b is PolicyTable =>
  typeof b === "object" && !Array.isArray(b) && "headers" in b;

/**
 * Renders `**bold**` runs as <strong>, and nothing else.
 *
 * Deliberately not a markdown renderer: the only inline markup the lawyer's text
 * uses is bold lead-ins ("**Health information.**"), and parsing arbitrary
 * markdown into a page is how stray markup gets rendered. Everything else stays
 * a text node, so React escapes it.
 */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

function Block({ block }: { block: PolicyBlock }) {
  if (typeof block === "string") {
    return <p className="my-3 leading-relaxed">{inline(block)}</p>;
  }

  if (Array.isArray(block)) {
    return (
      <ul className="my-3 list-disc space-y-1.5 pl-5">
        {block.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>
    );
  }

  // Tables carry the retention periods and legal bases — the parts most likely
  // to be read closely — so they get real table semantics, not a styled grid.
  // Horizontally scrollable rather than squeezed, which keeps them legible at
  // 320px without the page itself overflowing.
  return (
    <div className="my-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {block.headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="py-2 pr-4 text-left align-top font-heading font-semibold text-foreground"
              >
                {inline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r} className="border-b border-border/60 last:border-0">
              {row.map((cell, c) => (
                <td key={c} className="py-2.5 pr-4 align-top leading-relaxed">
                  {inline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const lang: "en" | "gr" = i18n.language === "gr" ? "gr" : "en";
  const doc = privacyPolicy[lang];

  return (
    <>
      <SEOHead
        title={doc.metaTitle}
        description={doc.metaDescription}
        canonical="/privacy-policy"
      />

      <div className="container py-10 md:py-16">
        <div className="mx-auto max-w-prose">
          <h1 className="text-3xl font-heading font-bold text-foreground md:text-4xl">
            {doc.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {doc.lastUpdatedLabel}: {doc.lastUpdated}
          </p>

          <div className="text-foreground/90">
            {doc.intro.map((block, i) => (
              <Block key={`i-${i}`} block={block} />
            ))}
          </div>

          <div className="mt-6 space-y-8 text-foreground/90">
            {doc.sections.map((section) => (
              <section key={section.id} aria-labelledby={`policy-${section.id}`}>
                <h2
                  id={`policy-${section.id}`}
                  className="text-xl font-heading font-semibold text-foreground"
                >
                  {section.heading}
                </h2>
                {section.body.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </section>
            ))}
          </div>

          <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
            {doc.contactLine}{" "}
            <a
              href="mailto:info@movability.gr"
              className="font-medium text-primary underline underline-offset-2"
            >
              info@movability.gr
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
