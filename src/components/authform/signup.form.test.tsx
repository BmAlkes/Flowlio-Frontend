import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { SignUpForm } from "./signup.form";

const state = vi.hoisted(() => ({
  plans: [] as unknown[],
  selectedPlanId: null as string | null,
  navigate: vi.fn(),
  signUp: vi.fn(),
  activateFree: vi.fn(async () => ({})),
  startTrial: vi.fn(async () => ({})),
  setOrganizationData: vi.fn(),
  clearPlanSelection: vi.fn(),
}));
vi.mock("react-router", async (importOriginal) => ({ ...(await importOriginal<typeof import("react-router")>()), useNavigate: () => state.navigate }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ refetchUser: vi.fn(async () => undefined) }), authClient: { signUp: { email: state.signUp } } }));
vi.mock("@/hooks/usefetchplans", () => ({ useFetchPublicPlans: () => ({ data: { data: state.plans } }) }));
vi.mock("@/hooks/usesubscription", () => ({ useActivateFreePlan: () => ({ mutateAsync: state.activateFree }), useStartTrial: () => ({ mutateAsync: state.startTrial }) }));
vi.mock("@/store/planSelection.store", () => ({
  usePlanSelectionStore: () => ({ selectedPlanId: state.selectedPlanId, setOrganizationData: state.setOrganizationData, clearPlanSelection: state.clearPlanSelection }),
}));
vi.mock("./formwrapper", () => ({ FormWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

const plan = (id: string, price: number, trialDays: number) => ({ id, name: id, price, trialDays, isActive: true });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.useFakeTimers({ shouldAdvanceTime: true });
  state.plans = [plan("free", 0, 0), plan("starter", 19, 14), plan("pro", 49, 0)];
  state.selectedPlanId = null;
  state.signUp.mockImplementation(async (_data: unknown, handlers: { onSuccess: () => Promise<void> }) => handlers.onSuccess());
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function fillAndSubmit() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.type(screen.getByLabelText("conversion.signup.name"), "Ana Souza");
  await user.type(screen.getByLabelText("conversion.signup.organization"), "Estúdio Ana");
  await user.type(screen.getByLabelText("conversion.signup.email"), "ana@x.test");
  await user.type(screen.getByLabelText("conversion.signup.password", { selector: "input" }), "Secret!23");
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button", { name: "conversion.signup.submit" }));
  await vi.advanceTimersByTimeAsync(1600); // the wait for the session cookie after signup
}
const renderForm = () => render(<MemoryRouter><SignUpForm /></MemoryRouter>);

it("lets people sign up without choosing a plan and starts them on the free plan", async () => {
  renderForm();
  expect(screen.getByText("conversion.signup.planFree")).toBeTruthy();
  await fillAndSubmit();
  await waitFor(() => expect(state.navigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
  expect(state.activateFree).toHaveBeenCalledWith(expect.objectContaining({ planId: "free", organizationName: "Estúdio Ana" }));
  expect(state.signUp.mock.calls[0][0]).toMatchObject({ name: "Ana Souza", email: "ana@x.test" });
  expect(state.clearPlanSelection).toHaveBeenCalled();
});

it("starts a plan's free trial right after signup, without checkout", async () => {
  state.selectedPlanId = "starter";
  renderForm();
  expect(screen.getByText("conversion.signup.planTrial")).toBeTruthy();
  await fillAndSubmit();
  await waitFor(() => expect(state.navigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
  expect(state.startTrial).toHaveBeenCalledWith(expect.objectContaining({ planId: "starter", organizationName: "Estúdio Ana" }));
  expect(state.activateFree).not.toHaveBeenCalled();
});

it("sends paid plans without a trial to checkout with the company name kept", async () => {
  state.selectedPlanId = "pro";
  renderForm();
  await fillAndSubmit();
  await waitFor(() => expect(state.navigate).toHaveBeenCalledWith("/checkout", { replace: true, state: { fromSignup: true, createOrganization: true, selectedPlanId: "pro" } }));
  expect(state.setOrganizationData).toHaveBeenCalledWith({ organizationName: "Estúdio Ana" });
});

it("falls back to pricing when the plan cannot be started", async () => {
  state.activateFree.mockRejectedValueOnce(new Error("down"));
  renderForm();
  await fillAndSubmit();
  await waitFor(() => expect(state.navigate).toHaveBeenCalledWith("/pricing", { replace: true, state: { fromSignup: true, pendingAccount: true } }));
});

it("asks for the company name and the terms before creating the account", async () => {
  renderForm();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.click(screen.getByRole("button", { name: "conversion.signup.submit" }));
  expect(await screen.findByText("conversion.signup.errors.terms")).toBeTruthy();
  expect(screen.getAllByText("conversion.signup.errors.required").length).toBeGreaterThanOrEqual(3);
  expect(state.signUp).not.toHaveBeenCalled();
});
