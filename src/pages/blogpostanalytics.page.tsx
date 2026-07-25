import { useParams } from "react-router";
import { BlogPostAnalytics } from "@/components/super admin section/blog/BlogPostAnalytics";

export const BlogPostAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <BlogPostAnalytics postId={id} />;
};

export default BlogPostAnalyticsPage;
