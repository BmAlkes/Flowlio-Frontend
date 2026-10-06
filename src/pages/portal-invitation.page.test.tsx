import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import PortalInvitationPage from "./portal-invitation.page";
const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
beforeEach(() => { api.post.mockReset(); window.history.replaceState({}, "", "/portal-invitation#token=example-token"); });
function show() { render(<MemoryRouter><PortalInvitationPage /></MemoryRouter>); }
async function fill(confirm = "valid-password") {
  await userEvent.type(screen.getByLabelText("portalInvite.password"), "valid-password");
  await userEvent.type(screen.getByLabelText("portalInvite.confirmPassword"), confirm);
  await userEvent.click(screen.getByRole("button", { name: "portalInvite.activate" }));
}
it("removes the token from the address and uses it only to activate access", async () => {
  api.post.mockResolvedValue({ data: { data: { accepted: true } } }); show();
  expect(window.location.hash).toBe(""); await fill();
  expect(api.post).toHaveBeenCalledWith("/portal-invitations/accept", { token: "example-token", password: "valid-password" });
  expect(await screen.findByRole("link", { name: "portalInvite.signIn" })).toHaveAttribute("href", "/auth/signin");
  expect(screen.queryByLabelText("portalInvite.password")).not.toBeInTheDocument();
});
it("does not send mismatched passwords", async () => {
  show(); await fill("different-password");
  expect(screen.getByRole("alert")).toHaveTextContent("portalInvite.mismatch"); expect(api.post).not.toHaveBeenCalled();
});
it("does not claim activation succeeded when a proxy or API returns an unexpected success body", async () => {
  api.post.mockResolvedValue({ data: "<html>Temporarily unavailable</html>" }); show(); await fill();
  expect(await screen.findByRole("alert")).toHaveTextContent("portalInvite.error");
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
it("explains expired links without claiming activation succeeded", async () => {
  api.post.mockRejectedValue({ response: { data: { code: "INVITATION_INVALID" } } }); show(); await fill();
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("portalInvite.invalid"));
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
it("does not offer a password form without an invitation", () => {
  window.history.replaceState({}, "", "/portal-invitation"); show();
  expect(screen.getByRole("alert")).toHaveTextContent("portalInvite.invalid");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
