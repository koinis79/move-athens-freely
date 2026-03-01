import { useParams } from "react-router-dom";
import PlaceholderPage from "@/components/PlaceholderPage";
const BlogPost = () => {
  const { slug } = useParams();
  return <PlaceholderPage title={`Blog: ${slug}`} />;
};
export default BlogPost;
