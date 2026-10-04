import { cloneElement, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NavItem } from "./appsidebar";
import { activeNavigationUrl } from "@/utils/agency-navigation";
import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const icon = (item: NavItem) => cloneElement(item.icon, { className: "size-4 shrink-0", "aria-hidden": true });

function NavigationGroup({ item, activeUrl }: { item: NavItem; activeUrl?: string }) {
  const { t } = useTranslation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const active = item.subItems?.some(child => child.url === activeUrl) ?? false;
  const [open, setOpen] = useState(active);
  useEffect(() => { if (active) setOpen(true); }, [active, activeUrl]);
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };
  const label = t(`appSidebar.${item.title}`);

  if (state === "collapsed" && !isMobile) return <SidebarMenuItem>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><SidebarMenuButton tooltip={label} aria-label={label} isActive={active} className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground">{icon(item)}<span>{label}</span></SidebarMenuButton></DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        {item.subItems?.map(child => <DropdownMenuItem key={child.url} asChild><Link to={child.url} aria-current={child.url === activeUrl ? "page" : undefined}>{icon(child)}{t(`appSidebar.${child.title}`)}</Link></DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  </SidebarMenuItem>;

  return <Collapsible asChild open={open} onOpenChange={setOpen}>
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground">
        <Link to={item.url} onClick={closeMobile}>{icon(item)}<span>{label}</span></Link>
      </SidebarMenuButton>
      <CollapsibleTrigger asChild>
        <SidebarMenuAction className={cn(active && "text-sidebar-primary-foreground hover:text-sidebar-primary-foreground")} aria-label={t(open ? "appSidebar.collapseGroup" : "appSidebar.expandGroup", { group: label })}>
          <ChevronDown className={cn("transition-transform", !open && "-rotate-90 rtl:rotate-90")} />
        </SidebarMenuAction>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.subItems?.map(child => <SidebarMenuSubItem key={child.url}>
            <SidebarMenuSubButton asChild isActive={child.url === activeUrl} className="data-[active=true]:bg-brand-soft data-[active=true]:text-brand-ink data-[active=true]:font-semibold">
              <Link to={child.url} onClick={closeMobile} aria-current={child.url === activeUrl ? "page" : undefined}>{icon(child)}<span>{t(`appSidebar.${child.title}`)}</span></Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>)}
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>;
}

export function SidebarNavigation({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { isMobile, setOpenMobile } = useSidebar();
  const activeUrl = activeNavigationUrl(items, pathname);
  return <SidebarMenu>
    {items.map((item, index) => <SidebarMenuItem key={item.title} className={item.section === "secondary" && items[index - 1]?.section !== "secondary" ? "mt-4 border-t border-sidebar-border pt-3" : undefined}>
      {item.subItems ? <SidebarMenu className="gap-0"><NavigationGroup item={item} activeUrl={activeUrl} /></SidebarMenu> :
        <SidebarMenuButton asChild tooltip={t(`appSidebar.${item.title}`)} isActive={item.url === activeUrl}>
          <Link to={item.url} aria-current={item.url === activeUrl ? "page" : undefined} onClick={() => { if (isMobile) setOpenMobile(false); }}>{icon(item)}<span>{t(`appSidebar.${item.title}`)}</span></Link>
        </SidebarMenuButton>}
    </SidebarMenuItem>)}
  </SidebarMenu>;
}
