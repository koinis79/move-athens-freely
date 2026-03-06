import ArticleListing from "@/components/articles/ArticleListing";
import { guides } from "@/data/articles";

const AccessibleAthens = () => (
  <ArticleListing
    heading="Accessible Athens Guide"
    subheading="Practical, honest guides to help you explore Athens with confidence"
    articles={guides}
    basePath="/accessible-athens"
    linkLabel="Read Guide →"
  />
);

export default AccessibleAthens;
