import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "@/configs/i18n.config";
import TaskAutomationsPage from "./task-automations.page";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
const store = vi.hoisted(() => ({ rules: [] as unknown[] }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org" }));
vi.mock("@/hooks/usefetchprojects", () => ({ useFetchProjects: () => ({ data: { data: [{ id: "p1", projectName: "Site" }] } }) }));
vi.mock("@/hooks/usefetchorganizationusers", () => ({ useFetchOrganizationUsers: () => ({ data: { data: { userMembers: [{ id: "u1", user: { id: "u1", name: "Ana" } }] } } }) }));
vi.mock("@/hooks/usecustomfields", () => ({ useFetchCustomFields: () => ({ data: { data: [] } }) }));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage("pt");
  store.rules = [];
  api.get.mockImplementation(async (url: string) => ({ data: { success: true, data: url === "/task-automations" ? store.rules : [] } }));
  api.post.mockImplementation(async (_url: string, body: Record<string, unknown>) => {
    const rule = { ...body, id: "r1", runCount: 0, lastRunAt: null, createdAt: "" };
    store.rules = [rule];
    return { data: { success: true, data: rule } };
  });
  api.patch.mockResolvedValue({ data: { success: true, data: {} } });
});
afterEach(cleanup);

const setup = () => {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><TaskAutomationsPage /></MemoryRouter></QueryClientProvider>);
  return userEvent.setup();
};

it("creates an automation from a template, shows it as a sentence and turns it off", async () => {
  const user = setup();
  expect(await screen.findByText(/Nenhuma automação ainda/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Lembrar o responsável um dia antes do prazo/ }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText(/Quando faltar 1 dia para o prazo, se o status não for Concluído, então avisar o responsável/)).toBeInTheDocument();
  await user.click(within(dialog).getByRole("button", { name: "Salvar automação" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/task-automations", expect.objectContaining({
    trigger: { type: "due_date", offsetDays: 1 },
    conditions: [{ type: "status", op: "is_not", value: "completed" }],
    actions: [expect.objectContaining({ type: "notify", recipient: "assignee", channel: "email" })],
  })));
  const toggle = await screen.findByRole("switch", { name: /Ligar ou desligar Lembrar o responsável/ });
  await user.click(toggle);
  await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/task-automations/r1/enabled", { enabled: false }));
});

it("builds a weekly rule that only creates tasks, and asks for the project first", async () => {
  const user = setup();
  await user.click(await screen.findByRole("button", { name: /Criar o relatório semanal toda segunda/ }));
  const dialog = await screen.findByRole("dialog");
  const save = within(dialog).getByRole("button", { name: "Salvar automação" });
  expect(save).toBeDisabled();
  expect(within(dialog).queryByRole("region", { name: /condições/ })).toBeNull();
  await user.selectOptions(within(dialog).getAllByRole("combobox", { name: "Projeto" })[0], "p1");
  expect(save).toBeEnabled();
  await user.click(save);
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/task-automations", expect.objectContaining({
    trigger: { type: "schedule", every: "week", weekday: 1 },
    actions: [{ type: "create_task", title: "Relatório semanal", projectId: "p1", assignee: "none", dueInDays: 4 }],
  })));
});

it("tells members only managers can create automations", async () => {
  api.get.mockRejectedValue({ response: { status: 403 } });
  setup();
  expect(await screen.findByText("Somente o dono e os gerentes podem criar automações.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Nova automação" })).toBeDisabled();
});
