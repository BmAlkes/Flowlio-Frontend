import {
  Sidebar,
  useSidebar,
  SidebarMenu,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarMenuSub,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarGroupContent,
  SidebarTrigger,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";
import { ComponentProps, FC, type ReactElement, useState } from "react";
import { ChevronRight, LogOut, Loader } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "../ui/button";
import { Center } from "../ui/center";
import { cn } from "@/lib/utils";
import { Box } from "../ui/box";
import { Logo } from "./logo";
import { useQueryClient } from "@tanstack/react-query";

interface NavItemBase {
  icon: ReactElement;
  title: string;
  url: string;
}

export interface NavItem extends NavItemBase {
  subItems?: NavItemBase[];
}

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  navItems: NavItem[];
}

import { cloneElement } from "react";
import { Flex } from "../ui/flex";
import { authClient } from "@/providers/user.provider";
import { toast } from "sonner";

const renderIcon = (icon: NavItem["icon"], className?: string) => {
  if (icon) {
    return cloneElement(icon, {
      className: cn("size-4", icon.props.className, className),
    });
  }
};

export const AppSidebar: FC<AppSidebarProps> = ({ navItems, ...props }) => {
  const is768 = useMediaQuery("(max-width: 768px)");
  const { state, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Clear React Query cache first
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["get-current-org-user-members"] });
      queryClient.removeQueries({ queryKey: ["get-all-user-members"] });
      queryClient.removeQueries({ queryKey: ["projects"] });
      queryClient.removeQueries({ queryKey: ["project"] });
      queryClient.removeQueries({ queryKey: ["organization-clients"] });
      queryClient.removeQueries({ queryKey: ["organization-users"] });
      queryClient.removeQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["sub-admins"] });

      // Clear all cached data
      queryClient.clear();

      // Clear any localStorage items (if any)
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-session");

      // Sign out from Better Auth (this handles server-side session cleanup)
      await authClient.signOut();

      // Navigate to sign-in page
      navigate("/auth/signin", { replace: true });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");

      // Force redirect even if logout fails
      navigate("/auth/signin", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar
      className="**:data-[sidebar=sidebar]:bg-slate-50 **:data-[sidebar=sidebar]:border-4 **:data-[sidebar=sidebar]:border-white"
      variant="floating"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="relative">
        <Logo
          to="/"
          isCompact={state === "collapsed" && !isMobile}
          className={state === "collapsed" ? "m-auto" : undefined}
          containerClassName={cn(
            "bg-[#F8FAFB] py-5 rounded-md",
            state === "collapsed" && !isMobile
              ? "py-2 inset-0 bg-transparent"
              : "justify-start! ml-2"
          )}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger
                className={`ml-auto -mr-6 cursor-pointer  ${
                  state === "collapsed" ? "rotate-180 -mt-12" : " -mt-16"
                }`}
              />
            </TooltipTrigger>
            <TooltipContent className="mb-2">
              <p>{state === "collapsed" ? "Open" : "Close"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent className="overflow-auto mt-10">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => {
                const normalizePath = (path: string) =>
                  path.replace(/\/+$/, "").split("?")[0];

                const currentPath = normalizePath(location.pathname);
                const itemPath = normalizePath(item.url);
                const isActive = itemPath === currentPath;

                const theSubPath = item.subItems?.map((subItem) => subItem.url);
                const isSubItemActive = theSubPath?.some(
                  (subPath) => normalizePath(subPath) === currentPath
                );

                // Check if current path includes the parent item's URL (for nested routes like dashboard/project/create-project)
                const isParentActive =
                  itemPath !== "/" &&
                  itemPath !== "/dashboard" &&
                  itemPath !== "/superadmin" &&
                  itemPath !== "/viewer" &&
                  currentPath.startsWith(itemPath);

                return (
                  <SidebarMenuItem key={item.title}>
                    {item.subItems ? (
                      <Collapsible className="group/collapsible">
                        <SidebarMenuButton
                          className={
                            isSubItemActive || isParentActive
                              ? "bg-gray-300/50"
                              : ""
                          }
                          tooltip={{
                            className: "p-0",
                            children: (
                              <Box>
                                {item.subItems && (
                                  <ul className="text-sm">
                                    {item.subItems.map((subItem, key) => {
                                      return (
                                        <Link to={subItem.url} key={key}>
                                          <li
                                            key={subItem.url}
                                            className={cn(
                                              `flex items-center gap-2 p-2 rounded-md hover:bg-white/10`
                                            )}
                                          >
                                            {renderIcon(subItem.icon, "invert")}
                                            {subItem.title}
                                          </li>
                                        </Link>
                                      );
                                    })}
                                  </ul>
                                )}
                              </Box>
                            ),
                          }}
                          asChild
                        >
                          <CollapsibleTrigger
                            asChild
                            className={
                              isActive || isParentActive ? "bg-[#1797B9]" : ""
                            }
                          >
                            <Link
                              className="min-w-full min-h-10 flex justify-between"
                              to={item.url}
                            >
                              <Center className="gap-2">
                                {renderIcon(
                                  item.icon,
                                  `${
                                    state === "collapsed" ? "ml-1" : undefined
                                  } `
                                )}
                                <span
                                  className={
                                    state === "collapsed" && !is768
                                      ? "hidden"
                                      : is768
                                      ? "block"
                                      : undefined
                                  }
                                >
                                  {item.title}
                                </span>
                              </Center>
                              {(state === "expanded" || is768) && (
                                <ChevronRight className="ml-1 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 " />
                              )}
                            </Link>
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                        <CollapsibleContent
                          className={
                            isSubItemActive || isParentActive
                              ? "bg-gray-300/50 rounded-sm mt-1"
                              : ""
                          }
                        >
                          <SidebarMenuSub className="border-none pr-0">
                            {item.subItems.map((subItem, index) => {
                              const isSubItemActive =
                                normalizePath(subItem.url) === currentPath;
                              const isLastItem =
                                index === item.subItems!.length - 1;

                              return (
                                <SidebarMenuSubItem
                                  key={subItem.title}
                                  className={cn(
                                    "relative flex items-center gap-2 p-2",
                                    isSubItemActive
                                      ? "text-black rounded-md"
                                      : "text-gray-400"
                                  )}
                                >
                                  {/* Left-side indicator */}
                                  <Box
                                    className={cn(
                                      "absolute -left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black",
                                      isSubItemActive
                                        ? "bg-black w-2 h-2"
                                        : "border border-gray-400 bg-white"
                                    )}
                                  >
                                    {/* Vertical Line */}
                                    <Box
                                      className={cn(
                                        isLastItem
                                          ? "hidden"
                                          : "absolute left-1/2 top-full w-[1px] h-9 -translate-x-1/2",
                                        isSubItemActive
                                          ? "bg-gray-500"
                                          : "bg-gray-400"
                                      )}
                                    />
                                  </Box>

                                  <Link
                                    to={subItem.url}
                                    className="flex items-center gap-2 text-[13px]"
                                  >
                                    {renderIcon(subItem.icon)}
                                    <span
                                      className={cn(
                                        state === "collapsed" && !is768
                                          ? "hidden"
                                          : is768
                                          ? "block"
                                          : undefined
                                      )}
                                    >
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        className={
                          isActive || isParentActive
                            ? "bg-[#1797B9] text-white fill-white hover:bg-[#1797B9]/70 hover:text-white rounded-full gap-4"
                            : "gap-4"
                        }
                        tooltip={{
                          children: (
                            <span className="capitalize text-[14px]">
                              {item.title}
                            </span>
                          ),
                        }}
                        asChild
                      >
                        <Link className="min-w-full min-h-10" to={item.url}>
                          {renderIcon(
                            item.icon,
                            `${
                              index === 0 && state === "collapsed"
                                ? ""
                                : "transform rotate-360"
                            } ${
                              state === "collapsed" && !is768
                                ? "m-auto"
                                : "ml-2"
                            } ${
                              index === 0 && state !== "collapsed"
                                ? "transform rotate-180"
                                : ""
                            }`
                          )}

                          <span
                            className={
                              state === "collapsed" && !is768
                                ? "hidden"
                                : is768
                                ? "block"
                                : undefined
                            }
                          >
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          className="bg-transparent text-black hover:bg-red-50 cursor-pointer border-none flex items-start justify-start gap-2 shadow-none"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          {state === "collapsed" && <LogOut className="size-4" />}
          <Flex className="gap-2">
            <span
              className={`${
                state === "collapsed" ? "hidden" : undefined
              } text-red-400`}
            >
              {isLoggingOut ? (
                <Center>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </Center>
              ) : (
                <Flex className="items-center gap-2">
                  <LogOut
                    color="red"
                    className={
                      state === "collapsed" ? "m-auto size-4" : "size-4"
                    }
                  />
                  <span className="text-sm">Logout</span>
                </Flex>
              )}
            </span>
          </Flex>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
