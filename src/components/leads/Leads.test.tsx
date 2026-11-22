import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "@/configs/i18n.config";
import { LeadsHeader } from "./LeadsHeader";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org-a" }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { id: "owner", role: "client" } } }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const lead = (extra: Record<string, unknown>) => ({ email: "", phone: null, status: "New Lead", type: "lead", position: 0, createdAt: "2026-11-06T10:00:00Z", updatedAt: "2026-11-06T10:00:00Z", ...extra });
const leads = [
  lead({ id: "marina", name: "Marina", email: "marina@clinica.com", followUpAt: inDays(3) }),
  lead({ id: "john", name: "John Smith", phone: "+1 234 5678", followUpAt: "2020-01-01T09:00:00Z", leadValue: 3000, currencyCode: "ILS" }),
  lead({ id: "joe", name: "Joe Dow", phone: "0549547340", status: "Contract Signed", temperature: "Hot", leadValue: 3000, currencyCode: "ILS", lastInteractionAt: "2026-11-01T10:00:00Z" }),
  lead({ id: "bruno", name: "Bruno Malkes", phone: "0549547355", status: "Inactive" }),
];

afterEach(cleanup);
beforeEach(() => {
  void i18n.changeLanguage("en");
  vi.clearAllMocks();
  api.get.mockImplementation(async (url: string) => {
    if (url.startsWith("/leads?")) return { data: { success: true, data: leads, total: leads.length, page: 1, limit: 50 } };
    if (url === "/webhooks") return { data: { webhooks: [] } };
    if (url.startsWith("/leads/insights/")) return { data: { data: { score: 25, temperature: "Cold", isManualTemperature: false, daysSinceLastContact: 3, interactionCount: 0, recommendedAction: "Reach out" } } };
    if (url.startsWith("/leads/timeline/")) return { data: { data: [] } };
    return { data: { success: true, data: [] } };
  });
});

function setup() {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={cache}><MemoryRouter><LeadsHeader /></MemoryRouter></QueryClientProvider>);
  return userEvent.setup();
}

it("summary cards count the leads behind them and filter the table when clicked", async () => {
  const user = setup();
  await screen.findByRole("button", { name: "Marina" });
  const overdue = screen.getByRole("button", { name: /Overdue follow-ups/ });
  expect(overdue).toHaveTextContent("1");
  expect(screen.getByRole("button", { name: /New, not contacted/ })).toHaveTextContent("2");
  expect(screen.getByRole("button", { name: /Hot leads/ })).toHaveTextContent("1");
  expect(screen.getByText("Pipeline value").parentElement?.parentElement).toHaveTextContent(/6,000/);
  await user.click(overdue);
  expect(overdue).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "John Smith" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Marina" })).not.toBeInTheDocument();
  await user.click(overdue);
  expect(await screen.findByRole("button", { name: "Marina" })).toBeInTheDocument();
});

it("rows link straight to email, phone and WhatsApp, and missing contacts stay disabled", async () => {
  setup();
  await screen.findByRole("button", { name: "Marina" });
  expect(screen.getByRole("link", { name: "Email Marina" })).toHaveAttribute("href", "mailto:marina@clinica.com");
  expect(screen.getByRole("button", { name: /Call Marina/ })).toBeDisabled();
  expect(screen.getByRole("link", { name: "WhatsApp Joe Dow" })).toHaveAttribute("href", "https://wa.me/0549547340");
  expect(screen.getByText("Overdue · Jan 1")).toBeInTheDocument();
});

it("the pipeline shows the sales stages as columns and the closed stages as a compact strip", async () => {
  const user = setup();
  await screen.findByRole("button", { name: "Marina" });
  await user.click(screen.getByRole("button", { name: "Pipeline" }));
  const newLeads = await screen.findByRole("region", { name: "New Lead" });
  expect(within(newLeads).getByText("Marina")).toBeInTheDocument();
  expect(within(screen.getByRole("region", { name: "Contract Signed" })).getByText("Joe Dow")).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Inactive" })).not.toBeInTheDocument();
  const inactive = screen.getByRole("button", { name: /Inactive\s*1/ });
  expect(screen.queryByText("Bruno Malkes")).not.toBeInTheDocument();
  await user.click(inactive);
  expect(inactive).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Bruno Malkes")).toBeInTheDocument();
});

it("a lead opens its details with contact actions, properties and the activity tab first", async () => {
  const user = setup();
  await user.click(await screen.findByRole("button", { name: "Marina" }));
  const sheet = await screen.findByRole("dialog");
  expect(within(sheet).getByRole("heading", { name: "Marina" })).toBeInTheDocument();
  expect(within(sheet).getByRole("link", { name: /Email/ })).toHaveAttribute("href", "mailto:marina@clinica.com");
  expect(within(sheet).getByRole("button", { name: /Convert to client/ })).toBeInTheDocument();
  expect(within(sheet).getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  await waitFor(() => expect(within(sheet).getByRole("meter", { name: "Score" })).toHaveAttribute("aria-valuenow", "25"));
});
