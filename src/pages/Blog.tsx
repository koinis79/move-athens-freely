import ArticleListing from "@/components/articles/ArticleListing";
import { blogPosts } from "@/data/articles";

const Blog = () => (
  <ArticleListing
    heading="Blog"
    subheading="Stories, tips, and insights about accessible travel in Athens"
    articles={blogPosts}
    basePath="/blog"
  />
);

export default Blog;
