import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useDeleteAllNotifications,
} from "@/hooks/useNotifications";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router";
import { Bell, InboxIcon, Ticket, Users, AlertCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { Center } from "../../ui/center";
import { Badge } from "../../ui/badge";
import { Flex } from "../../ui/flex";
import { Box } from "../../ui/box";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user.provider";

export const NotificationsDropdown: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { data: user } = useUser(); // Used in handleNotificationClick and Link components
  const { data: notificationsData, isLoading } = useNotifications({ limit: 5 });
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteAllMutation = useDeleteAllNotifications();
  const navigate = useNavigate();

  const notifications = notificationsData?.data?.notifications || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "support_ticket_assigned":
      case "support_ticket_organization":
      case "support_ticket_created":
        return <Ticket className="h-4 w-4" />;
      case "message":
        return <IoChatboxEllipsesOutline className="h-4 w-4" />;
      case "system":
        return <AlertCircle className="h-4 w-4" />;
      case "organization":
        return <Users className="h-4 w-4" />;
      default:
        return <InboxIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "support_ticket_assigned":
      case "support_ticket_organization":
      case "support_ticket_created":
        return "bg-blue-500";
      case "message":
        return "bg-green-500";
      case "system":
        return "bg-orange-500";
      case "organization":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleNotificationClick = (notification: any, e?: React.MouseEvent) => {
    // Prevent default behavior and stop propagation to avoid page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Mark as read if not already read
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to notifications page based on user role
    const userRole = user?.user.role;
    if (userRole === "superadmin" || userRole === "subadmin") {
      navigate("/superadmin/notifications");
    } else if (userRole === "viewer") {
      // Check if viewer has notifications route, otherwise use dashboard
      navigate("/dashboard/notifications");
    } else {
      navigate("/dashboard/notifications");
    }
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className={cn(
                  "p-5 relative bg-white text-black hover:bg-white border border-gray-300 rounded-full cursor-pointer",
                  className
                )}
              >
                <Bell className="font-extralight" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 left-5.5 size-6 rounded-full bg-red-500 text-white text-[9px] font-medium border-2 border-gray-100">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="mt-2">
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        align="end"
        className="max-w-[26rem] max-sm:w-[19rem] p-2"
      >
        <DropdownMenuLabel className="mb-2">
          <Flex className="justify-between items-center">
            <span className="text-lg font-medium">Notifications</span>
            <Flex className="gap-2">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-800 p-1 h-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAllMutation.mutate();
                  }}
                  disabled={deleteAllMutation.isPending}
                >
                  Clear All
                </Button>
              )}
              <Link
                to={
                  user?.user.role === "viewer"
                    ? "/viewer/viewer-support"
                    : user?.user.role === "superadmin"
                    ? "/superadmin/support-tickets"
                    : "/dashboard/support"
                }
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Support Center
              </Link>
            </Flex>
          </Flex>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <Box className="space-y-1 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <Box className="text-center py-4 text-gray-500">
              Loading notifications...
            </Box>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <Flex
                key={notification.id}
                className={cn(
                  "gap-3 items-start p-2 rounded-lg cursor-pointer hover:bg-gray-50",
                  !notification.read && "bg-blue-50"
                )}
                onClick={(e) => handleNotificationClick(notification, e)}
              >
                <Center
                  className={cn(
                    "h-8 w-8 rounded-full text-white",
                    getTypeColor(notification.type)
                  )}
                >
                  {getTypeIcon(notification.type)}
                </Center>
                <Box className="flex-1 space-y-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      !notification.read && "text-blue-600"
                    )}
                  >
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(notification.createdAt), "PPp")}
                  </p>
                </Box>
              </Flex>
            ))
          ) : (
            <Box className="text-center py-4 text-gray-500">
              No notifications
            </Box>
          )}
        </Box>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
