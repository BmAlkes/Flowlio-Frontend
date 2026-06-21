import { PageWrapper } from "@/components/common/pagewrapper";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import {
  useNotifications,
  useDeleteNotification,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
  type Notification,
} from "@/hooks/useNotifications";
import { formatDistanceToNow, format } from "date-fns";
import {
  Trash2, Check, CheckCheck, Bell, UserCheck, AlertTriangle,
  CreditCard, Sparkles, Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Center } from "@/components/ui/center";
import { ListSkeleton, ErrorState } from "@/components/skeletons";

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  lead_followup_due:     { icon: Calendar,       color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  lead_followup_overdue: { icon: AlertTriangle,  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/20" },
  lead_assigned:         { icon: UserCheck,       color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20" },
  ai_threshold_reached:  { icon: Sparkles,        color: "text-purple-600",  bg: "bg-purple-50 dark:bg-purple-900/20" },
  ai_quota_exceeded:     { icon: AlertTriangle,  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/20" },
  payment:               { icon: CreditCard,      color: "text-green-600",   bg: "bg-green-50 dark:bg-green-900/20" },
  default:               { icon: Bell,            color: "text-foreground",  bg: "bg-muted" },
};

const getTypeConfig = (type: string) =>
  TYPE_CONFIG[type] ?? TYPE_CONFIG.default;

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const limit = 20;

  const { data, isLoading, isFetching, error, refetch } = useNotifications({
    page,
    limit,
    unreadOnly: filter === "unread",
  });

  const loading = isLoading || isFetching;

  const deleteOne = useDeleteNotification();
  const markRead = useMarkNotificationAsRead();
  const markAllRead = useMarkAllNotificationsAsRead();
  const deleteAll = useDeleteAllNotifications();

  const notifications = data?.data?.notifications || [];
  const pagination = data?.data?.pagination;
  const unreadCount = pagination?.totalNotifications ?? 0;

  const handleDelete = (id: string) =>
    deleteOne.mutateAsync(id).then(() => toast.success("Deleted")).catch(() => toast.error("Failed"));

  const handleRead = (id: string) =>
    markRead.mutateAsync(id).catch(() => toast.error("Failed"));

  const handleMarkAllRead = () =>
    markAllRead.mutateAsync().then(() => toast.success("All marked as read")).catch(() => toast.error("Failed"));

  const handleDeleteAll = () => {
    if (!confirm("Delete all notifications? This cannot be undone.")) return;
    deleteAll.mutateAsync().then(() => toast.success("All deleted")).catch(() => toast.error("Failed"));
  };

  if (loading && notifications.length === 0) {
    return (
      <PageWrapper className="mt-6 px-4">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-lg font-semibold mb-6">Notifications</h1>
          <ListSkeleton rows={6} />
        </div>
      </PageWrapper>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <PageWrapper className="mt-6 px-4">
        <Center className="py-20">
          <ErrorState title="Error loading notifications" message={error.message} onRetry={() => refetch()} />
        </Center>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="mt-6 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <Flex className="items-center justify-between mb-6">
          <Flex className="items-center gap-2.5">
            <h1 className="text-lg font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-foreground text-background px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Flex>

          <Flex className="gap-1.5">
            {/* Filter toggle */}
            <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1); }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    filter === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {f === "all" ? "All" : "Unread"}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost" size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllRead.isPending}
                  className="h-8 text-xs gap-1"
                >
                  <CheckCheck className="h-3 w-3" /> Read all
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={handleDeleteAll}
                  disabled={deleteAll.isPending}
                  className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </Flex>
        </Flex>

        {/* List */}
        {notifications.length === 0 ? (
          <Center className="py-20 flex-col gap-3">
            <Bell className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </Center>
        ) : (
          <Stack className="gap-1">
            {notifications.map((n: Notification) => {
              const cfg = getTypeConfig(n.type);
              const Icon = cfg.icon;
              const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });

              return (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 px-4 py-3 rounded-lg transition-colors ${
                    !n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-muted/40"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Flex className="items-center gap-2 mb-0.5">
                      <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </Flex>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>

                    {/* Formatted data — hide raw UUIDs and timestamps */}
                    {n.data && Object.keys(n.data).length > 0 && (() => {
                      const entries = Object.entries(n.data).filter(([key]) => {
                        const k = key.toLowerCase();
                        return !k.includes("id") && !k.includes("token");
                      });
                      if (entries.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                          {entries.map(([key, value]) => {
                            let display = String(value);
                            if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                              try { display = format(new Date(value), "d MMM yyyy"); } catch { /* keep raw */ }
                            }
                            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
                            return (
                              <span key={key} className="text-xs text-muted-foreground">
                                <span className="font-medium">{label}:</span> {display}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo}</p>
                  </div>

                  {/* Actions */}
                  <Flex className="gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={() => handleRead(n.id)}
                        disabled={markRead.isPending}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={deleteOne.isPending}
                      className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Flex>
                </div>
              );
            })}
          </Stack>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Flex className="items-center justify-between mt-6 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Flex className="gap-1">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || isLoading}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage || isLoading}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Flex>
          </Flex>
        )}

      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;
