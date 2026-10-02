import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";
import { privacyPolicy, type PolicySection } from "@/data/privacyPolicy";

/**
 * Privacy policy.
 *
 * Structure only — the legal text lives in src/data/privacyPolicy.ts so the final
 * wording can be dropped in without touching this component. Sections marked
 * `placeholder: true` render a visible PENDING badge, so an unfinished policy can
 * never be mistaken for a finished one by whoever looks at the page next.
 *
 * Styled to match the article pages: `container` + `mx-auto max-w-prose`, the same
 * measure used by ArticleDetail, so it reads like the rest of the site rather than
 * like a legal annex.
 */
const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const lang: "en" | "gr" = i18n.language === "gr" ? "gr" : "en";
  const doc = privacyPolicy[lang];

  const renderBody = (section: PolicySection) =>
    section.body.map((para, i) =>
      Array.isArray(para) ? (
        <ul key={i} className="my-3 list-disc space-y-1.5 pl-5">
          {para.map((li, j) => (
            <li key={j}>{li}</li>
          ))}
        </ul>
      ) : (
        <p key={i} className="my-3">
          {para}
        </p>
      ),
    );

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

          {doc.intro.map((para, i) => (
            <p key={i} className="mt-4 text-foreground/90">
              {para}
            </p>
          ))}

          <div className="mt-8 space-y-8 text-foreground/90">
            {doc.sections.map((section) => (
              <section key={section.heading} aria-labelledby={`s-${section.id}`}>
                <h2
                  id={`s-${section.id}`}
                  className="flex flex-wrap items-center gap-2 text-xl font-heading font-semibold text-foreground"
                >
                  {section.heading}
                  {section.placeholder && (
                    <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                      {doc.pendingLabel}
                    </span>
                  )}
                </h2>
                {renderBody(section)}
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
