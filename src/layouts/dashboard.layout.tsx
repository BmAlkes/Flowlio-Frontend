import { HorizontalNavbar } from "@/components/admin/horizontalnavbar/horizontalnavbar";
import { AppSidebar, type NavItem } from "@/components/admin/appsidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { CSSProperties } from "react";
import { Box } from "@/components/ui/box";
import { Outlet, useNavigate } from "react-router";
import { getNavigationItemsByRole } from "@/utils/role-based-navigation";
import { useUser } from "@/providers/user.provider";
import { useEffect, useState } from "react";
// import { SubscriptionGuard } from "@/components/common/subscriptionguard";

export const DashboardLayout = () => {
  const { data: userData, isLoading } = useUser();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while still loading user data
    if (isLoading) return;

    if (userData?.user) {
      const user = userData.user;

      // Redirect super admins and sub admins to super admin interface
      if (
        user.isSuperAdmin === true ||
        user.subadminId ||
        user.role === "subadmin"
      ) {
        navigate("/superadmin", { replace: true });
        return;
      }

      // Redirect viewers to viewer interface
      if (user.role === "viewer") {
        navigate("/viewer", { replace: true });
        return;
      }

      // For all other users (operators, regular users), stay in dashboard
      const userRole = user.role || "user";
      const roleBasedNavItems = getNavigationItemsByRole(userRole);
      setNavItems(roleBasedNavItems);
    }
  }, [userData, isLoading, navigate]);

  return (
    // <SubscriptionGuard>
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
    // </SubscriptionGuard>
  );
};
