import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReadyToBill } from "./ReadyToBill";
import messages from "@/locales/retainers/en.json";
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), owner: true, role: "user" }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org" }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { role: api.role, isOrganizationOwner: api.owner } } }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" }, t: (key: string) => messages[key.replace("retainers.", "") as keyof typeof messages] ?? key }) }));
const source = { key: "overage:period", title: "Support · September", client_name: "Acme", amount: "240.00", currency: "ILS", version: "a".repeat(64) };
beforeEach(() => { vi.clearAllMocks(); api.owner = true; api.role = "user"; api.get.mockResolvedValue({ data: { data: { items: [source], hasMore: false } } }); api.post.mockResolvedValue({ data: { data: { id: "invoice" } } }); });
function setup() { render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><ReadyToBill /></QueryClientProvider>); return userEvent.setup(); }
it("prepares the displayed approval once and never sends an invoice", async () => {
 const user = setup(); expect(await screen.findByText(/240\.00/)).toBeInTheDocument();
 await user.click(screen.getByRole("button", { name: messages.prepareInvoice }));
 await waitFor(() => expect(api.post).toHaveBeenCalledWith("/invoices/ready-to-bill", { key: source.key, version: source.version }));
 expect(await screen.findByRole("status")).toHaveTextContent(messages.invoicePrepared); expect(api.post).toHaveBeenCalledTimes(1);
});
it("does not announce a draft when the approved source changed", async () => {
 api.post.mockRejectedValue({ response: { data: { code: "VERSION_CHANGED" } } }); const user = setup();
 await user.click(await screen.findByRole("button", { name: messages.prepareInvoice }));
 expect(await screen.findByRole("alert")).toHaveTextContent(messages.billingError); expect(screen.queryByText(messages.invoicePrepared)).not.toBeInTheDocument();
});
it("does not fetch internal billing sources for a client", () => { api.role = "client"; api.owner = false; setup(); expect(api.get).not.toHaveBeenCalled(); });
