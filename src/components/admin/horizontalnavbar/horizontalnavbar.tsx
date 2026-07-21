import { NotificationsDropdown } from "./notificationsdropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfile } from "../../common/userprofile";
import { ProjectSelector } from "./projectselector";
// import { FaqDropdown } from "./faqdropdown";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { SearchBox } from "./searchbox";
import { CommandPaletteTrigger } from "./commandpalettetrigger";
import { QuickActions } from "./quickactions";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user.provider";
import { CompactLanguageSwitcher } from "../../common/CompactLanguageSwitcher";

import { ModeToggle } from "@/components/mode-toggle";

// Flexbox on purpose, not CSS grid: the set of items rendered here changes
// per route (project selector only on some pages, quick actions only on
// dashboard, etc), and a grid with a fixed grid-template-columns track count
// silently breaks (huge implicit-row heights, misaligned items) whenever the
// number of actual children doesn't match the number of declared tracks.
// Flexbox with flex-wrap degrades gracefully regardless of child count.
export const HorizontalNavbar = () => {
  const { pathname } = useLocation();
  const { data: user } = useUser();
  return (
    <Box
      className={cn(
        "pt-5 px-4 flex flex-wrap items-center gap-3",
        pathname !== "/dashboard" && "gap-2",
        pathname === "/superadmin" && "gap-2",
        pathname === "/viewer" && "gap-2.5"
      )}
    >
      <Flex className="items-center gap-3 shrink-0">
        <SidebarTrigger className="min-md:hidden" />
        <UserProfile
          label={user?.user.name}
          avatarClassName="size-12"
          src={user?.user.image || "https://github.com/shadcn.png"}
          description={user?.user.email}
          position={user?.user.position || undefined}
        />
      </Flex>

      <Flex className="items-center gap-3 flex-wrap flex-1 min-w-0 max-md:order-3 max-md:basis-full">
        {(pathname === "/viewer" || pathname === "/dashboard") && (
          <>
            <ProjectSelector selectTriggerClassname="min-w-[12rem] justify-self-center max-md:min-w-full" />
            {pathname === "/viewer" ? <SearchBox /> : <CommandPaletteTrigger />}
          </>
        )}

        {pathname.startsWith("/dashboard") && pathname !== "/dashboard" && (
          <CommandPaletteTrigger />
        )}

        {pathname === "/superadmin" && <SearchBox />}
      </Flex>

      <Flex className="items-center gap-2 ms-auto shrink-0 flex-wrap justify-end">
        <CompactLanguageSwitcher />

        {/* Quick Actions - Show only on dashboard routes */}
        {(pathname === "/dashboard" || pathname.startsWith("/dashboard")) && (
          <QuickActions />
        )}

        <ModeToggle />
        <NotificationsDropdown />
        {/* <FaqDropdown className="max-md:hidden" /> */}
      </Flex>
    </Box>
  );
};
