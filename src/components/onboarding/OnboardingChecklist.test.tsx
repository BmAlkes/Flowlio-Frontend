import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { OnboardingWelcomeModal } from "./OnboardingWelcomeModal";
const state = vi.hoisted(() => ({ owner: true, data: { role: "admin" }, steps: { create_client: null, create_project: { completedAt: "2026-09-21" }, approve_delivery: null } as Record<string, {completedAt: string} | null>, totalSteps: 3, completedSteps: 1, allDone: false, showOnboarding: true, isLoading: false, dismiss: vi.fn(), refresh: vi.fn(), completeStep: vi.fn(), dismissPending: false, dismissError: false, isRefreshing: false }));
vi.mock("@/hooks/useOnboarding", () => ({ useOnboarding: () => state }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({data: {user: {role: "user", isOrganizationOwner: state.owner}}}) }));
vi.mock("@/components/settings/CurrencySettings", () => ({CurrencySettings: ({showReconciliation}: {showReconciliation?: boolean}) => <div data-testid="currency-setup" data-historical={String(showReconciliation)} />}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
beforeEach(() => { vi.clearAllMocks(); state.owner = true; state.data.role = "admin"; state.steps = {create_client: null, create_project: {completedAt: "2026-09-21"}, approve_delivery: null}; state.dismissError = false; state.showOnboarding = true; });
it("links to real core actions without marking a clicked step complete", async () => {
  render(<MemoryRouter><OnboardingChecklist /></MemoryRouter>);
  const link = screen.getByRole("link", { name: "coreOnboarding.step_create_client" });
  expect(link).toHaveAttribute("href", "/dashboard/client-management/create-client");
  expect(screen.getByRole("link", { name: "coreOnboarding.step_approve_delivery" })).toHaveAttribute("href", "/dashboard/project");
  expect(screen.queryByRole("link", { name: "coreOnboarding.step_create_project" })).toBeNull();
  await userEvent.click(link); expect(state.completeStep).not.toHaveBeenCalled();
});
it("supports keyboard collapse and explicit refresh", async () => {
  const user = userEvent.setup(); render(<MemoryRouter><OnboardingChecklist /></MemoryRouter>);
  const toggle = screen.getByRole("button", { name: /coreOnboarding.title/ }); toggle.focus(); await user.keyboard("{Enter}"); expect(toggle).toHaveAttribute("aria-expanded", "false");
  await user.keyboard("{Enter}"); await user.click(screen.getByRole("button", { name: "coreOnboarding.refresh" })); expect(state.refresh).toHaveBeenCalledOnce();
});
it("shows a failed dismissal", () => { state.dismissError = true; render(<MemoryRouter><OnboardingChecklist /></MemoryRouter>); expect(screen.getByRole("alert")).toHaveTextContent("coreOnboarding.error"); });
it("lets Escape close the welcome dialog without dismissing the persisted checklist", async () => { const onStart = vi.fn(), onDismiss = vi.fn(); render(<OnboardingWelcomeModal onStart={onStart} onDismiss={onDismiss} />); await userEvent.keyboard("{Escape}"); expect(onStart).toHaveBeenCalledOnce(); expect(onDismiss).not.toHaveBeenCalled(); });
it("reopens currency setup from the owner's checklist without marking the step complete", async () => {
  state.steps = {configure_currency: null, ...state.steps};
  render(<MemoryRouter><OnboardingChecklist /></MemoryRouter>);
  await userEvent.click(screen.getByRole("button", {name: "coreOnboarding.step_configure_currency"}));
  expect(screen.getByRole("dialog", {name: "coreOnboarding.step_configure_currency"})).toBeInTheDocument();
  expect(screen.getByTestId("currency-setup")).toHaveAttribute("data-historical", "false");
  expect(screen.getByRole("button", {name: "coreOnboarding.start"})).toBeDisabled();
  expect(state.completeStep).not.toHaveBeenCalled();
});
it("does not offer organization currency controls to a manager", () => {
  state.owner = false; state.data.role = "manager"; state.steps = {configure_currency: null, ...state.steps};
  render(<MemoryRouter><OnboardingChecklist /></MemoryRouter>);
  expect(screen.queryByText("coreOnboarding.step_configure_currency")).not.toBeInTheDocument();
  expect(screen.queryByTestId("currency-setup")).not.toBeInTheDocument();
});
