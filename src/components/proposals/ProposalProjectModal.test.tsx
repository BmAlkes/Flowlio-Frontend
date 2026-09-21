import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { ProposalProjectModal, type ProjectPreview } from "./ProposalProjectModal";
import messages from "@/locales/proposal-conversion/en.json";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "test-scope" }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key.replace("proposalConversion.", "").split(".").reduce((value: any, part) => value?.[part], messages) ?? key }) }));
const preview: ProjectPreview = { existing: false, version: "a".repeat(64), clientId: "client", name: "Website", description: "Scope", budgetText: "1000 USD", budget: "", canSetBudget: true, tasks: [{ title: "Design", estimatedHours: null }], milestones: ["Review"], templates: [{ id: "template", name: "Standard" }] };
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter><Routes><Route path="/" element={<ProposalProjectModal proposalId="proposal" onClose={vi.fn()} />} /><Route path="/dashboard/project/view/:id" element={<h1>Project destination</h1>} /></Routes></MemoryRouter></QueryClientProvider>);
  return userEvent.setup();
}
beforeEach(() => { vi.clearAllMocks(); api.get.mockResolvedValue({ data: { data: preview } }); });
afterEach(cleanup);
describe("proposal conversion review", () => {
  it("submits reviewed values and only navigates after creation", async () => {
    api.post.mockResolvedValue({ data: { data: { projectId: "new", existing: false } } });
    const user = setup();
    const name = await screen.findByLabelText(messages.name);
    await user.clear(name); await user.type(name, "Reviewed project");
    await user.click(screen.getByRole("button", { name: messages.create }));
    await screen.findByRole("heading", { name: "Project destination" });
    expect(api.post).toHaveBeenCalledWith("/proposals/proposal/project", expect.objectContaining({ name: "Reviewed project", version: preview.version, tasks: preview.tasks, milestones: ["Review"] }));
    expect(api.post.mock.calls[0][1]).not.toHaveProperty("budget");
  });
  it("opens an existing conversion without creating it again", async () => {
    api.get.mockResolvedValue({ data: { data: { existing: true, projectId: "existing" } } });
    const user = setup(); await user.click(await screen.findByRole("button", { name: messages.open }));
    expect(await screen.findByRole("heading", { name: "Project destination" })).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });
  it("retains the review after failure and retries the same proposal", async () => {
    api.post.mockRejectedValueOnce({ response: { data: { code: "SOURCE_CHANGED" } } });
    const user = setup(); await user.click(await screen.findByRole("button", { name: messages.create }));
    expect(await screen.findByRole("alert")).toHaveTextContent(messages.errors.SOURCE_CHANGED);
    expect(screen.getByLabelText(messages.name)).toHaveValue("Website");
    api.get.mockResolvedValue({ data: { data: { ...preview, version: "b".repeat(64), name: "Updated proposal" } } });
    await user.click(screen.getByRole("button", { name: "operations.refresh" }));
    await waitFor(() => expect(screen.getByLabelText(messages.name)).toHaveValue("Updated proposal"));
  });
  it("hides budgets from managers and reloads the chosen template", async () => {
    api.get.mockResolvedValue({ data: { data: { ...preview, canSetBudget: false, budget: "", budgetText: "" } } });
    const user = setup(); await screen.findByLabelText(messages.name);
    expect(screen.queryByText(messages.budget)).toBeNull();
    api.get.mockResolvedValue({ data: { data: { ...preview, canSetBudget: false, tasks: [{ title: "Template task", estimatedHours: "3.50" }] } } });
    await user.selectOptions(screen.getByLabelText(messages.template), "template");
    await screen.findByDisplayValue("Template task");
    expect(api.get).toHaveBeenLastCalledWith("/proposals/proposal/project-preview", { params: { templateId: "template" } });
  });
});
