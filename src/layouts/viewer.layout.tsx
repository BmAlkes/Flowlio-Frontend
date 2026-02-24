import { useEffect } from "react";
import { useNavigate } from "react-router";
import { HorizontalNavbar } from "@/components/admin/horizontalnavbar/horizontalnavbar";
import { AppSidebar, type NavItem } from "@/components/admin/appsidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { CSSProperties } from "react";
import { Box } from "@/components/ui/box";
import { Outlet } from "react-router";
import {
  MessageCircleQuestion,
  SquareKanban,
  Bot,
  Calendar,
  Clock,
  // Bell,
} from "lucide-react";
import { GroupIcon, TaskManagementIcon } from "@/components/customeIcons";
import { IoSettingsOutline } from "react-icons/io5";
import { useUser } from "@/providers/user.provider";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/viewer",
    icon: <SquareKanban />,
  },
  {
    url: "/viewer/my-projects",
    title: "Projects",
    icon: <GroupIcon />,
  },
  {
    url: "/viewer/my-tasks",
    title: "My Tasks",
    icon: <TaskManagementIcon />,
  },
  {
    url: "/viewer/calendar",
    title: "Calendar",
    icon: <Calendar />,
  },
  {
    url: "/viewer/time-tracking",
    title: "Time Tracking",
    icon: <Clock />,
  },
  {
    url: "/viewer/ai-assistant",
    title: "AI Assistant",
    icon: <Bot />,
  },
  {
    url: "/viewer/viewer-support",
    title: "Support",
    icon: <MessageCircleQuestion />,
  },
  // {
  //   url: "/viewer/notifications",
  //   title: "Notifications",
  //   icon: <Bell />,
  // },
  {
    url: "/viewer/viewer-settings",
    title: "Settings",
    icon: <IoSettingsOutline />,
  },
];

document.title = "Viewer - Flowlio";

export const ViewerLayout = () => {
  const { data: userData, isLoading } = useUser();
  const navigate = useNavigate();

  // If user was promoted (role no longer viewer), send them to dashboard
  useEffect(() => {
    if (isLoading || !userData?.user) return;
    if (userData.user.role !== "viewer") {
      navigate("/dashboard", { replace: true });
    }
  }, [userData?.user?.role, isLoading, navigate]);

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
        <AppSidebar navItems={navItems} />
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
