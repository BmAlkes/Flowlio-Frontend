import { Link } from "react-router";
import { FileText, Eye, CheckCircle2, PenLine, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useBlogAdminStats } from "@/hooks/useBlogAdmin";

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) => (
  <Card>
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

export const BlogStatsCards = () => {
  const { data, isLoading } = useBlogAdminStats();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={FileText} label="Total posts" value={stats.totalPosts} accent="bg-indigo-100 text-indigo-600" />
        <StatCard icon={Eye} label="Total views" value={stats.totalViews} accent="bg-sky-100 text-sky-600" />
        <StatCard icon={CheckCircle2} label="Published" value={stats.byStatus?.published ?? 0} accent="bg-emerald-100 text-emerald-600" />
        <StatCard icon={PenLine} label="Drafts" value={stats.byStatus?.draft ?? 0} accent="bg-amber-100 text-amber-600" />
        <StatCard icon={Archive} label="Archived" value={stats.byStatus?.archived ?? 0} accent="bg-gray-100 text-gray-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 most viewed posts</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats.topPosts || stats.topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No views yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {stats.topPosts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/superadmin/blog/analytics/${post.id}`}
                  className="flex items-center gap-4 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <span className="text-sm font-bold text-muted-foreground w-5">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{post.title}</p>
                    {post.publishedAt && (
                      <p className="text-xs text-muted-foreground">
                        Published {format(new Date(post.publishedAt), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground flex items-center gap-1 shrink-0">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    {post.views.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
