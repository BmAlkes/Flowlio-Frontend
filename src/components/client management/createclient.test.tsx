import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ClientForm } from "./createclient";
const api = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), fields: { data: [] } }));
vi.mock("@/hooks/usecreateclient", () => ({ useCreateClient: () => ({ mutate: api.create, isPending: false }) }));
vi.mock("@/hooks/useupdateclient", () => ({ useUpdateClient: () => ({ mutate: api.update, isPending: false }) }));
vi.mock("@/hooks/usecustomfields", () => ({ useFetchCustomFields: () => ({ data: api.fields }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
function show() { render(<MemoryRouter><ClientForm mode="create" /></MemoryRouter>); }
async function fillIdentity() {
  await userEvent.type(screen.getByLabelText("Full Name:"), "Cliente Teste");
  await userEvent.type(screen.getByLabelText("Email Address:"), "client@example.test");
}
it("focuses the native phone input on invalid submission and allows correction", async () => {
  show(); await fillIdentity();
  const phone = screen.getByLabelText("Phone Number:");
  fireEvent.change(phone, { target: { value: "0" } });
  await userEvent.click(screen.getByRole("button", { name: "Create Client" }));
  await waitFor(() => expect(phone).toHaveFocus());
  expect(phone).toHaveAttribute("aria-invalid", "true");
  expect(phone).toHaveAccessibleDescription(/valid international phone number/);
  expect(api.create).not.toHaveBeenCalled();
  fireEvent.change(phone, { target: { value: "+5511999999999" } });
  await userEvent.click(screen.getByRole("button", { name: "Create Client" }));
  await waitFor(() => expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ phone: "5511999999999", portalAccessEnabled: false }), expect.any(Object)));
});
it("creates a client with only name and email and no portal password", async () => {
  show(); await fillIdentity();
  await userEvent.click(screen.getByRole("button", { name: "Create Client" }));
  await waitFor(() => expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ name: "Cliente Teste", email: "client@example.test", portalAccessEnabled: false }), expect.any(Object)));
  expect(api.create.mock.calls[0][0]).not.toHaveProperty("password");
});
it("treats a country prefix alone as an empty optional phone", async () => {
  show(); await fillIdentity();
  const phone = screen.getByLabelText("Phone Number:");
  fireEvent.change(phone, { target: { value: "+15551234567" } });
  fireEvent.change(phone, { target: { value: "+1" } });
  await userEvent.click(screen.getByRole("button", { name: "Create Client" }));
  await waitFor(() => expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ phone: "" }), expect.any(Object)));
});
