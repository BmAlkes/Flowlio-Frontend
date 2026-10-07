import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import { ClientPortalAccessDialog } from "./ClientPortalAccessDialog";
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org-one" }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt-BR" } }) }));
beforeEach(() => { vi.resetAllMocks(); });
function show(onManage = vi.fn()) {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><ClientPortalAccessDialog clientId="client-one" email="client@example.test" onClose={vi.fn()} onManage={onManage} /></QueryClientProvider>);
}
it("sends an invitation with an idempotency key and shows the server delivery state", async () => {
  api.get.mockResolvedValueOnce({ data: { data: { state: "not_invited", expiresAt: null } } }).mockResolvedValue({ data: { data: { state: "queued", expiresAt: null } } });
  api.post.mockResolvedValue({}); show();
  await userEvent.click(await screen.findByRole("button", { name: "portalInvite.send" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/portal-invitations/client-one", { key: expect.any(String), language: "pt" }));
  expect(await screen.findByText("portalInvite.states.queued")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "portalInvite.resend" })).toBeDisabled();
});
it("keeps already active accounts in the existing access management flow", async () => {
  api.get.mockResolvedValue({ data: { data: { state: "active", expiresAt: null } } });
  const manage = vi.fn(); show(manage);
  await userEvent.click(await screen.findByRole("button", { name: "portalInvite.manage" }));
  expect(manage).toHaveBeenCalledOnce(); expect(api.post).not.toHaveBeenCalled();
});
it("keeps the same operation key on an uncertain request retry", async () => {
  api.get.mockResolvedValue({ data: { data: { state: "not_invited", expiresAt: null } } });
  api.post.mockRejectedValue(new Error("offline")); show();
  await userEvent.click(await screen.findByRole("button", { name: "portalInvite.send" }));
  await screen.findByRole("alert");
  await userEvent.click(screen.getByRole("button", { name: "portalInvite.send" }));
  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
  expect(api.post.mock.calls[0][1].key).toBe(api.post.mock.calls[1][1].key);
});
