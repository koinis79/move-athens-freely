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
import { Facebook, Twitter, LinkIcon, ArrowRight, Clock, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Article } from "@/data/articles";

function readingTime(article: Article): number {
  const text = article.content ?? article.body.join(" ");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

/** Convert **bold**, *italic*, and [links](url) to HTML */
function inlineMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((\/[^)]+)\)/g,
      '<a href="$2" class="text-primary font-medium hover:underline">$1</a>'
    )
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary font-medium hover:underline">$1</a>'
    );
}

/** Render a markdown string into JSX nodes */
function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    const Tag = listType;
    nodes.push(
      <Tag
        key={key++}
        className={
          listType === "ul"
            ? "my-4 ml-6 list-disc space-y-2"
            : "my-4 ml-6 list-decimal space-y-2"
        }
      >
        {listItems.map((item, i) => (
          <li
            key={i}
            className="text-lg leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: inlineMd(item) }}
          />
        ))}
      </Tag>
    );
    listType = null;
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("## ")) {
      flushList();
      nodes.push(
        <h2 key={key++} className="mt-10 mb-4 text-2xl font-heading font-bold text-foreground">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      nodes.push(
        <h3 key={key++} className="mt-8 mb-3 text-xl font-heading font-semibold text-foreground">
          {line.slice(4)}
        </h3>
      );
    } else if (/^- /.test(line)) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listItems.push(line.slice(2));
    } else if (/^\d+\. /.test(line)) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listItems.push(line.replace(/^\d+\.\s/, ""));
    } else if (/^---+$/.test(line.trim())) {
      flushList();
      nodes.push(<hr key={key++} className="my-8 border-border" />);
    } else if (line === "") {
      flushList();
    } else {
      flushList();
      nodes.push(
        <p
          key={key++}
          className="text-lg leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: inlineMd(line) }}
        />
      );
    }
  }

  flushList();
  return nodes;
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
  const mins = readingTime(article);
  const takeaways = article.takeaways ?? [];

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
          {/* Header */}
          <div className="mx-auto max-w-prose">
            {article.category && (
              <Badge
                variant="outline"
                className="mb-4 text-xs font-semibold bg-primary text-white hover:bg-primary/90 border-transparent"
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

          {/* Featured image */}
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={article.image}
              alt={article.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          {/* Quick Takeaway box */}
          <div className="mx-auto mt-8 max-w-prose">
            <div className="rounded-r-xl border-l-4 border-primary bg-primary/10 px-5 py-4">
              <div className="flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5 shrink-0" />
                <span className="font-semibold">Quick Takeaway</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {takeaways.length > 0 ? (
                  takeaways.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      Key points from this guide will appear here.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      Practical tips and accessibility highlights will be listed here.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      What to expect and how to prepare for your visit.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Body — markdown or plain paragraphs */}
          <div className="mx-auto mt-10 max-w-prose space-y-6">
            {article.content
              ? renderMarkdown(article.content)
              : article.body.map((p, i) => (
                  <p key={i} className="text-lg leading-relaxed text-muted-foreground">
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
                          className="absolute left-2 top-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 border-transparent shadow-sm"
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
                        {readingTime(r)} min read
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
