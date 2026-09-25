import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WorkflowsPage, { WorkflowRuleRow, type WorkflowRule } from "./workflows.page";
import messages from "@/locales/workflows/en.json";
const api = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { id: "owner", role: "user", isOrganizationOwner: true } } }) }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "scope" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key: string) => messages[key.replace("workflows.", "") as keyof typeof messages] ?? key }) }));
const rule: WorkflowRule = { id: "rule", name: "Accepted delivery", trigger: "delivery_approved", projectStatus: null, title: "Accepted", message: "Review next milestone", enabled: false };
beforeEach(() => { vi.clearAllMocks(); api.patch.mockResolvedValue({}); api.get.mockResolvedValue({ data: { data: { sampled: 2, matches: 1 } } }); });
function setup() { render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><WorkflowRuleRow rule={rule} /></QueryClientProvider>); return userEvent.setup(); }
it("simulation reads a preview without enabling the rule", async () => { const user = setup(); await user.click(screen.getByRole("button", { name: messages.simulate })); expect(await screen.findByRole("status")).toHaveTextContent(messages.simulation); expect(api.get).toHaveBeenCalledWith("/workflows/rule/simulate"); expect(api.patch).not.toHaveBeenCalled(); });
it("enables only after an explicit action", async () => { const user = setup(); expect(api.patch).not.toHaveBeenCalled(); await user.click(screen.getByRole("button", { name: messages.enable })); await waitFor(() => expect(api.patch).toHaveBeenCalledWith("/workflows/rule", { enabled: true })); });
it("keeps a failed activation visible without claiming enabled", async () => { api.patch.mockRejectedValue(new Error("Network")); const user = setup(); await user.click(screen.getByRole("button", { name: messages.enable })); expect(await screen.findByRole("alert")).toHaveTextContent(messages.error); expect(screen.getByText(messages.paused)).toBeInTheDocument(); });

it("uncertain delivery shows reconciliation guidance and no retry action", async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: "attempt", outcome: "uncertain", createdAt: "2026-09-25T10:00:00Z", canRetry: false }] } });
  const user = setup(); await user.click(screen.getByRole("button", { name: messages.history }));
  expect(await screen.findByText(messages.uncertain)).toBeInTheDocument(); expect(screen.getByText(messages.uncertainNote)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: messages.retry })).not.toBeInTheDocument(); expect(api.post).not.toHaveBeenCalled();
});
it("only explicitly retries a blocked execution and uses its resource identifier", async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: "blocked", outcome: "plan_limit", createdAt: "2026-09-25T10:00:00Z", canRetry: true }] } }); api.post.mockResolvedValue({});
  const user = setup(); await user.click(screen.getByRole("button", { name: messages.history })); await user.click(await screen.findByRole("button", { name: messages.retry }));
  expect(api.post).toHaveBeenCalledWith("/workflows/rule/executions/blocked/retry");
});
it("commercial results preserve currency and require review", async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: "draft", outcome: "billing_prepared", createdAt: "2026-09-25T10:00:00Z", details: { amount: "125.50", currency: "BRL" }, href: "/dashboard/project/view/project/changes" }] } });
  const user = setup(); await user.click(screen.getByRole("button", { name: messages.history })); expect(await screen.findByText(/BRL 125.50/)).toBeInTheDocument();
  expect(screen.getByText(new RegExp(messages.reviewRequired))).toBeInTheDocument(); expect(screen.getByRole("link", { name: messages.openResource })).toHaveAttribute("href", "/dashboard/project/view/project/changes");
});
it("task creation requires an explicit assignee and sends the selected action", async () => {
  api.get.mockImplementation(async (path: string) => ({ data: { data: path === "/workflows/options" ? { members: [{ id: "owner", name: "Ana" }], projects: [] } : [] } })); api.post.mockResolvedValue({});
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><WorkflowsPage /></QueryClientProvider>); const user = userEvent.setup();
  await user.type(screen.getByLabelText(messages.name), "Delivery task"); await user.click(screen.getByRole("radio", { name: messages.create_task }));
  const assignee = screen.getByLabelText(messages.assignee); expect(assignee).toBeRequired(); expect(assignee).toHaveValue("");
  await user.selectOptions(assignee, "owner"); await user.type(screen.getByLabelText(messages.notificationTitle), "Review next steps"); await user.type(screen.getByLabelText(messages.message), "Check the next milestone");
  await user.click(screen.getByRole("button", { name: "common.save" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/workflows", expect.objectContaining({ actionType: "create_task", recipientId: "owner", channel: "internal", targetProjectId: null })));
});
