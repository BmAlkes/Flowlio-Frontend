import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "@/configs/i18n.config";
import { TaskManagementHeader } from "./taskmanagementheader";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org-a" }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { id: "owner", role: "admin" } } }) }));
vi.mock("./taskdetailsmodal", () => ({ TaskDetailsModal: ({ task }: { task: { title: string } }) => <div role="dialog">{task.title}</div> }));
vi.mock("@/hooks/usefetchprojects", () => ({
  useFetchProjects: () => ({ isLoading: false, data: { data: [{ id: "p1", projectName: "Site Studio" }, { id: "p2", projectName: "Landing" }] } }),
}));
vi.mock("@/hooks/usefetchorganizationusers", () => ({
  useFetchOrganizationUsers: () => ({ data: { data: { userMembers: [{ id: "u1", firstname: "Ana Lima", lastname: "", user: { id: "u1", name: "Ana Lima" } }] } } }),
}));
vi.mock("@/hooks/usecustomfields", () => ({ useFetchCustomFields: () => ({ data: { data: [] } }) }));

const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const task = (extra: Record<string, unknown>) => ({ projectId: "p1", projectName: "Site Studio", creatorId: "c", creatorName: "C", creatorEmail: "c@x.com", createdAt: inDays(-30), updatedAt: inDays(-1), ...extra });
const tasks = [
  task({ id: "late", title: "Check calendar", status: "delay", endDate: inDays(-8), assigneeId: "u1" }),
  task({ id: "soon", title: "Wireframe home", status: "todo", endDate: inDays(3), projectId: "p2", projectName: "Landing" }),
  task({ id: "sub", title: "Pick colors", status: "completed", endDate: inDays(-2), parentId: "soon" }),
  task({ id: "done", title: "Project planning", status: "completed", endDate: inDays(-20) }),
];

afterEach(cleanup);
beforeEach(() => {
  void i18n.changeLanguage("en");
  vi.clearAllMocks();
  api.get.mockImplementation(async (url: string) => (url === "/tasks/all" ? { data: { success: true, data: tasks } } : { data: { success: true, data: [] } }));
  api.patch.mockResolvedValue({ data: { success: true } });
});

function setup(path = "/dashboard/task-management") {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={cache}><MemoryRouter initialEntries={[path]}><TaskManagementHeader /></MemoryRouter></QueryClientProvider>);
  return userEvent.setup();
}

it("counts open, overdue, this-week and completed tasks across all projects", async () => {
  setup();
  const stats = await screen.findByRole("region", { name: "Task summary" });
  await waitFor(() => expect(within(stats).getByRole("button", { name: /Open/ })).toHaveTextContent("2in 2 projects"));
  expect(within(stats).getByRole("button", { name: /Overdue/ })).toHaveTextContent("1");
  expect(within(stats).getByRole("button", { name: /Due this week/ })).toHaveTextContent("1");
  expect(within(stats).getByRole("button", { name: /Completed/ })).toHaveTextContent("2");
});

it("marks only open tasks past their date as late, folds Completed and shows subtask progress", async () => {
  setup();
  expect(await screen.findByText(/8 days late/)).toBeInTheDocument();
  expect(screen.queryByText("Project planning")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Show Complete" })).toHaveTextContent("2");
  expect(screen.getByTitle("Subtasks")).toHaveTextContent("1/1");
});

it("filters the board from a summary card and clears it on a second click", async () => {
  const user = setup();
  const overdue = await screen.findByRole("button", { name: /Overdue/ });
  await screen.findByText("Wireframe home");
  await user.click(overdue);
  expect(overdue).toHaveAttribute("aria-pressed", "true");
  expect(screen.queryByText("Wireframe home")).not.toBeInTheDocument();
  expect(screen.getByText("Check calendar")).toBeInTheDocument();
  await user.click(overdue);
  expect(await screen.findByText("Wireframe home")).toBeInTheDocument();
});

it("lists tasks grouped by status and changes a status from the list", async () => {
  const user = setup("/dashboard/task-management?view=list");
  const delay = await screen.findByRole("region", { name: "Delay" });
  expect(within(delay).getByText("1 task")).toBeInTheDocument();
  expect(within(delay).getByText("Check calendar")).toBeInTheDocument();
  await user.click(within(delay).getByRole("button", { name: "Change status of Check calendar" }));
  await user.click(await screen.findByRole("menuitem", { name: "In Progress" }));
  await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/tasks/status/late", { status: "in_progress" }));
});
