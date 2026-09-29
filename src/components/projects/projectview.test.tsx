import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import { ProjectView } from "./projectview";

const state = vi.hoisted(() => ({
  user: {role: "user", isOrganizationOwner: true, isOrganizationManager: false},
  projectStatus: "pending", membersLoading: false, members: vi.fn(), createComment: vi.fn(), success: vi.fn(),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: state.user } }) }));
vi.mock("@/hooks/usefetchprojects", () => ({ useFetchProjectById: () => ({ data: { data: { id: "project-1", projectName: "Client portal", status: state.projectStatus, progress: 0, assignedProject: "Assigned colleague", createdAt: "2026-09-21", updatedAt: "2026-09-21" } } }) }));
vi.mock("@/hooks/usecustomfields", () => ({ useFetchCustomFields: () => ({}) }));
vi.mock("@/hooks/usefetchorganizationusers", () => ({ useFetchOrganizationUsers: (options: {enabled: boolean}) => {state.members(options); return {isLoading: state.membersLoading};} }));
vi.mock("@/hooks/usefetchprojectcomments", () => ({ useFetchProjectComments: () => ({}) }));
vi.mock("@/hooks/usecreateprojectcomment", () => ({ useCreateProjectComment: () => ({ mutate: state.createComment }) }));
vi.mock("sonner", () => ({toast: {success: state.success, error: vi.fn()}}));
vi.mock("@/hooks/useupdateproject", () => ({ useUpdateProject: () => ({ mutate: vi.fn() }) }));
vi.mock("@/hooks/useuploadfileversion", () => ({ useUploadFileVersion: () => ({}) }));
vi.mock("@/hooks/useProjectTemplates", () => ({ useSaveProjectAsTemplate: () => ({ mutate: vi.fn() }) }));
vi.mock("./ProjectExpenses", () => ({ ProjectExpenses: () => <section>Expenses</section> }));
vi.mock("./DeliveryReviews", () => ({ DeliveryReviews: () => <section id="delivery-reviews">Delivery reviews</section> }));
vi.mock("@/components/common/CommentThread", () => ({ CommentThread: () => null }));
vi.mock("../common/fileversionhistorymodal", () => ({ FileVersionHistoryModal: () => null }));

beforeEach(() => {vi.clearAllMocks(); state.user = {role: "user", isOrganizationOwner: true, isOrganizationManager: false}; state.projectStatus = "pending"; state.membersLoading = false;});
function setup(path = "/dashboard/project/view/project-1") {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/dashboard/project/view/:id" element={<ProjectView />} />
    <Route path="/clients/projects/view/:id" element={<ProjectView />} />
    <Route path="/clients/projects" element={<p>Client project list</p>} />
  </Routes></MemoryRouter>);
  return userEvent.setup();
}
it("opens the project details with its real profitability navigation button", () => {
  setup();
  expect(screen.getByRole("link", { name: "profitability.title" })).toHaveAttribute("href", "/dashboard/project/view/project-1/profitability");
  expect(screen.getByText("Expenses")).toBeInTheDocument();
});
it("shows project details and review actions while optional member details load", () => {
  state.membersLoading = true;
  setup();
  expect(screen.getByRole("heading", {name: "Client portal"})).toBeInTheDocument();
  expect(screen.getByText("Delivery reviews")).toBeInTheDocument();
  expect(screen.getByText("Assigned colleague")).toBeInTheDocument();
  expect(state.members).toHaveBeenCalledWith({enabled: true});
});
it.each(["client", "manager"])("does not fetch owner-only members for a %s", role => {
  state.user = {role: role === "client" ? "client" : "user", isOrganizationOwner: false, isOrganizationManager: role === "manager"};
  state.membersLoading = true;
  setup(role === "client" ? "/clients/projects/view/project-1" : undefined);
  expect(state.members).toHaveBeenCalledWith({enabled: false});
  expect(screen.getByText("Delivery reviews")).toBeInTheDocument();
});
it("takes a client to real delivery reviews without fabricating an approval", async () => {
  state.user = {role: "client", isOrganizationOwner: false, isOrganizationManager: false};
  state.projectStatus = "completed";
  const user = setup("/clients/projects/view/project-1");
  const reviewLink = screen.getByRole("link", {name: "delivery.openReviews"});
  expect(reviewLink).toHaveAttribute("href", "#delivery-reviews");
  expect(screen.queryByRole("button", {name: "projectView.approve"})).not.toBeInTheDocument();
  await user.click(reviewLink);
  expect(state.createComment).not.toHaveBeenCalled();
  expect(state.success).not.toHaveBeenCalled();
});
it("keeps the client's project breadcrumb inside the portal", async () => {
  state.user = {role: "client", isOrganizationOwner: false, isOrganizationManager: false};
  const user = setup("/clients/projects/view/project-1");
  await user.click(screen.getByRole("button", {name: "appSidebar.projects"}));
  expect(screen.getByText("Client project list")).toBeInTheDocument();
});
