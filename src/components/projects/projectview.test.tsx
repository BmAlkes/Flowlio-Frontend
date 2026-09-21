import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import { ProjectView } from "./projectview";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { role: "user", isOrganizationOwner: true } } }) }));
vi.mock("@/hooks/usefetchprojects", () => ({ useFetchProjectById: () => ({ data: { data: { id: "project-1", projectName: "Client portal", status: "pending", progress: 0, createdAt: "2026-09-21", updatedAt: "2026-09-21" } } }) }));
vi.mock("@/hooks/usecustomfields", () => ({ useFetchCustomFields: () => ({}) }));
vi.mock("@/hooks/usefetchorganizationusers", () => ({ useFetchOrganizationUsers: () => ({}) }));
vi.mock("@/hooks/usefetchprojectcomments", () => ({ useFetchProjectComments: () => ({}) }));
vi.mock("@/hooks/usecreateprojectcomment", () => ({ useCreateProjectComment: () => ({ mutate: vi.fn() }) }));
vi.mock("@/hooks/useupdateproject", () => ({ useUpdateProject: () => ({ mutate: vi.fn() }) }));
vi.mock("@/hooks/useuploadfileversion", () => ({ useUploadFileVersion: () => ({}) }));
vi.mock("@/hooks/useProjectTemplates", () => ({ useSaveProjectAsTemplate: () => ({ mutate: vi.fn() }) }));
vi.mock("./ProjectExpenses", () => ({ ProjectExpenses: () => <section>Expenses</section> }));
vi.mock("./DeliveryReviews", () => ({ DeliveryReviews: () => <section>Delivery reviews</section> }));
vi.mock("@/components/common/CommentThread", () => ({ CommentThread: () => null }));
vi.mock("../common/fileversionhistorymodal", () => ({ FileVersionHistoryModal: () => null }));

it("opens the project details with its real profitability navigation button", () => {
  render(<MemoryRouter initialEntries={["/dashboard/project/view/project-1"]}><Routes><Route path="/dashboard/project/view/:id" element={<ProjectView />} /></Routes></MemoryRouter>);
  expect(screen.getByRole("link", { name: "profitability.title" })).toHaveAttribute("href", "/dashboard/project/view/project-1/profitability");
  expect(screen.getByText("Expenses")).toBeInTheDocument();
});
