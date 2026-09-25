import { Helmet } from "react-helmet-async";

// The apex domain 307-redirects to www, so www is the host that actually
// serves 200. Every canonical/OG URL must use it — pointing canonicals at
// a redirecting host is worse than emitting none.
const SITE = "https://www.movability.gr";
const DEFAULT_OG_IMAGE = "https://www.movability.gr/og-image.png";
const SITE_NAME = "Movability";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  /**
   * Site-root-relative path of this page's canonical URL (e.g.
   * "/equipment/wheelchairs/manual-wheelchair"). Resolved against the
   * apex domain, so www/non-www and any stray query string collapse onto
   * one indexable URL.
   */
  canonical?: string;
  /** Open Graph type — "article" for guides and blog posts. */
  type?: "website" | "article";
}

const SEOHead = ({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  url,
  canonical,
  type = "website",
}: SEOHeadProps) => {
  const canonicalUrl = canonical
    ? `${SITE}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
    : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      {(url || canonicalUrl) && (
        <meta property="og:url" content={url ?? canonicalUrl} />
      )}
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@movability_gr" />
    </Helmet>
  );
};

export default SEOHead;
