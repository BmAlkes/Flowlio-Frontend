import {
  useState,
  ReactNode,
  useContext,
  useCallback,
  createContext,
} from "react";

export interface Notification {
  type: "message" | "system";
  message: string;
  sender?: string;
  timestamp: Date;
  isRead: boolean;
  title: string;
  id: string;
}

interface NotificationsContextType {
  clearAll: () => void;
  markAllAsRead: () => void;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

// Sample initial notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New message Reported",
    message: "Critical message reported in production environment",
    timestamp: new Date(),
    isRead: true,
    type: "message",
    sender: "Project Manager",
  },
  {
    id: "2",
    title: "New message Reported",
    message: "Critical message reported in production environment",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: true,
    type: "message",
    sender: "System Monitor",
  },
  {
    id: "3",
    title: "Meeting Reminder",
    message: "Team sync meeting in 15 minutes",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: true,
    type: "message",
    sender: "Calendar",
  },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      setNotifications((prev) => [
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
        ...prev,
      ]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useGlobalNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
