import { useParams, Navigate } from "react-router-dom";
import ArticleDetail from "@/components/articles/ArticleDetail";
import { Article as ArticleSD, BreadcrumbList as BreadcrumbSD } from "@/components/StructuredData";
import { guides } from "@/data/articles";

const AccessibleAthensGuide = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = guides.find((g) => g.slug === slug);

  if (!article) return <Navigate to="/accessible-athens" replace />;

  const related = guides.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <>
      <ArticleSD
        title={article.title}
        description={article.excerpt}
        datePublished={article.date}
        image={article.image}
        slug={article.slug}
      />
      <BreadcrumbSD
        items={[
          { name: "Home", href: "/" },
          { name: "Accessible Athens", href: "/accessible-athens" },
          { name: article.title },
        ]}
      />
      <ArticleDetail
        article={article}
        related={related}
        basePath="/accessible-athens"
        parentLabel="Accessible Athens"
        showCta
      />
    </>
  );
};

export default AccessibleAthensGuide;
