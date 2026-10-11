import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, expect, it, vi } from "vitest";
import { ProtectedRoute, OrgOwnerOnlyRoute, AdminManagerOrOrgOwnerRoute } from "./ProtectedRoute";
const state = vi.hoisted(() => ({ user: { role: "user", isOrganizationOwner: false, isOrganizationManager: false } as {role?: string; isOrganizationOwner: boolean; isOrganizationManager: boolean} }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: state.user }, isLoading: false }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("./demopasswordguard", () => ({ DemoPasswordGuard: ({children}: {children: React.ReactNode}) => children }));
beforeEach(() => { state.user = {role: "user", isOrganizationOwner: false, isOrganizationManager: false}; });
function setup(kind: "staff" | "owner" | "commercial") {
  const Guard = kind === "owner" ? OrgOwnerOnlyRoute : kind === "commercial" ? AdminManagerOrOrgOwnerRoute : ProtectedRoute;
  render(<MemoryRouter initialEntries={["/restricted"]}><Routes>
    <Route path="/restricted" element={<Guard requiredRole="user"><p>Restricted content</p></Guard>} />
    <Route path="*" element={<p>Safe destination</p>} />
  </Routes></MemoryRouter>);
}
it.each([undefined, "unknown", "client", "viewer", "toString"])("does not mount staff content for %s", role => {
  state.user.role = role; setup("staff");
  expect(screen.queryByText("Restricted content")).not.toBeInTheDocument();
  expect(screen.getByText("Safe destination")).toBeInTheDocument();
});
it.each(["user", "operator", "subadmin", "superadmin"])("allows staff entry for %s", role => {
  state.user.role = role; setup("staff");
  expect(screen.getByText("Restricted content")).toBeInTheDocument();
});
it("keeps managers out of team administration", () => {
  state.user.isOrganizationManager = true; setup("owner");
  expect(screen.queryByText("Restricted content")).not.toBeInTheDocument();
});
it("keeps commercial work available for managers", () => {
  state.user.isOrganizationManager = true; setup("commercial");
  expect(screen.getByText("Restricted content")).toBeInTheDocument();
});
it("allows an owner to administer members", () => {
  state.user.isOrganizationOwner = true; setup("owner");
  expect(screen.getByText("Restricted content")).toBeInTheDocument();
});
