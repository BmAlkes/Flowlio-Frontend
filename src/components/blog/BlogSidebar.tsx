import { Link } from "react-router";
import { Eye } from "lucide-react";
import { BlogCategoryCount, BlogPost } from "@/hooks/useBlog";

interface BlogSidebarProps {
  categories?: BlogCategoryCount[];
  mostViewed?: BlogPost[];
  activeCategory?: string;
}

export const BlogSidebar = ({ categories, mostViewed, activeCategory }: BlogSidebarProps) => {
  if ((!categories || categories.length === 0) && (!mostViewed || mostViewed.length === 0)) {
    return null;
  }

  return (
    <aside className="space-y-8">
      {categories && categories.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Categories
          </h3>
          <div className="flex flex-col gap-1">
            <Link
              to="/blog"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !activeCategory ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All posts
            </Link>
            {categories.map(({ category, count }) => (
              <Link
                key={category}
                to={`/blog/category/${category}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeCategory === category ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{category}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {mostViewed && mostViewed.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
            Most viewed
          </h3>
          <div className="flex flex-col gap-3">
            {mostViewed.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="flex items-start gap-3 group"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                  </p>
                  {typeof post.viewCount === "number" && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Eye className="h-3 w-3" />
                      {post.viewCount.toLocaleString()} views
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
