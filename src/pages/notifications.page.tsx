import { PageWrapper } from "@/components/common/pagewrapper";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  useDeleteNotification,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
  type Notification,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Check, CheckCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Center } from "@/components/ui/center";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListSkeleton, ErrorState } from "@/components/skeletons";

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

  const deleteNotificationMutation = useDeleteNotification();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteAllMutation = useDeleteAllNotifications();

  const notifications = data?.data?.notifications || [];
  const pagination = data?.data?.pagination;

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification: " + error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      toast.error("Failed to mark notification as read: " + error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read: " + error);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all notifications? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteAllMutation.mutateAsync();
      toast.success("All notifications deleted");
    } catch (error) {
      toast.error("Failed to delete all notifications: " + error);
    }
  };

  if (loading && (!data || notifications.length === 0)) {
    return (
      <PageWrapper className="mt-6 px-4">
        <Stack className="p-3 gap-6">
          <Flex className="justify-between items-center">
            <h1 className="text-lg font-medium">Notifications</h1>
          </Flex>
          <ListSkeleton rows={8} withAvatar />
        </Stack>
      </PageWrapper>
    );
  }

  if (error && (!data || notifications.length === 0)) {
    return (
      <PageWrapper className="mt-6 px-4">
        <Center className="py-20">
          <ErrorState
            title="Error loading notifications"
            message={error.message || "Please try again later."}
            onRetry={() => refetch()}
          />
        </Center>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="mt-6 px-4">
      <Stack className="p-3 relative overflow-hidden">
        <Flex className="justify-between items-center mb-2 max-sm:flex-col max-sm:gap-2">
          <Flex className="items-center gap-3">
            <h1 className="text-lg font-medium">Notifications</h1>
            {pagination && pagination.totalNotifications > 0 && (
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {pagination.totalNotifications}
              </Badge>
            )}
          </Flex>

          <Flex className="gap-2">
            <Select
              value={filter}
              onValueChange={(v: "all" | "unread") => setFilter(v)}
            >
              <SelectTrigger className="w-28 h-8 text-xs border-border rounded-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>

            {notifications.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="h-8 text-xs border-border rounded-full cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={deleteAllMutation.isPending}
                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive hover:border-destructive rounded-full cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete All
                </Button>
              </>
            )}
          </Flex>
        </Flex>

        <Box className="w-full h-0.5 bg-border rounded-full absolute top-14 left-0 max-sm:top-24"></Box>

        <Box className="max-h-[calc(100vh-200px)] overflow-auto scroll space-y-3 mt-5">
          {loading && notifications.length === 0 ? (
            <ListSkeleton rows={5} withAvatar />
          ) : notifications.length === 0 ? (
            <Center className="py-8">
              <p className="text-sm text-muted-foreground">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
            </Center>
          ) : (
            notifications.map((notification: Notification) => {
              const dateObj = new Date(notification.createdAt);
              const timeAgo = formatDistanceToNow(dateObj, {
                addSuffix: true,
              });

              return (
                <Box
                  key={notification.id}
                  className={`p-3 rounded-lg border border-border hover:bg-muted transition-colors ${
                    !notification.read ? "bg-accent/50" : "bg-card"
                  }`}
                >
                  <Flex className="items-start justify-between gap-3">
                    <Flex className="items-start gap-3 flex-1">
                      <Box className="size-2.5 border border-border outline outline-border outline-offset-1 bg-muted rounded-full mt-1.5" />
                      <Stack className="gap-1 flex-1">
                        <Flex className="items-center gap-2">
                          <h2 className="font-medium text-sm text-foreground">
                            {notification.title}
                          </h2>
                          {!notification.read && (
                            <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 rounded-full">
                              New
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </Flex>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        {notification.data &&
                          Object.keys(notification.data).length > 0 && (
                            <Box className="mt-2 space-y-1">
                              {Object.entries(notification.data)
                                .filter(([key]) => {
                                  const lowerKey = key.toLowerCase();
                                  return (
                                    !lowerKey.includes("ticketid") &&
                                    !lowerKey.includes("ticket_id")
                                  );
                                })
                                .map(([key, value]) => (
                                  <Flex
                                    key={key}
                                    className="justify-between text-xs"
                                  >
                                      <span className="font-medium text-muted-foreground capitalize">
                                      {key.replace(/([A-Z])/g, " $1").trim()}:
                                    </span>
                                    <span className="text-foreground">
                                      {String(value)}
                                    </span>
                                  </Flex>
                                ))}
                            </Box>
                          )}
                      </Stack>
                    </Flex>
                    <Flex className="gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              );
            })
          )}
        </Box>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Flex className="justify-between items-center mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <Flex className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || isLoading}
                className="h-8 text-xs rounded-full"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={!pagination.hasNextPage || isLoading}
                className="h-8 text-xs rounded-full"
              >
                Next
              </Button>
            </Flex>
          </Flex>
        )}
      </Stack>
    </PageWrapper>
  );
};

export default NotificationsPage;
