import SEOHead from "@/components/SEOHead";
import ArticleListing from "@/components/articles/ArticleListing";
import { guides } from "@/data/articles";

const AccessibleAthens = () => (
  <>
    <SEOHead
      title="Accessible Athens Guide \u2013 Wheelchair Travel Tips | Movability"
      description="Practical guides for wheelchair users visiting Athens. Acropolis access, accessible restaurants, metro info &amp; more."
    />
    <ArticleListing
    heading="Accessible Athens Guide"
    subheading="Practical, honest guides to help you explore Athens with confidence"
    articles={guides}
    basePath="/accessible-athens"
    linkLabel="Read Guide →"
  />
  </>
);

export default AccessibleAthens;
