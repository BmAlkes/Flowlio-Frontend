import { Link } from "react-router";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { BlogPost, getAuthorName } from "@/hooks/useBlog";

const CATEGORY_COLORS: Record<string, string> = {
  "project-management": "bg-indigo-100 text-indigo-700",
  "client-management": "bg-emerald-100 text-emerald-700",
  invoicing: "bg-amber-100 text-amber-700",
  productivity: "bg-rose-100 text-rose-700",
  automation: "bg-violet-100 text-violet-700",
};

const categoryColor = (category?: string) =>
  (category && CATEGORY_COLORS[category.toLowerCase().replace(/\s+/g, "-")]) ||
  "bg-sky-100 text-sky-700";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  const dateLabel = post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "";

  if (featured) {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-shadow"
      >
        <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>
        <div className="p-8 flex flex-col justify-center gap-3">
          {post.category && (
            <span className={`w-fit text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${categoryColor(post.category)}`}>
              {post.category}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight group-hover:text-indigo-600 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-muted-foreground text-base line-clamp-3">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="font-medium text-foreground">{getAuthorName(post.authorName)}</span>
            <span>·</span>
            <span>{dateLabel}</span>
            {post.readingTimeMin && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTimeMin} min read
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-5 flex flex-col gap-2.5 flex-1">
        {post.category && (
          <span className={`w-fit text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${categoryColor(post.category)}`}>
            {post.category}
          </span>
        )}
        <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="font-medium text-foreground/80">{getAuthorName(post.authorName)}</span>
          <span>·</span>
          <span>{dateLabel}</span>
          {post.readingTimeMin && (
            <>
              <span>·</span>
              <span>{post.readingTimeMin} min</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
