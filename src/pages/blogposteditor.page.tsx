import { useParams } from "react-router";
import { BlogPostEditor } from "@/components/super admin section/blog/BlogPostEditor";

export const BlogPostEditorPage = () => {
  const { id } = useParams<{ id?: string }>();
  return <BlogPostEditor postId={id} />;
};

export default BlogPostEditorPage;
