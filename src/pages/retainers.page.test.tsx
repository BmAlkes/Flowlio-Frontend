import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import RetainersPage, { type Period, type Retainer } from "./retainers.page";
import messages from "@/locales/retainers/en.json";
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), role: "user", owner: true }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { id: "owner", role: api.role, isOrganizationOwner: api.owner } } }) }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string, opts?: { defaultValue?: string }) => key.split(".").slice(1).reduce<unknown>((v, k) => v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined, messages) ?? opts?.defaultValue ?? key }) }));
let cache: QueryClient;
let period: Period; let contract: Retainer; let entries: { id: string; time_entry_id: string; source_entry_id: null; minutes: number; kind: string; label: string; started_at: string }[];
beforeEach(() => {
  vi.clearAllMocks(); api.role = "user"; api.owner = true;
  period = { id: "period", month: "2025-01", state: "open", revision: 3, starts_at: "2025-01-01T00:00:00Z", ends_at: "2025-02-01T00:00:00Z", carry: [], totals: { included: 60, carried: 0, used: 90, remaining: 0, overage: 30 }, decision: null, decision_note: null, statement: null };
  contract = { id: "contract", name: "Support agreement", state: "active", revision: 2, currency: "BRL", monthly_amount: "100.00", included_minutes: 60, timezone: "UTC", start_month: "2025-01", end_month: null, renewal: "automatic", carry_policy: "expire", carry_cap: 0, carry_months: 0, overage_policy: "approval", overage_rate: "15.00", recurring_id: null, latest: period };
  entries = [{ id: "entry", time_entry_id: "time", source_entry_id: null, minutes: 90, kind: "time", label: "Project website", started_at: "2025-01-15T10:00:00Z" }];
  api.get.mockImplementation(async (url: string) => ({ data: { data: url.endsWith("/time") ? { items: [{ id: "available", minutes: 30, project: "Website", startedAt: "2025-01-16T10:00:00Z", version: "a".repeat(64) }], hasMore: false } : url.endsWith("/contract") ? { contract, periods: [period], hasMorePeriods: false, period, entries, hasMoreEntries: false } : { client: { id: "client", name: "Client" }, items: [contract], hasMore: false, canManage: api.owner, canDecide: api.role === "client", templates: [] } } }));
  api.post.mockResolvedValue({ data: {} });
});
function setup() { cache = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }); render(<QueryClientProvider client={cache}><MemoryRouter initialEntries={["/client/client/contracts"]}><Routes><Route path="/client/:clientId/contracts" element={<RetainersPage />} /></Routes></MemoryRouter></QueryClientProvider>); return userEvent.setup(); }
it("reconciles totals and requires explicit confirmation to close the displayed revision", async () => {
  const user = setup(); expect(await screen.findByRole("progressbar")).toHaveAttribute("aria-valuetext", "1h 30m / 1h 00m");
  await user.click(screen.getByRole("button", { name: messages.close })); const modal = within(screen.getByRole("dialog"));
  await user.click(modal.getByRole("button", { name: messages.save })); expect(api.post).not.toHaveBeenCalled(); await user.click(modal.getByLabelText(messages.confirm)); await user.click(modal.getByRole("button", { name: messages.save }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers/contract", expect.objectContaining({ action: "close", periodId: "period", revision: 3, confirm: true })));
});
it("allocates only reviewed time using its server version", async () => {
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.allocate })); const modal = within(screen.getByRole("dialog"));
  expect(modal.getByRole("button", { name: messages.save })).toBeDisabled(); await user.click(await modal.findByRole("checkbox", { name: /Website/ })); await user.click(modal.getByLabelText(messages.confirm)); await user.click(modal.getByRole("button", { name: messages.save }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers/contract", expect.objectContaining({ action: "allocate", revision: 3, entries: [{ id: "available", version: "a".repeat(64) }] })));
});
it("client approval is limited to the exact closed statement and carries the visible amount", async () => {
  api.owner = false; api.role = "client"; period.state = "closed"; period.decision = "awaiting"; period.statement = { carryOut: [], overageAmount: "7.50", billing: { id: "draft", currency: "BRL", monthlyAmount: "100.00", overageAmount: "7.50", recurringId: null } };
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.approve })); const modal = within(screen.getByRole("dialog")); expect(modal.getByText("7.50 BRL")).toBeInTheDocument(); expect(screen.queryByRole("button", { name: messages.create })).not.toBeInTheDocument();
  await user.type(modal.getByLabelText(messages.reason), "Reviewed"); await user.click(modal.getByLabelText(messages.confirm)); await user.click(modal.getByRole("button", { name: messages.save }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers/contract", expect.objectContaining({ action: "decide", revision: 3, decision: "approved", note: "Reviewed", confirm: true })));
});
it("retains a stale-period error instead of retrying approval against a new statement", async () => {
  api.post.mockRejectedValue({ response: { data: { code: "VERSION_CHANGED" } } }); const user = setup(); await user.click(await screen.findByRole("button", { name: messages.close })); const modal = within(screen.getByRole("dialog")); await user.click(modal.getByLabelText(messages.confirm)); await user.click(modal.getByRole("button", { name: messages.save }));
  expect(await modal.findByRole("alert")).toHaveTextContent(messages.errors.VERSION_CHANGED); expect(api.post).toHaveBeenCalledTimes(1);
});
it("creation has no preselected renewal, carry, overage or billing rule", async () => {
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.create })); const modal = within(screen.getByRole("dialog"));
  for (const label of [messages.renewal, messages.carryPolicy, messages.overagePolicy, messages.billingMode]) expect(modal.getByLabelText(label)).toHaveValue("");
  await user.type(modal.getByLabelText(messages.name), "Maintenance"); await user.type(modal.getByLabelText(messages.currency), "BRL"); await user.type(modal.getByLabelText(messages.monthlyAmount), "500.00"); await user.type(modal.getByLabelText(messages.includedHours), "10");
  await user.clear(modal.getByLabelText(messages.timezone)); await user.type(modal.getByLabelText(messages.timezone), "UTC");
  // jsdom's native month input accepts an ISO value through a change event.
  const { fireEvent } = await import("@testing-library/react"); fireEvent.change(modal.getByLabelText(messages.startMonth), { target: { value: "2026-01" } });
  await user.selectOptions(modal.getByLabelText(messages.renewal), "manual"); await user.selectOptions(modal.getByLabelText(messages.carryPolicy), "expire"); await user.selectOptions(modal.getByLabelText(messages.overagePolicy), "waive"); await user.selectOptions(modal.getByLabelText(messages.billingMode), "manual"); await user.click(modal.getByLabelText(messages.confirmTerms)); await user.click(modal.getByRole("button", { name: messages.create }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers", expect.objectContaining({ currency: "BRL", monthlyAmount: "500.00", includedMinutes: 600, renewal: "manual", carryPolicy: "expire", carryCap: 0, carryMonths: 0, overagePolicy: "waive", overageRate: "0", recurringId: null })));
});
it("records pause with contract revision and a client-visible reason", async () => {
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.pause })); const modal = within(screen.getByRole("dialog")); await user.type(modal.getByLabelText(messages.reason), "Vacation"); await user.click(modal.getByLabelText(messages.confirm)); await user.click(modal.getByRole("button", { name: messages.save }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers/contract", expect.objectContaining({ action: "state", state: "paused", revision: 2, reason: "Vacation" })));
});
it("does not treat a failed query as an empty contract list", async () => { api.get.mockRejectedValue(new Error("Network")); setup(); expect(await screen.findByRole("alert")).toHaveTextContent(messages.error); expect(screen.queryByText(messages.empty)).not.toBeInTheDocument(); });
it("does not fetch contracts for an operator", () => { api.role = "operator"; api.owner = false; setup(); expect(screen.getByText(messages.forbidden)).toBeInTheDocument(); expect(api.get).not.toHaveBeenCalled(); });
it("a background refresh cannot silently replace the revision being confirmed", async () => {
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.close })); const modal = within(screen.getByRole("dialog"));
  period = { ...period, revision: 4, totals: { ...period.totals, used: 180, overage: 120 } };
  await cache.invalidateQueries({ queryKey: ["retainer-detail"] });
  await waitFor(() => expect(screen.getAllByRole("progressbar", { hidden: true })[0]).toHaveAttribute("aria-valuetext", "3h 00m / 1h 00m"));
  expect(modal.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "1h 30m / 1h 00m");
  await user.click(modal.getByLabelText(messages.confirm)); await user.click(modal.getByRole("button", { name: messages.save }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers/contract", expect.objectContaining({ action: "close", revision: 3 })));
});
it("selects an adjustment source from a closed period and sends signed minutes", async () => {
  const original = api.get.getMockImplementation()!;
  api.get.mockImplementation(async (url: string, config?: { params?: { periodId?: string } }) => {
    const response = await original(url, config);
    if (url.endsWith("/contract")) {
      response.data.data.periods = [period, { id: "older", month: "2024-12", state: "closed" }];
      if (config?.params?.periodId === "older") response.data.data.entries = [{ ...entries[0], id: "original-entry", label: "Original work" }];
    }
    return response;
  });
  const user = setup(); await user.click(await screen.findByRole("button", { name: messages.adjust })); const modal = within(screen.getByRole("dialog"));
  await modal.findByRole("option", { name: "2024-12" }); await user.selectOptions(modal.getByLabelText(messages.period), "older"); await modal.findByRole("option", { name: /Original work/ }); await user.selectOptions(modal.getByLabelText(messages.adjustmentSource), "original-entry");
  await user.type(modal.getByLabelText(messages.adjustmentMinutes), "-30"); await user.type(modal.getByLabelText(messages.reason), "Corrected duration"); await user.click(modal.getByLabelText(messages.confirm)); await user.click(modal.getByRole("button", { name: messages.save }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers/contract", expect.objectContaining({ action: "adjust", sourceEntryId: "original-entry", minutes: -30, reason: "Corrected duration", revision: 3 })));
});
