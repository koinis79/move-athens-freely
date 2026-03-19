import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Facebook, Twitter, LinkIcon, ArrowRight, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Article } from "@/data/articles";

const categoryColors: Record<string, string> = {
  Attractions: "bg-primary/15 text-primary border-primary/30",
  Dining:      "bg-orange-500/15 text-orange-600 border-orange-500/30",
  Transport:   "bg-blue-500/15 text-blue-600 border-blue-500/30",
  Outdoors:    "bg-green-500/15 text-green-600 border-green-500/30",
  Tips:        "bg-violet-500/15 text-violet-600 border-violet-500/30",
  Athens:      "bg-secondary/15 text-secondary border-secondary/30",
};

function readingTime(body: string[]): number {
  return Math.max(1, Math.ceil(body.join(" ").split(/\s+/).length / 200));
}

interface ArticleDetailProps {
  article: Article;
  related: Article[];
  basePath: string;
  parentLabel: string;
  showShare?: boolean;
  showCta?: boolean;
}

const ArticleDetail = ({
  article,
  related,
  basePath,
  parentLabel,
  showShare = false,
  showCta = false,
}: ArticleDetailProps) => {
  const formattedDate = new Date(article.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard" });
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title);
  const mins = readingTime(article.body);

  return (
    <>
      {/* Breadcrumb */}
      <section className="border-b border-border bg-background py-4">
        <div className="container">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={basePath}>{parentLabel}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{article.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Article */}
      <article className="bg-background py-12 md:py-20">
        <div className="container">
          {/* Header — constrained to max-w-prose */}
          <div className="mx-auto max-w-prose">
            {article.category && (
              <Badge
                variant="outline"
                className={`mb-4 text-xs font-medium ${categoryColors[article.category] ?? "bg-muted text-muted-foreground border-border"}`}
              >
                {article.category}
              </Badge>
            )}
            <h1 className="text-3xl font-heading font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{formattedDate}</span>
              {article.author && (
                <>
                  <span>·</span>
                  <span>{article.author}</span>
                </>
              )}
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {mins} min read
              </span>
            </div>
          </div>

          {/* Featured image — slightly wider than prose for visual breathing room */}
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={article.image}
              alt={article.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          {/* Body — max-w-prose for optimal line length (~65 chars) */}
          <div className="mx-auto mt-10 max-w-prose space-y-6">
            {article.body.map((p, i) => (
              <p key={i} className="text-lg leading-8 text-muted-foreground">
                {p}
              </p>
            ))}
          </div>

          {/* Share */}
          {showShare && (
            <div className="mx-auto mt-10 flex max-w-prose items-center gap-3 border-t border-border pt-6">
              <span className="text-sm font-medium text-foreground">Share:</span>
              <Button variant="outline" size="icon" asChild>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy link">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-muted/40 py-16 md:py-24">
          <div className="container">
            <h2 className="text-center text-2xl font-heading font-bold text-foreground md:text-3xl">
              Related {parentLabel === "Blog" ? "Posts" : "Guides"}
            </h2>
            <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} to={`${basePath}/${r.slug}`} className="group">
                  <Card className="h-full overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <div className="relative aspect-[16/9] bg-muted">
                      <img
                        src={r.image}
                        alt={r.title}
                        className="h-full w-full object-cover"
                      />
                      {r.category && (
                        <Badge
                          variant="outline"
                          className={`absolute left-2 top-2 text-xs font-medium ${categoryColors[r.category] ?? "bg-muted text-muted-foreground border-border"}`}
                        >
                          {r.category}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-base font-heading font-semibold text-foreground group-hover:text-primary">
                        {r.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {readingTime(r.body)} min read
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Read more <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {showCta && (
        <section className="bg-primary py-16 md:py-20">
          <div className="container flex flex-col items-center text-center">
            <h2 className="text-3xl font-heading font-bold text-primary-foreground md:text-4xl">
              Need equipment for your Athens trip?
            </h2>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8 rounded-xl px-8 text-base font-semibold"
            >
              <Link to="/equipment">Browse Equipment</Link>
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

export default ArticleDetail;
