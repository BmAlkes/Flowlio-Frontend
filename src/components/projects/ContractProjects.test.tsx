import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContractProjects } from "./ContractProjects";
import messages from "@/locales/retainers/en.json";
import { MemoryRouter } from "react-router";
const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => messages[key.replace("retainers.", "") as keyof typeof messages] ?? key }) }));
beforeEach(() => { vi.clearAllMocks(); api.post.mockResolvedValue({}); });
it("only offers matching unlinked projects and saves the explicit choice", async () => {
 const user = userEvent.setup(); render(<QueryClientProvider client={new QueryClient()}><ContractProjects projects={[
  { id: "website", name: "Website", currency: "ILS", retainerId: null },
  { id: "other", name: "Other currency", currency: "EUR", retainerId: null },
  { id: "used", name: "Another contract", currency: "ILS", retainerId: "different" },
 ]} contractId="contract" currency="ILS" revision={3} path="/clients/client/retainers/contract" active /></QueryClientProvider>);
 expect(screen.getByRole("button", { name: messages.linkProject })).toBeDisabled();
 expect(screen.queryByRole("option", { name: "Other currency" })).not.toBeInTheDocument();
 expect(screen.queryByRole("option", { name: "Another contract" })).not.toBeInTheDocument();
 await user.selectOptions(screen.getByRole("combobox"), "website"); await user.click(screen.getByRole("button", { name: messages.linkProject }));
 await waitFor(() => expect(api.post).toHaveBeenCalledWith("/clients/client/retainers/contract", expect.objectContaining({ action: "link", projectId: "website", revision: 3, enabled: true })));
});
it("returns to the exact contract with an eligible project selected but requires confirmation", async () => {
 render(<MemoryRouter><QueryClientProvider client={new QueryClient()}><ContractProjects projects={[
  { id: "new-project", name: "New project", currency: "ILS", retainerId: null },
 ]} contractId="monthly" clientId="client/one" initialProjectId="new-project" currency="ILS" revision={1} path="/clients/client/retainers/monthly" active /></QueryClientProvider></MemoryRouter>);
 expect(screen.getByRole("combobox")).toHaveValue("new-project");
 expect(api.post).not.toHaveBeenCalled();
 expect(screen.getByRole("link", { name: messages.createLinkedProject })).toHaveAttribute("href", "/dashboard/project/create-project?clientId=client%2Fone&contractId=monthly");
 await userEvent.click(screen.getByRole("button", { name: messages.linkProject }));
 await waitFor(() => expect(api.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ projectId: "new-project", enabled: true })));
});
it("does not select foreign or incompatible IDs from the URL and reuses an uncertain operation on retry", async () => {
 api.post.mockRejectedValue(new Error("offline"));
 render(<QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}><ContractProjects projects={[
  { id: "valid", name: "Valid project", currency: "ILS", retainerId: null },
 ]} contractId="monthly" initialProjectId="foreign" currency="ILS" revision={1} path="/clients/client/retainers/monthly" active /></QueryClientProvider>);
 expect(screen.getByRole("combobox")).toHaveValue("");
 await userEvent.selectOptions(screen.getByRole("combobox"), "valid");
 await userEvent.click(screen.getByRole("button", { name: messages.linkProject }));
 await screen.findByRole("alert");
 await userEvent.click(screen.getByRole("button", { name: messages.linkProject }));
 await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
 expect(api.post.mock.calls[0][1].key).toBe(api.post.mock.calls[1][1].key);
});
