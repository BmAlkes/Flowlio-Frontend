import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GenerateInvoiceFromTimeModal } from "./GenerateInvoiceFromTimeModal";
import { InvoiceTimeDetails } from "./InvoiceTimeDetails";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("sonner", () => ({ toast }));
// Keep selection deterministic in jsdom; the real dialog, query hooks and HTTP contract run below.
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => <select aria-label="Client" disabled={disabled} value={value} onChange={e => onValueChange(e.target.value)}><option value="">Select a client</option>{children}</select>,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));
const entries = [
  { id: "one", version: "a".repeat(64), userName: "Alice", projectName: "Website", taskTitle: "Design", description: null, duration: 60, hourlyRate: "50.00", startTime: "2026-09-01T10:00:00Z" },
  { id: "two", version: "b".repeat(64), userName: "Bob", projectName: "Website", taskTitle: "Review", description: null, duration: 30, hourlyRate: null, startTime: "2026-09-02T10:00:00Z" },
];
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation(async (url: string) => ({ data: { data: url.startsWith("/clients") ? [{ id: "client-a", name: "Client A" }] : { entries, hasMore: false } } }));
  api.post.mockResolvedValue({ data: { success: true, data: { id: "invoice" } } });
});
async function setup() {
  const onClose = vi.fn();
  const parentSubmit = vi.fn();
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={cache}><form onSubmit={e => { e.preventDefault(); parentSubmit(); }}><GenerateInvoiceFromTimeModal isOpen onClose={onClose} /></form></QueryClientProvider>);
  const user = userEvent.setup();
  await screen.findByRole("option", { name: "Client A" });
  await user.selectOptions(screen.getByRole("combobox", { name: "Client" }), "client-a");
  await screen.findByText("Design");
  return { onClose, parentSubmit, user, cache };
}
describe("time invoice creation", () => {
  it("reads the persisted item snapshots for an existing invoice", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: "item", userName: "Alice", projectName: "Website", taskTitle: "Design", startedAt: "2026-09-01T10:00:00Z", minutes: 60, hourlyRate: "50.00", amount: "50.00" }] } });
    render(<QueryClientProvider client={new QueryClient()}><InvoiceTimeDetails invoiceId="invoice" invoiceNumber="S1-00001" onClose={vi.fn()} /></QueryClientProvider>);
    expect(await screen.findByText("Design")).toBeInTheDocument();
    expect(screen.getByText("50.00")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/invoices/invoice/time-items");
  });
  it("sends selected team entry versions in one atomic request, without a client-calculated amount", async () => {
    const { user, onClose, parentSubmit } = await setup();
    await user.click(screen.getByRole("checkbox", { name: /Select all/ }));
    await user.type(screen.getByLabelText("Fallback hourly rate"), "40");
    expect(screen.getByText("70.00")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create invoice" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(api.post).toHaveBeenCalledOnce();
    expect(api.post.mock.calls[0][0]).toBe("/invoices/from-time");
    const payload = api.post.mock.calls[0][1];
    expect(payload.entries).toEqual(entries.map(({ id, version }) => ({ id, version })));
    expect(payload.fallbackRate).toBe("40");
    expect(payload).not.toHaveProperty("amount");
    expect(payload.requestKey).toMatch(/^[a-f0-9-]{36}$/);
    expect(parentSubmit).not.toHaveBeenCalled();
  });
  it("reuses the exact request after an uncertain network failure, even if a refetch hides the hours", async () => {
    api.post.mockRejectedValueOnce(new Error("Connection lost"));
    const { user, onClose, cache } = await setup();
    await user.click(screen.getByRole("checkbox", { name: /Design/ }));
    await user.click(screen.getByRole("button", { name: "Create invoice" }));
    await screen.findByRole("button", { name: "Retry creation" });
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    const first = api.post.mock.calls[0][1];
    api.get.mockResolvedValue({ data: { data: { entries: [], hasMore: false } } });
    await cache.invalidateQueries({ queryKey: ["billable-time"] });
    await user.click(screen.getByRole("button", { name: "Retry creation" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(api.post.mock.calls[1][1]).toEqual(first);
  });
  it("requires reselection after a conflict and does not announce success", async () => {
    api.post.mockRejectedValueOnce({ isAxiosError: true, response: { status: 409, data: { code: "TIME_CHANGED", message: "Review updated time" } } });
    const { user, onClose } = await setup();
    await user.click(screen.getByRole("checkbox", { name: /Design/ }));
    await user.click(screen.getByRole("button", { name: "Create invoice" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Review updated time"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Create invoice" })).toBeDisabled());
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
  it("clears selection when dates change and distinguishes loading failure from empty time", async () => {
    const { user } = await setup();
    await user.click(screen.getByRole("checkbox", { name: /Design/ }));
    api.get.mockRejectedValue(new Error("Unavailable"));
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-01-01" } });
    await screen.findByText("Could not load billable hours.");
    expect(screen.queryByText("No unbilled, completed billable hours in this period.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create invoice" })).toBeDisabled();
  });
});
