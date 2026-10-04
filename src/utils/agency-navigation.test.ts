import { describe, expect, it } from "vitest";
import { getNavigationItemsByRole, hasRouteAccess } from "./role-based-navigation";
import { activeNavigationUrl } from "./agency-navigation";

describe("agency navigation", () => {
  it("groups the owner's work into five primary areas without duplicate destinations", () => {
    const items = getNavigationItemsByRole("user", true);
    expect(items.filter(item => !item.section).map(item => item.title)).toEqual(["agencyHome", "agencyClients", "agencyWork", "agencyFinance", "agencyTeam"]);
    const urls = items.flatMap(item => item.subItems ?? [item]).map(item => item.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const route of ["project", "task-management", "client-management", "leads", "calender", "time-tracking", "attention", "team-capacity", "user-management", "invoice", "revenue", "reports", "payment-links", "proposals", "ai-assist", "comments", "client-management/media-center", "inbox", "support", "settings", "settings/operations", "settings/audit", "settings/automations", "settings/integrations", "subscription"]) {
      expect(hasRouteAccess("user", `/dashboard/${route}`, true)).toBe(true);
    }
  });
  it("preserves manager restrictions and does not grant employee or client access", () => {
    expect(hasRouteAccess("user", "/dashboard/user-management", false, true)).toBe(false);
    expect(hasRouteAccess("user", "/dashboard/team-capacity", false, true)).toBe(true);
    for (const role of ["user", "viewer", "client"]) {
      expect(getNavigationItemsByRole(role).some(item => item.title === "agencyFinance")).toBe(false);
      expect(hasRouteAccess(role, "/dashboard/revenue")).toBe(false);
    }
    expect(getNavigationItemsByRole("client", true, true).some(item => item.title === "agencyHome")).toBe(false);
  });
  it("highlights exactly the deepest matching destination on nested and direct links", () => {
    const items = getNavigationItemsByRole("user", true);
    expect(activeNavigationUrl(items, "/dashboard/client-management/media-center/123")).toBe("/dashboard/client-management/media-center");
    expect(activeNavigationUrl(items, "/dashboard/project/view/p1/profitability")).toBe("/dashboard/project");
    expect(activeNavigationUrl(items, "/dashboard/settings/operations/")).toBe("/dashboard/settings/operations");
    expect(activeNavigationUrl(items, "/dashboard/unknown")).toBeUndefined();
    expect(activeNavigationUrl(items, "/dashboard")).toBe("/dashboard");
  });
});
