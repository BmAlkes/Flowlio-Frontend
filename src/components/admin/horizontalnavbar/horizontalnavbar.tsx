import { NotificationsDropdown } from "./notificationsdropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfile } from "../../common/userprofile";
import { ProjectSelector } from "./projectselector";
// import { FaqDropdown } from "./faqdropdown";
import { Box } from "@/components/ui/box";
import { SearchBox } from "./searchbox";
import { QuickActions } from "./quickactions";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user.provider";
import { CompactLanguageSwitcher } from "../../common/CompactLanguageSwitcher";

export const HorizontalNavbar = () => {
  const { pathname } = useLocation();
  const { data: user } = useUser();
  return (
    <Box
      className={cn(
        "pt-5 items-center grid max-md:grid-cols-[auto_auto_1fr_auto_auto_auto] grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2",
        pathname !== "/dashboard" && "gap-1",
        pathname === "/superadmin" && "gap-1",
        pathname === "/viewer" && "gap-1.5"
      )}
    >
      <SidebarTrigger className="min-md:hidden" />
      <UserProfile
        label={user?.user.name}
        avatarClassName="size-12"
        src={user?.user.image || "https://github.com/shadcn.png"}
        description={user?.user.email}
      />
      {(pathname === "/viewer" || pathname === "/dashboard") && (
        <>
          <ProjectSelector selectTriggerClassname="min-w-[12rem] justify-self-center max-md:min-w-full" />

          <SearchBox />
        </>
      )}

      {pathname === "/superadmin" && <SearchBox />}
      <CompactLanguageSwitcher />

      {/* Quick Actions - Show only on dashboard routes */}
      {(pathname === "/dashboard" || pathname.startsWith("/dashboard")) && (
        <QuickActions />
      )}

      <NotificationsDropdown className="max-lg:ml-auto" />
      {/* <FaqDropdown className="max-md:hidden" /> */}
    </Box>
  );
};
