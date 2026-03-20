import { Helmet } from "react-helmet-async";

const DEFAULT_OG_IMAGE = "https://moveability.gr/og-image.png";
const SITE_NAME = "Moveability";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

const SEOHead = ({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  url,
}: SEOHeadProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:site_name" content={SITE_NAME} />
    <meta property="og:type" content="website" />
    {url && <meta property="og:url" content={url} />}
    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    <meta name="twitter:site" content="@moveability_gr" />
  </Helmet>
);

export default SEOHead;
