import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ContractProjects } from "./ContractProjects";
import messages from "@/locales/retainers/en.json";
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
