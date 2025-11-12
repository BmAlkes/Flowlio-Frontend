import { type Notification } from "@/providers/notifications.provider";
import type { Tabs } from "@/hooks/useinboxtabs";
import type { FC, ReactNode } from "react";

export const RenderNotification: FC<{
  children: (notification: Notification, key: number) => ReactNode;
  notifications: Notification[];
  filterType: Tabs;
}> = ({ children, filterType: type, notifications }) => {
  if (type === "unread") {
    return <>{notifications.filter((n) => !n.isRead).map(children)}</>;
  } else if (type === "tasks") {
    //   return <>{notifications.filter((n) => n.type === "task").map(children)}</>;
    // } else if (type === "issues") {
    //   return <>{notifications.filter((n) => n.type === "issue").map(children)}</>;
  } else if (type === "all") {
    return <>{notifications.map(children)}</>;
  } else if (type === "message") {
    return (
      <>{notifications.filter((n) => n.type === "message").map(children)}</>
    );
  }

  return null;
};
