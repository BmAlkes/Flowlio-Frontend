import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { getNavigationItemsByRole } from "@/utils/role-based-navigation";
import { OperationsSettingsLink } from "./OperationsSettingsLink";

const session = vi.hoisted(() => ({ user: {} as Record<string, unknown> }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: session }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(cleanup);

describe("operational history navigation", () => {
  it.each([[true, false], [false, true]])("adds the owner's or manager's Settings submenu (%s, %s)", (owner, manager) => {
    const settings = getNavigationItemsByRole("user", owner, manager).find(item => item.title === "settings");
    expect(settings?.subItems?.find(item => item.title === "operationalHistory")?.url).toBe("/dashboard/settings/operations");
  });

  it.each(["user", "operator", "viewer", "client"])("does not offer restricted history to %s", role => {
    session.user = { role };
    const items = getNavigationItemsByRole(role).flatMap(item => [item, ...(item.subItems ?? [])]);
    expect(items.some(item => item.url.endsWith("/operations"))).toBe(false);
    render(<MemoryRouter><OperationsSettingsLink /></MemoryRouter>);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it.each([
    [{ role: "user", isOrganizationOwner: true }, false, "/dashboard/settings/operations"],
    [{ role: "user", isOrganizationManager: true }, false, "/dashboard/settings/operations"],
    [{ role: "subadmin" }, false, "/dashboard/settings/operations"],
    [{ role: "superadmin" }, true, "/superadmin/operations"],
  ])("navigates from settings for %j", async (account, global, path) => {
    session.user = account;
    const submit = vi.fn();
    render(<MemoryRouter initialEntries={["/settings"]}><Routes>
      <Route path="/settings" element={<form onSubmit={submit}><OperationsSettingsLink global={global} /></form>} />
      <Route path={path} element={<h1>History page</h1>} />
    </Routes></MemoryRouter>);
    await userEvent.setup().click(screen.getByRole("link", { name: /operations.title/ }));
    expect(screen.getByRole("heading", { name: "History page" })).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
  });

  it("does not expose global history to subadmins", () => {
    session.user = { role: "subadmin" };
    render(<MemoryRouter><OperationsSettingsLink global /></MemoryRouter>);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
