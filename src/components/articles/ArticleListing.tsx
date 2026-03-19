import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
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
          <Link key={a.slug} to={`${basePath}/${a.slug}`} className="group">
            <Card className="h-full overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <div className="aspect-[16/9] bg-muted">
                <img
                  src={a.image}
                  alt={a.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <p className="text-xs font-medium text-muted-foreground">
                  {new Date(a.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {a.author && ` · ${a.author}`}
                </p>
                <h2 className="mt-2 text-lg font-heading font-semibold text-foreground group-hover:text-primary">
                  {a.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {a.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {linkLabel} <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  </>
);

export default ArticleListing;
