import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import ScopeChangesPage, { type ScopeChange } from "./scope-changes.page";
import messages from "@/locales/scope/en.json";
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), role: "user", owner: true }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { id: "owner", role: api.role, isOrganizationOwner: api.owner } } }) }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "scope" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string, opts?: { defaultValue?: string }) => key.split(".").slice(1).reduce<unknown>((v, k) => v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined, messages) ?? opts?.defaultValue ?? key }) }));
const row: ScopeChange = { id: "change", title: "New landing page", description: "Additional page", state: "awaiting", revision: 2, requested_by: "owner", stale: false, cancellation_reason: null, created_at: "2026-09-24", source: null, attachments: [], history: [], hasMoreVersions: false, application: null, latest: { revision: 2, classification: "additional", estimated_hours: "12.50", amount: "250.00", currency: "BRL", end_date: "2026-10-20", note: "New page with form", decision: null, comment: null, created_at: "2026-09-24" } };
let report: { items: ScopeChange[]; page: number; hasMore: boolean; project: { id: string; name: string; clientId: string }; canManage: boolean; canEstimate: boolean; canDecide: boolean };
beforeEach(() => { vi.clearAllMocks(); api.role = "user"; api.owner = true; report = { items: [row], page: 1, hasMore: false, project: { id: "project", name: "Project", clientId: "client" }, canManage: true, canEstimate: true, canDecide: false }; api.get.mockImplementation(async () => ({ data: { data: report } })); api.post.mockResolvedValue({ data: { data: {} } }); });
function setup() { render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><MemoryRouter initialEntries={["/projects/project/changes"]}><Routes><Route path="/projects/:id/changes" element={<ScopeChangesPage />} /></Routes></MemoryRouter></QueryClientProvider>); return userEvent.setup(); }
it("client approval requires review and sends the exact displayed revision", async () => {
  api.role = "client"; api.owner = false; report.canDecide = true; report.canManage = false; report.canEstimate = false;
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.approve })); const modal = within(screen.getByRole("dialog"));
  expect(modal.getByText("250.00 BRL")).toBeInTheDocument(); await user.click(modal.getByRole("button", { name: messages.approve })); expect(api.post).not.toHaveBeenCalled();
  await user.click(modal.getByLabelText(messages.confirmApproval)); await user.click(modal.getByRole("button", { name: messages.approve }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/projects/project/changes/change", { action: "decide", revision: 2, state: "approved", comment: "" }));
});
it("applies only explicitly selected effects after confirmation", async () => {
  report.items = [{ ...row, state: "approved" }]; const user = setup(); await user.click(await screen.findByRole("button", { name: messages.apply })); const modal = within(screen.getByRole("dialog"));
  expect(modal.getByRole("button", { name: messages.apply })).toBeDisabled(); await user.click(modal.getByLabelText(messages.createTask)); await user.click(modal.getByLabelText(messages.confirmApplication)); await user.click(modal.getByRole("button", { name: messages.apply }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/projects/project/changes/change", { action: "apply", revision: 2, createTask: true, prepareBilling: false, applyDate: false, confirm: true }));
});
it("publishes a new estimate with currency and the current revision", async () => {
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.revise })); const modal = within(screen.getByRole("dialog"));
  await user.clear(modal.getByLabelText(messages.price)); await user.type(modal.getByLabelText(messages.price), "300.50"); await user.click(modal.getByRole("button", { name: messages.estimate }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/projects/project/changes/change", expect.objectContaining({ action: "estimate", revision: 2, amount: "300.50", currency: "BRL", endDate: "2026-10-20" })));
});
it("creates a request with the server-uploaded attachment ID", async () => {
  api.post.mockImplementation(async (url: string) => ({ data: { data: url.includes("/media") ? { fileId: "file1", fileName: "brief.pdf" } : {} } }));
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.create })); const modal = within(screen.getByRole("dialog"));
  await user.type(modal.getByLabelText(messages.requestTitle), "Extra page"); await user.type(modal.getByLabelText(messages.requestDescription), "A contact form"); await user.upload(modal.getByLabelText(messages.attachments), new File(["pdf"], "brief.pdf", { type: "application/pdf" }));
  await modal.findByText("brief.pdf"); await user.click(modal.getByRole("button", { name: messages.create }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/projects/project/changes", expect.objectContaining({ id: expect.any(String), title: "Extra page", fileIds: ["file1"] })));
});
it("renders a version conflict without silently approving the replacement", async () => {
  api.role = "client"; report.canDecide = true; api.post.mockRejectedValue({ response: { data: { code: "VERSION_CHANGED" } } });
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.approve })); const modal = within(screen.getByRole("dialog")); await user.click(modal.getByLabelText(messages.confirmApproval)); await user.click(modal.getByRole("button", { name: messages.approve }));
  expect(await screen.findByRole("alert")).toHaveTextContent(messages.errors.VERSION_CHANGED); expect(api.post).toHaveBeenCalledTimes(1);
});
it("hides approval and application for a request with a replaced client", async () => {
  report.items = [{ ...row, state: "approved", stale: true }]; setup(); await screen.findByText(messages.clientChanged); expect(screen.queryByRole("button", { name: messages.apply })).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: messages.revise })).not.toBeInTheDocument();
});
it("keeps request failures distinct from an empty project", async () => { api.get.mockRejectedValue(new Error("Network")); setup(); expect(await screen.findByRole("alert")).toHaveTextContent(messages.error); expect(screen.queryByText(messages.empty)).not.toBeInTheDocument(); });
it("does not fetch commercial requests for an operator", () => { api.role = "operator"; api.owner = false; setup(); expect(screen.getByText(messages.forbidden)).toBeInTheDocument(); expect(api.get).not.toHaveBeenCalled(); });
