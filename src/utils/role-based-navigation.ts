import React from "react";
import { IoCalendarOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { LuWandSparkles } from "react-icons/lu";
import { TbInvoice, TbReportSearch } from "react-icons/tb";
import { LuUsers } from "react-icons/lu";
import { SquareKanban, UserPen, Clock } from "lucide-react";
import { GroupIcon, TaskManagementIcon } from "@/components/customeIcons";
import { MessageCircleQuestion, Bell } from "lucide-react";
import type { NavItem } from "@/components/admin/appsidebar";

/**
 * Role-based navigation system for PlanFlo
 * Based on the permission system defined in backend
 */

// Viewer navigation items (read-only access)
// Can view: Dashboard, Projects, My Tasks, Support Tickets, Settings
const viewerNavItems: NavItem[] = [
  {
    title: "Viewer",
    url: "/viewer",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/viewer/my-projects",
    title: "Projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/viewer/task-management",
    title: "My Tasks",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/support",
    title: "Support Tickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "Notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "Settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// Operator navigation items (can perform actions)
// Can view: Dashboard, Projects, Task Management, Support Tickets, Settings
// Can update: Projects, Tasks, Support Tickets
const operatorNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "Projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "Task Management",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/time-tracking",
    title: "Time Tracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/support",
    title: "Support Tickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "Notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "Settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// User navigation items (basic user)
// Can view: Dashboard, My Tasks, Settings
const userNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "Projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "Tasks Management",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/user-management",
    title: "User Management",
    icon: React.createElement(LuUsers),
  },
  {
    url: "/dashboard/client-management",
    title: "Client Management",
    icon: React.createElement(UserPen),
  },
  {
    url: "/dashboard/calender",
    title: "Calender",
    icon: React.createElement(IoCalendarOutline),
  },
  {
    url: "/dashboard/time-tracking",
    title: "Time Tracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/ai-assist",
    title: "AI Assistance",
    icon: React.createElement(LuWandSparkles),
  },
  {
    url: "/dashboard/payment-links",
    title: "Payment Links",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/invoice",
    title: "Invoices",
    icon: React.createElement(TbInvoice),
  },
  // {
  //   url: "/dashboard/subscription",
  //   title: "My Subscriptions",
  //   icon: React.createElement(TbInvoice),
  // },
  {
    url: "/dashboard/support",
    title: "Support Tickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "Notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "Settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// Sub Admin navigation items (same as super admin but without sub admin creation)
// Can access: All features except creating sub admins
const subAdminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "Projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "Tasks Management",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/user-management",
    title: "User Management",
    icon: React.createElement(LuUsers),
  },
  {
    url: "/dashboard/client-management",
    title: "Client Management",
    icon: React.createElement(UserPen),
  },
  {
    url: "/dashboard/calender",
    title: "Calender",
    icon: React.createElement(IoCalendarOutline),
  },

  {
    url: "/dashboard/ai-assist",
    title: "AI Assistance",
    icon: React.createElement(LuWandSparkles),
  },
  {
    url: "/dashboard/payment-links",
    title: "Payment Links",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/invoice",
    title: "Invoices",
    icon: React.createElement(TbInvoice),
  },
  // {
  //   url: "/dashboard/subscription",
  //   title: "My Subscriptions",
  //   icon: React.createElement(TbInvoice),
  // },
  {
    url: "/dashboard/time-tracking",
    title: "Time Tracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/support",
    title: "Support Tickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "Notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "Settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// Super Admin navigation items (full access)
// Can access: All features including super admin specific ones
const superAdminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "Projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "Tasks Management",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/user-management",
    title: "User Management",
    icon: React.createElement(LuUsers),
  },
  {
    url: "/dashboard/client-management",
    title: "Client Management",
    icon: React.createElement(UserPen),
  },
  {
    url: "/dashboard/calender",
    title: "Calender",
    icon: React.createElement(IoCalendarOutline),
  },
  {
    url: "/dashboard/time-tracking",
    title: "Time Tracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/ai-assist",
    title: "AI Assistance",
    icon: React.createElement(LuWandSparkles),
  },
  {
    url: "/dashboard/payment-links",
    title: "Payment Links",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/invoice",
    title: "Invoices",
    icon: React.createElement(TbInvoice),
  },
  // {
  //   url: "/dashboard/subscription",
  //   title: "My Subscriptions",
  //   icon: React.createElement(TbInvoice),
  // },
  {
    url: "/dashboard/support",
    title: "Support Tickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  // {
  //   url: "/dashboard/notifications",
  //   title: "Notifications",
  //   icon: React.createElement(Bell),
  // },
  {
    url: "/dashboard/settings",
    title: "Settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

/**
 * Get navigation items based on user role
 * @param role - User role (superadmin, subadmin, operator, viewer, user)
 * @returns Array of navigation items for the role
 */
export const getNavigationItemsByRole = (role: string): NavItem[] => {
  switch (role) {
    case "superadmin":
      return superAdminNavItems;
    case "subadmin":
      return subAdminNavItems;
    case "operator":
      return operatorNavItems;
    case "viewer":
      return viewerNavItems;
    case "user":
    default:
      return userNavItems;
  }
};

/**
 * Check if user has access to a specific route
 * @param role - User role
 * @param route - Route to check access for
 * @returns boolean indicating if user has access
 */
export const hasRouteAccess = (role: string, route: string): boolean => {
  const navItems = getNavigationItemsByRole(role);
  return navItems.some((item) => {
    if (item.url === route) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => subItem.url === route);
    }
    return false;
  });
};

/**
 * Get role-specific page title
 * @param role - User role
 * @returns Page title for the role
 */
export const getRolePageTitle = (role: string): string => {
  switch (role) {
    case "superadmin":
      return "Super Admin Dashboard";
    case "subadmin":
      return "Sub Admin Dashboard";
    case "operator":
      return "Operator Dashboard";
    case "viewer":
      return "Viewer Dashboard";
    case "user":
    default:
      return "User Dashboard";
  }
};

/**
 * Get role-specific welcome message
 * @param role - User role
 * @param userName - User's name
 * @returns Welcome message for the role
 */
export const getRoleWelcomeMessage = (
  role: string,
  userName: string
): string => {
  switch (role) {
    case "superadmin":
      return `Welcome back, ${userName}! You have full administrative access.`;
    case "subadmin":
      return `Welcome back, ${userName}! You have full administrative access (same as super admin).`;
    case "operator":
      return `Welcome back, ${userName}! You can manage projects and tasks.`;
    case "viewer":
      return `Welcome back, ${userName}! You have read-only access to projects and tasks.`;
    case "user":
    default:
      return `Welcome back, ${userName}! You can view your tasks and settings.`;
  }
};

/**
 * Get role-specific permissions summary
 * @param role - User role
 * @returns Array of permission descriptions
 */
export const getRolePermissions = (role: string): string[] => {
  switch (role) {
    case "superadmin":
      return [
        "Full system access",
        "Manage all users and organizations",
        "Access all projects and tasks",
        "Manage subscriptions and billing",
        "System administration",
      ];
    case "subadmin":
      return [
        "Full system access (same as super admin)",
        "Manage all users and organizations",
        "Access all projects and tasks",
        "Manage subscriptions and billing",
        "System administration",
        "Cannot create sub admins",
      ];
    case "operator":
      return [
        "View and update projects",
        "Manage assigned tasks",
        "Create and manage support tickets",
        "Access calendar and time tracking",
      ];
    case "viewer":
      return [
        "View projects and tasks",
        "Read-only access to most features",
        "Create support tickets",
        "Access personal settings",
      ];
    case "user":
    default:
      return [
        "View assigned tasks",
        "Access personal settings",
        "Basic dashboard access",
      ];
  }
};
