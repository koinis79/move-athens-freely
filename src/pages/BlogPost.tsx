import { useParams, Navigate } from "react-router-dom";
import ArticleDetail from "@/components/articles/ArticleDetail";
import SEOHead from "@/components/SEOHead";
import { blogPosts } from "@/data/articles";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = blogPosts.find((p) => p.slug === slug);

  if (!article) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <SEOHead
        title={article.seoTitle || `${article.title} | Movability`}
        description={article.seoDescription || article.excerpt}
        image={article.image}
        canonical={`/blog/${article.slug}`}
        type="article"
      />
      <ArticleDetail
        article={article}
        related={related}
        basePath="/blog"
        parentLabel="Blog"
        showShare
        showCta
      />
    </>
  );
};

export default BlogPost;
