import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import WhiteboardsPage from "./whiteboards.page";

const state = vi.hoisted(() => ({
  role: "user",
  boards: [] as unknown[],
  filter: undefined as string | null | undefined,
  navigate: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("react-router", async importOriginal => ({ ...(await importOriginal<typeof import("react-router")>()), useNavigate: () => state.navigate }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt" } }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { role: state.role } } }) }));
vi.mock("@/hooks/usefetchprojects", () => ({ useFetchProjects: () => ({ data: { data: [{ id: "p1", projectName: "Site Padaria" }] } }) }));
vi.mock("@/features/whiteboards/api", () => ({
  useWhiteboards: (projectId: string | null) => { state.filter = projectId; return { data: state.boards, isLoading: false, isError: false }; },
  useCreateWhiteboard: () => ({ mutateAsync: state.create, isPending: false }),
  useDeleteWhiteboard: () => ({ mutateAsync: state.remove, isPending: false }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.role = "user";
  state.boards = [{ id: "w1", title: "Ideias", projectId: "p1", projectName: "Site Padaria", updatedAt: "2026-11-24T10:00:00Z", updatedByName: "Ana", elementCount: 3, canDelete: true }];
  state.create.mockResolvedValue({ id: "w2" });
});
afterEach(cleanup);

it("creates a board linked to the project it was opened from and opens it", async () => {
  render(<MemoryRouter initialEntries={["/dashboard/whiteboards?projectId=p1"]}><WhiteboardsPage /></MemoryRouter>);
  expect(state.filter).toBe("p1");
  expect(screen.getByRole("link", { name: /Ideias/ })).toHaveAttribute("href", "/dashboard/whiteboards/w1");
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "whiteboards.new" }));
  await user.type(screen.getByRole("textbox", { name: "whiteboards.titleLabel" }), "Fluxo do site");
  expect(screen.getByRole("combobox", { name: "whiteboards.project" })).toHaveValue("p1");
  await user.click(screen.getByRole("button", { name: "whiteboards.create" }));
  expect(state.create).toHaveBeenCalledWith({ title: "Fluxo do site", projectId: "p1" });
  expect(state.navigate).toHaveBeenCalledWith("/dashboard/whiteboards/w2");
});

it("asks before deleting a board", async () => {
  render(<MemoryRouter><WhiteboardsPage /></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "whiteboards.delete" }));
  expect(state.remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "whiteboards.deleteConfirm" }));
  expect(state.remove).toHaveBeenCalledWith("w1");
});

it("lets viewers open boards but not create them", () => {
  state.role = "viewer";
  state.boards = [];
  render(<MemoryRouter><WhiteboardsPage /></MemoryRouter>);
  expect(screen.queryByRole("button", { name: "whiteboards.new" })).toBeNull();
  expect(screen.getByText("whiteboards.emptyTitle")).toBeTruthy();
});
