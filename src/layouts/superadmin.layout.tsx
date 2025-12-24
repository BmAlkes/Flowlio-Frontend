import { HorizontalNavbar } from "@/components/admin/horizontalnavbar/horizontalnavbar";
import { AppSidebar, type NavItem } from "@/components/admin/appsidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { CSSProperties } from "react";
import { Box } from "@/components/ui/box";
import { Outlet } from "react-router";
import {
  BadgeCent,
  Building,
  MessageCircleQuestion,
  Settings,
  SquareKanban,
  User,
  Users,
  FlaskConical,
  Bell,
  Mail,
} from "lucide-react";
import { useUser } from "@/providers/user.provider";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/superadmin",
    icon: <SquareKanban />,
  },
  {
    title: "Companies",
    url: "/superadmin/companies",
    icon: <Building />,
  },
  {
    title: "Sub Admin",
    url: "/superadmin/sub-admin",
    icon: <User />,
  },
  {
    title: "Users",
    url: "/superadmin/users",
    icon: <Users />,
  },
  {
    title: "Subscriptions",
    url: "/superadmin/subscriptions",
    icon: <BadgeCent />,
  },
  {
    title: "Newsletter",
    url: "/superadmin/newsletter",
    icon: <Mail />,
  },
  {
    title: "Demo Accounts",
    url: "/superadmin/demo-accounts",
    icon: <FlaskConical />,
  },
  {
    title: "Support Tickets",
    url: "/superadmin/support-tickets",
    icon: <MessageCircleQuestion />,
  },
  {
    title: "Notifications",
    url: "/superadmin/notifications",
    icon: <Bell />,
  },
  {
    title: "Settings",
    url: "/superadmin/settings",
    icon: <Settings />,
  },
];

export const SuperAdminLayout = () => {
  const { data: userData } = useUser();

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (userData?.user.subadminId) {
      const restrictedSections = [
        "/superadmin",
        "/superadmin/companies",
        "/superadmin/subscriptions",
        "/superadmin/support-tickets",
        "/superadmin/notifications",
        "/superadmin/settings",
      ];

      return restrictedSections.includes(item.url);
    }
    return true;
  });

  document.title = "Super Admin - Flowlio";

  return (
    <Box className="bg-gradient-to-l from-indigo-50 via-slate-50 to-indigo-50 border-[2px] rounded-none border-white p-1 min-h-screen">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "14.6rem",
            "--sidebar-width-icon": "4rem",
          } as CSSProperties
        }
      >
        <AppSidebar navItems={filteredNavItems} />
        <SidebarInset className="bg-transparent overflow-auto">
          <HorizontalNavbar />
          <Box className="pb-2">
            <Outlet />
          </Box>
        </SidebarInset>
      </SidebarProvider>
    </Box>
  );
};
