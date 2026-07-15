import ArticleCard from "@/components/articles/ArticleCard";
import type { Article } from "@/data/articles";

interface ArticleListingProps {
  heading: string;
  subheading: string;
  articles: Article[];
  basePath: string;
  linkLabel?: string;
}

const ArticleListing = ({
  heading,
  subheading,
  articles,
  basePath,
  linkLabel = "Read More",
}: ArticleListingProps) => (
  <>
    {/* Hero */}
    <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-20">
      <div className="container text-center">
        <h1 className="text-4xl font-heading font-extrabold tracking-tight text-foreground md:text-5xl">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {subheading}
        </p>
      </div>
    </section>

    {/* Grid */}
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
        {articles.map((a) => (
          <ArticleCard
            key={a.slug}
            article={a}
            to={`${basePath}/${a.slug}`}
            linkLabel={linkLabel}
          />
        ))}
      </div>
    </section>
  </>
);

export default ArticleListing;
