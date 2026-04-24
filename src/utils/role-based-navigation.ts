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
import { BadgeDollarSign } from "lucide-react";
import { FolderOpen, ListTodo, FileText } from "lucide-react";

// Client portal – project / tasks / invoices / media + self-service profile (PUT /user/profile)
const clientNavItems: NavItem[] = [
  {
    title: "projectManagement",
    url: "/clients/projects",
    icon: React.createElement(FolderOpen),
  },
  {
    title: "taskManagement",
    url: "/clients/tasks",
    icon: React.createElement(ListTodo),
  },
  {
    title: "invoices",
    url: "/clients/invoices",
    icon: React.createElement(FileText),
  },
  {
    title: "proposals",
    url: "/clients/proposals",
    icon: React.createElement(FileText),
  },
  {
    title: "messages",
    url: "/clients/activity",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    title: "mediaCenter",
    url: "/clients/media-center",
    icon: React.createElement(TbReportSearch),
  },
  {
    title: "settings",
    url: "/clients/settings",
    icon: React.createElement(IoSettingsOutline),
  },
]; 


const viewerNavItems: NavItem[] = [
  {
    title: "viewer",
    url: "/viewer",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/viewer/my-projects",
    title: "projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/viewer/task-management",
    title: "tasks",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/support",
    title: "supportTickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// Operator navigation items (can perform actions)
// Can view: Dashboard, Projects, Task Management, Support Tickets, Settings
// Can update: Projects, Tasks, Support Tickets
const operatorNavItems: NavItem[] = [
  {
    title: "dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "tasksManagement",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/time-tracking",
    title: "timeTracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/support",
    title: "supportTickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "settings",
    icon: React.createElement(IoSettingsOutline),
  },
  {
    url: "/dashboard/client-management/media-center",
    title: "mediaCenter",
    icon: React.createElement(TbReportSearch),
  },
];

// User (Member) navigation items - no Invoices, Payment Links, Client Management, User Management (Admin/Manager only)
const userNavItems: NavItem[] = [
  {
    title: "dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "tasksManagement",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/calender",
    title: "calendar",
    icon: React.createElement(IoCalendarOutline),
  },
  {
    url: "/dashboard/time-tracking",
    title: "timeTracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/ai-assist",
    title: "aiAssistance",
    icon: React.createElement(LuWandSparkles),
  },
  {
    url: "/dashboard/subscription",
    title: "mySubscriptions",
    icon: React.createElement(BadgeDollarSign),
  },
  {
    url: "/dashboard/support",
    title: "supportTickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// User as organization owner (purchaser): same as user + Invoices, Payment Links, Client Management, User Management
const userOrgOwnerNavItems: NavItem[] = [
  {
    title: "dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/reports",
    title: "reports",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/project",
    title: "projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "tasksManagement",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/user-management",
    title: "userManagement",
    icon: React.createElement(LuUsers),
  },
  {
    url: "/dashboard/client-management",
    title: "clientManagement",
    icon: React.createElement(UserPen),
  },
  {
    url: "/dashboard/client-management/media-center",
    title: "mediaCenter",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/calender",
    title: "calendar",
    icon: React.createElement(IoCalendarOutline),
  },
  {
    url: "/dashboard/time-tracking",
    title: "timeTracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/ai-assist",
    title: "aiAssistance",
    icon: React.createElement(LuWandSparkles),
  },
  {
    url: "/dashboard/payment-links",
    title: "paymentLinks",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/invoice",
    title: "invoices",
    icon: React.createElement(TbInvoice),
  },
  {
    url: "/dashboard/subscription",
    title: "mySubscriptions",
    icon: React.createElement(BadgeDollarSign),
  },
  {
    url: "/dashboard/support",
    title: "supportTickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "settings",
    icon: React.createElement(IoSettingsOutline),
  },
  {
    url: "/dashboard/proposals",
    title: "proposals",
    icon: React.createElement(FileText),
  },
];

// Sub Admin navigation items (same as super admin but without sub admin creation)
// Can access: All features except creating sub admins
const subAdminNavItems: NavItem[] = [
  {
    title: "dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "tasksManagement",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/user-management",
    title: "userManagement",
    icon: React.createElement(LuUsers),
  },
  {
    url: "/dashboard/client-management",
    title: "clientManagement",
    icon: React.createElement(UserPen),
  },
  {
    url: "/dashboard/calender",
    title: "calendar",
    icon: React.createElement(IoCalendarOutline),
  },

  {
    url: "/dashboard/ai-assist",
    title: "aiAssistance",
    icon: React.createElement(LuWandSparkles),
  },
  {
    url: "/dashboard/payment-links",
    title: "paymentLinks",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/invoice",
    title: "invoices",
    icon: React.createElement(TbInvoice),
  },
  // {
  //   url: "/dashboard/subscription",
  //   title: "My Subscriptions",
  //   icon: React.createElement(TbInvoice),
  // },
  {
    url: "/dashboard/time-tracking",
    title: "timeTracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/support",
    title: "supportTickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  {
    url: "/dashboard/notifications",
    title: "notifications",
    icon: React.createElement(Bell),
  },
  {
    url: "/dashboard/settings",
    title: "settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// Super Admin navigation items (full access)
// Can access: All features including super admin specific ones
const superAdminNavItems: NavItem[] = [
  {
    title: "dashboard",
    url: "/dashboard",
    icon: React.createElement(SquareKanban),
  },
  {
    url: "/dashboard/project",
    title: "projects",
    icon: React.createElement(GroupIcon),
  },
  {
    url: "/dashboard/task-management",
    title: "tasksManagement",
    icon: React.createElement(TaskManagementIcon),
  },
  {
    url: "/dashboard/user-management",
    title: "userManagement",
    icon: React.createElement(LuUsers),
  },
  {
    url: "/dashboard/client-management",
    title: "clientManagement",
    icon: React.createElement(UserPen),
  },
  {
    url: "/dashboard/calender",
    title: "calendar",
    icon: React.createElement(IoCalendarOutline),
  },
  {
    url: "/dashboard/time-tracking",
    title: "timeTracking",
    icon: React.createElement(Clock),
  },
  {
    url: "/dashboard/ai-assist",
    title: "aiAssistance",
    icon: React.createElement(LuWandSparkles),
  },
  {
    url: "/dashboard/payment-links",
    title: "paymentLinks",
    icon: React.createElement(TbReportSearch),
  },
  {
    url: "/dashboard/invoice",
    title: "invoices",
    icon: React.createElement(TbInvoice),
  },
  {
    url: "/dashboard/subscription",
    title: "mySubscriptions",
    icon: React.createElement(TbInvoice),
  },
  {
    url: "/dashboard/support",
    title: "supportTickets",
    icon: React.createElement(MessageCircleQuestion),
  },
  // {
  //   url: "/dashboard/notifications",
  //   title: "notifications",
  //   icon: React.createElement(Bell),
  // },
  {
    url: "/dashboard/settings",
    title: "settings",
    icon: React.createElement(IoSettingsOutline),
  },
];

// User as organization manager: same as owner but without User Management
const userOrgManagerNavItems: NavItem[] = userOrgOwnerNavItems.filter(
  (item) => item.title !== "userManagement",
);

/**
 * Get navigation items based on user role (and org owner/manager flags for role "user").
 * Organization owner (user + isOrganizationOwner) sees Invoices, Payment Links, Client Management, User Management.
 * Organization manager (user + isOrganizationManager) sees all except User Management.
 * @param role - User role (superadmin, subadmin, operator, viewer, user)
 * @param isOrganizationOwner - If true and role is "user", show financial/admin pages (sidebar)
 * @param isOrganizationManager - If true and role is "user", show financial/admin pages except User Management
 * @returns Array of navigation items for the role
 */
export const getNavigationItemsByRole = (
  role: string,
  isOrganizationOwner?: boolean,
  isOrganizationManager?: boolean,
): NavItem[] => {
  if (role === "user") {
    if (isOrganizationOwner === true) {
      return userOrgOwnerNavItems;
    }
    if (isOrganizationManager === true) {
      return userOrgManagerNavItems;
    }
  }
  switch (role) {
    case "superadmin":
      return superAdminNavItems;
    case "subadmin":
      return subAdminNavItems;
    case "operator":
      return operatorNavItems;
    case "viewer":
      return viewerNavItems;
    case "client":
      return clientNavItems;
    case "user":
    default:
      return userNavItems;
  }
};

/**
 * Check if user has access to a specific route (respects isOrganizationOwner for role "user").
 * @param role - User role
 * @param route - Route to check access for
 * @param isOrganizationOwner - If true and role is "user", allow financial/admin routes
 * @returns boolean indicating if user has access
 */
export const hasRouteAccess = (
  role: string,
  route: string,
  isOrganizationOwner?: boolean,
  isOrganizationManager?: boolean,
): boolean => {
  const navItems = getNavigationItemsByRole(
    role,
    isOrganizationOwner,
    isOrganizationManager,
  );
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
  userName: string,
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
