import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivacySettings } from "./PrivacySettings";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const session = vi.hoisted(() => ({ owner: false }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt" } }) }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: { id: "u1", isOrganizationOwner: session.owner } } }) }));
vi.mock("@/components/common/generalmodal", () => ({
  GeneralModal: ({ open, children }: { open?: boolean; children: React.ReactNode }) => (open ? <div role="dialog">{children}</div> : null),
}));

const wrap = () => render(<QueryClientProvider client={new QueryClient()}><PrivacySettings /></QueryClientProvider>);
beforeEach(() => { vi.clearAllMocks(); session.owner = false; });
afterEach(cleanup);

it("downloads the user's data as a JSON file", async () => {
  api.get.mockResolvedValue({ data: new Blob(["{}"], { type: "application/json" }) });
  const createObjectURL = vi.fn(() => "blob:x");
  Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  wrap();
  await userEvent.click(screen.getByRole("button", { name: "privacy.export" }));
  await waitFor(() => expect(click).toHaveBeenCalled());
  expect(api.get).toHaveBeenCalledWith("/user/privacy/export", { responseType: "blob" });
  click.mockRestore();
});

it("deletes the account only after the password and an explicit confirmation", async () => {
  api.post.mockRejectedValueOnce({ response: { data: { code: "INVALID_PASSWORD" } } });
  wrap();
  await userEvent.click(screen.getByRole("button", { name: "privacy.delete" }));
  const submit = screen.getByRole("button", { name: "privacy.deleteForever" });
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  await userEvent.type(screen.getByLabelText("privacy.password"), "wrong");
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(submit);
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "privacy.wrongPassword");
  expect(api.post).toHaveBeenCalledWith("/user/privacy/delete-account", { password: "wrong", confirm: true });
});

it("tells organization owners that their request is reviewed instead of instant", async () => {
  session.owner = true;
  api.post.mockResolvedValue({ data: { status: "pending" } });
  wrap();
  await userEvent.click(screen.getByRole("button", { name: "privacy.delete" }));
  expect(screen.getByText("privacy.deleteOwnerWarning")).toBeTruthy();
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: "privacy.requestDeletion" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
