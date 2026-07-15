import { PageWrapper } from "@/components/common/pagewrapper";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useDeleteNotification,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
  type Notification,
} from "@/hooks/useNotifications";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import {
  Trash2, Check, CheckCheck, Bell, UserCheck, AlertTriangle,
  CreditCard, Sparkles, Calendar, ChevronLeft, ChevronRight,
  ClipboardX, ShieldAlert, BarChart3, Search, MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Center } from "@/components/ui/center";
import { ListSkeleton, ErrorState } from "@/components/skeletons";

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  lead_followup_due:     { icon: Calendar,       color: "text-blue-600 dark:text-blue-300",     bg: "bg-blue-100 dark:bg-blue-500/25" },
  lead_followup_overdue: { icon: AlertTriangle,  color: "text-rose-600 dark:text-rose-300",     bg: "bg-rose-100 dark:bg-rose-500/25" },
  lead_assigned:         { icon: UserCheck,       color: "text-indigo-600 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-500/25" },
  ai_threshold_reached:  { icon: Sparkles,        color: "text-purple-600 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-500/25" },
  ai_quota_exceeded:     { icon: AlertTriangle,  color: "text-rose-600 dark:text-rose-300",     bg: "bg-rose-100 dark:bg-rose-500/25" },
  payment:               { icon: CreditCard,      color: "text-green-600 dark:text-green-300",   bg: "bg-green-100 dark:bg-green-500/25" },
  task_overdue:          { icon: ClipboardX,      color: "text-rose-600 dark:text-rose-300",     bg: "bg-rose-100 dark:bg-rose-500/25" },
  task_completed:        { icon: Check,            color: "text-green-600 dark:text-green-300",   bg: "bg-green-100 dark:bg-green-500/25" },
  project_risk:          { icon: ShieldAlert,     color: "text-rose-600 dark:text-rose-300",     bg: "bg-rose-100 dark:bg-rose-500/25" },
  weekly_summary:        { icon: BarChart3,       color: "text-emerald-600 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-500/25" },
  project_comment:       { icon: Sparkles,        color: "text-orange-600 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-500/25" },
  client_message:        { icon: Sparkles,        color: "text-orange-600 dark:text-orange-300", bg: "bg-orange-100 dark:bg-orange-500/25" },
  default:               { icon: Bell,            color: "text-foreground", bg: "bg-muted" },
};

const MENTION_TYPES = new Set(["project_comment", "client_message"]);

const getTypeConfig = (type: string) =>
  TYPE_CONFIG[type] ?? TYPE_CONFIG.default;

function groupLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM yyyy");
}

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread" | "mentions">("all");
  const [search, setSearch] = useState("");
  const limit = 20;

  const { data, isLoading, isFetching, error, refetch } = useNotifications({
    page,
    limit,
    unreadOnly: filter === "unread",
  });
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();

  const loading = isLoading || isFetching;

  const deleteOne = useDeleteNotification();
  const markRead = useMarkNotificationAsRead();
  const markAllRead = useMarkAllNotificationsAsRead();
  const deleteAll = useDeleteAllNotifications();

  const allNotifications = data?.data?.notifications || [];
  const pagination = data?.data?.pagination;

  const notifications = useMemo(() => {
    let list = allNotifications;
    if (filter === "mentions") list = list.filter((n) => MENTION_TYPES.has(n.type));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    return list;
  }, [allNotifications, filter, search]);

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of notifications) {
      const label = groupLabel(new Date(n.createdAt));
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return Array.from(map.entries());
  }, [notifications]);

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

  if (loading && allNotifications.length === 0) {
    return (
      <PageWrapper className="mt-6 px-4">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-semibold mb-6">Notifications</h1>
          <ListSkeleton rows={6} />
        </div>
      </PageWrapper>
    );
  }

  if (error && allNotifications.length === 0) {
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
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-5">
          <Flex className="items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-blue-600 text-white h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Flex>
          <p className="text-sm text-muted-foreground/90 mt-1">Stay updated with what's happening in your workspace.</p>
        </div>

        {/* Toolbar */}
        <Flex className="items-center gap-2 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="ps-9 h-9 text-sm rounded-lg"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border shrink-0">
            {(["all", "unread", "mentions"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize ${
                  filter === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <Button
            variant="outline" size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending || unreadCount === 0}
            className="h-9 text-xs gap-1.5 rounded-lg shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
          </Button>

          <Button
            variant="outline" size="icon"
            onClick={handleDeleteAll}
            disabled={deleteAll.isPending || allNotifications.length === 0}
            className="h-9 w-9 rounded-lg shrink-0 text-muted-foreground hover:text-rose-600"
            title="Delete all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </Flex>

        {/* List */}
        {notifications.length === 0 ? (
          <Center className="py-20 flex-col gap-3">
            <Bell className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              {search ? "No notifications match your search." : filter === "unread" ? "No unread notifications" : filter === "mentions" ? "No mentions yet" : "No notifications yet"}
            </p>
          </Center>
        ) : (
          <Stack className="gap-5">
            {groups.map(([label, items]) => (
              <div key={label}>
                <p className="text-xs font-medium text-muted-foreground/90 mb-2 px-1">{label}</p>
                <Stack className="gap-2">
                  {items.map((n) => {
                    const cfg = getTypeConfig(n.type);
                    const Icon = cfg.icon;
                    const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });

                    const extraEntries = n.data && Object.keys(n.data).length > 0
                      ? Object.entries(n.data).filter(([key]) => {
                          const k = key.toLowerCase();
                          return !k.includes("id") && !k.includes("token");
                        })
                      : [];

                    return (
                      <div
                        key={n.id}
                        className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
                          !n.read ? "bg-blue-50/60 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/20" : "bg-card border-border"
                        }`}
                      >
                        {!n.read && <span className="absolute start-1.5 top-5 w-1.5 h-1.5 rounded-full bg-blue-500" />}

                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                          <Icon className={`h-5 w-5 ${cfg.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 ps-1">
                          <Flex className="items-center gap-2">
                            <p className="text-sm font-semibold text-foreground leading-snug">{n.title}</p>
                            {!n.read && (
                              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </Flex>

                          <p className="text-sm text-muted-foreground/90 leading-relaxed mt-0.5">
                            {n.message}
                          </p>

                          {extraEntries.length > 0 && (
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                              {extraEntries.map(([key, value]) => {
                                let display = String(value);
                                const isDate = typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/);
                                if (isDate) {
                                  try { display = format(new Date(value as string), "d MMM yyyy '•' h:mm a"); } catch { /* keep raw */ }
                                }
                                const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
                                return (
                                  <span key={key} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {isDate && <Calendar className="h-3 w-3" />}
                                    {label}: {display}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Timestamp + actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs text-muted-foreground/90 whitespace-nowrap">{timeAgo}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!n.read && (
                                <DropdownMenuItem onClick={() => handleRead(n.id)} disabled={markRead.isPending}>
                                  <Check className="h-3.5 w-3.5 me-2" /> Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(n.id)} disabled={deleteOne.isPending} className="text-rose-600 focus:text-rose-600">
                                <Trash2 className="h-3.5 w-3.5 me-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </Stack>
              </div>
            ))}
          </Stack>
        )}

        {/* Footer / pagination */}
        {notifications.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            {pagination && pagination.totalPages > 1 ? (
              <Flex className="items-center justify-between">
                <span className="text-xs text-muted-foreground/90">
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
            ) : (
              <div className="text-center">
                <p className="text-xs text-muted-foreground/90">You've reached the end</p>
                <p className="text-xs text-muted-foreground/90">No more notifications to show</p>
              </div>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;
