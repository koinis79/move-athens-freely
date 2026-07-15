import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import type { Article } from "@/data/articles";

export function readingTime(article: Article): number {
  const text = article.content ?? article.body.join(" ");
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

interface ArticleCardProps {
  article: Article;
  /** Full destination path, e.g. `/accessible-athens/acropolis-wheelchair-guide` */
  to: string;
  linkLabel?: string;
  /** Extra classes on the Card (used to give featured cards a subtle accent). */
  className?: string;
}

/**
 * The shared article/guide card. Design is intentionally identical everywhere
 * it's used (flat listings and the sectioned Accessible Athens page).
 */
const ArticleCard = ({ article: a, to, linkLabel = "Read More", className = "" }: ArticleCardProps) => (
  <Link to={to} className="group">
    <Card
      className={`h-full overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="relative aspect-[16/9] bg-muted">
        <img src={a.image} alt={a.title} className="h-full w-full object-cover" />
        {a.category && (
          <Badge
            variant="outline"
            className="absolute left-3 top-3 text-xs font-semibold bg-primary text-white hover:bg-primary/90 border-transparent shadow-sm"
          >
            {a.category}
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {new Date(a.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {a.author && ` · ${a.author}`}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime(a)} min read
          </span>
        </div>
        <h2 className="mt-2 text-lg font-heading font-semibold text-foreground group-hover:text-primary">
          {a.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  </Link>
);

export default ArticleCard;
