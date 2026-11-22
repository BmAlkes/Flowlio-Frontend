import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ImportData } from "./ImportData";

const api = vi.hoisted(() => ({ post: vi.fn() }));
const session = vi.hoisted(() => ({ owner: true }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string, options?: Record<string, unknown>) => (options?.count != null ? `${key}:${options.count}` : key), i18n: { language: "pt" } }) }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { isOrganizationOwner: session.owner, isOrganizationManager: false } } }) }));
vi.mock("@/components/common/generalmodal", () => ({
  GeneralModal: ({ open, children }: { open?: boolean; children: React.ReactNode }) => (open ? <div role="dialog">{children}</div> : null),
}));

const wrap = () => render(<QueryClientProvider client={new QueryClient()}><ImportData /></QueryClientProvider>);
beforeEach(() => { vi.clearAllMocks(); session.owner = true; });
afterEach(cleanup);

it("is hidden from people who are not owners or managers", () => {
  session.owner = false;
  const { container } = wrap();
  expect(container.innerHTML).toBe("");
});

it("reads a CSV of tasks, guesses the columns and sends the mapped rows", async () => {
  api.post.mockResolvedValue({ data: { data: { created: 2, projectsCreated: 1, skipped: [] } } });
  wrap();
  await userEvent.click(screen.getByRole("button", { name: "privacy.import.start" }));
  await userEvent.click(screen.getByRole("radio", { name: "privacy.import.kinds.tasks" }));
  const csv = "Projeto,Tarefa,Status,Prazo\nSite,Home,Done,05/03/2026\nSite,Blog,,\n";
  await userEvent.upload(screen.getByLabelText("privacy.import.file"), new File([csv], "board.csv", { type: "text/csv" }));
  await userEvent.click(await screen.findByRole("button", { name: "privacy.import.submit:2" }));
  await waitFor(() => expect(api.post).toHaveBeenCalled());
  const [url, body] = api.post.mock.calls[0];
  expect(url).toBe("/organizations/import");
  expect(body.kind).toBe("tasks");
  expect(body.rows[0]).toMatchObject({ project: "Site", title: "Home", status: "Done", endDate: "2026-03-05" });
  expect(await screen.findByText("privacy.import.done:2")).toBeTruthy();
});
