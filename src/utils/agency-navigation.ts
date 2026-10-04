import type { NavItem } from "@/components/admin/appsidebar";

/** Regroup only destinations the existing role policy already allows. */
export function groupAgencyNavigation(items: NavItem[]): NavItem[] {
  const destinations = items.flatMap(item => item.subItems ?? [item]);
  const byTitle = new Map(destinations.map(item => [item.title, item]));
  const used = new Set<string>();
  const groups = [
    ["agencyHome", ["dashboard", "attention"]],
    ["agencyClients", ["clientManagement", "leads", "proposals"]],
    ["agencyWork", ["projects", "tasksManagement", "calendar", "timeTracking", "mediaCenter", "comments", "aiAssistance"]],
    ["agencyFinance", ["invoices", "revenue", "reports", "paymentLinks"]],
    ["agencyTeam", ["teamCapacity", "userManagement"]],
  ] as const;
  const grouped: NavItem[] = [];
  for (const [title, names] of groups) {
    const subItems = names.flatMap(name => {
      const item = byTitle.get(name);
      if (!item) return [];
      used.add(item.url);
      const shortTitle = name === "tasksManagement" ? "agencyTasks" : name === "timeTracking" ? "agencyHours" : item.title;
      return [{ ...item, title: shortTitle }];
    });
    if (subItems.length) grouped.push({ title, url: subItems[0].url, icon: subItems[0].icon, subItems });
  }
  // Keep settings as a group and retain any future destinations automatically.
  for (const item of items) {
    const remaining = (item.subItems ?? [item]).filter(child => !used.has(child.url));
    if (!remaining.length) continue;
    grouped.push(item.subItems ? { ...item, subItems: remaining, section: "secondary" } : { ...item, section: "secondary" });
  }
  return grouped;
}

/** The deepest matching destination owns the highlight, including nested pages. */
export function activeNavigationUrl(items: NavItem[], pathname: string): string | undefined {
  const path = pathname.replace(/\/+$/, "") || "/";
  const roots = new Set(["/", "/dashboard", "/viewer", "/clients", "/superadmin"]);
  return items.flatMap(item => item.subItems ?? [item])
    .map(item => item.url.replace(/\/+$/, "") || "/")
    .filter(url => path === url || (!roots.has(url) && path.startsWith(`${url}/`)))
    .sort((a, b) => b.length - a.length)[0];
}
