import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Pencil, BarChart3, Trash2, Loader2, ImageOff } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBlogAdminPosts, useDeleteBlogPost } from "@/hooks/useBlogAdmin";
import { BlogPostStatus } from "@/hooks/useBlog";

const STATUS_TABS: { value: BlogPostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<BlogPostStatus, string> = {
  draft: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-gray-100 text-gray-600",
};

export const BlogPostsTable = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<BlogPostStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useBlogAdminPosts({ status, search: search || undefined, page, limit: 20 });
  const deletePost = useDeleteBlogPost();

  const posts = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Tabs
          value={status}
          onValueChange={(v) => {
            setStatus(v as BlogPostStatus | "all");
            setPage(1);
          }}
        >
          <TabsList className="bg-background border border-border shadow-sm p-1 h-auto">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="py-1.5 px-3">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No posts found.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start text-sm font-semibold text-muted-foreground w-16">Cover</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-muted-foreground">Views</th>
                <th className="px-4 py-3 text-start text-sm font-semibold text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-end text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground max-w-[280px] truncate">
                    {post.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{post.category || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[post.status]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">{(post.viewCount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {post.updatedAt ? format(new Date(post.updatedAt), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => navigate(`/superadmin/blog/edit/${post.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Analytics"
                        onClick={() => navigate(`/superadmin/blog/analytics/${post.id}`)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteId(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) deletePost.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
