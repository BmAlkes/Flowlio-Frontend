import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TrialBanner, TrialEndedGate } from "./TrialStatus";

const state = vi.hoisted(() => ({
  user: { role: "user", organizationId: "org", isOrganizationOwner: true } as Record<string, unknown>,
  status: undefined as Record<string, unknown> | undefined,
  enabled: undefined as boolean | undefined,
  navigate: vi.fn(),
  signOut: vi.fn(async () => ({})),
}));
vi.mock("react-router", () => ({ useNavigate: () => state.navigate }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string, options?: { count?: number }) => (options?.count != null ? `${key}:${options.count}` : key) }) }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ cancelQueries: vi.fn(), clear: vi.fn() }) }));
vi.mock("@/providers/user.provider", () => ({ useUser: () => ({ data: { user: state.user } }), authClient: { signOut: state.signOut } }));
vi.mock("@/hooks/usesubscription", () => ({
  useSubscriptionStatus: (options: { enabled: boolean }) => {
    state.enabled = options.enabled;
    return { data: state.status ? { data: state.status } : undefined };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  state.user = { role: "user", organizationId: "org", isOrganizationOwner: true };
  state.status = undefined;
});
afterEach(cleanup);

it("reminds the owner how many trial days are left and opens checkout with the trial's plan", async () => {
  state.status = { status: "active", isTrial: true, trialDaysRemaining: 3, plan: { id: "starter" } };
  render(<TrialBanner />);
  expect(screen.getByRole("status")).toHaveTextContent("conversion.trial.banner:3");
  await userEvent.click(screen.getByRole("button", { name: "conversion.trial.subscribe" }));
  expect(state.navigate).toHaveBeenCalledWith("/checkout", { state: { selectedPlanId: "starter" } });
});

it("shows no reminder to members, to paid plans or outside an organization", () => {
  state.status = { status: "active", isTrial: true, trialDaysRemaining: 3 };
  state.user = { ...state.user, isOrganizationOwner: false };
  const { container, rerender } = render(<TrialBanner />);
  expect(container.innerHTML).toBe("");
  state.user = { ...state.user, isOrganizationOwner: true };
  state.status = { status: "active", isTrial: false };
  rerender(<TrialBanner />);
  expect(container.innerHTML).toBe("");
  state.user = { role: "client" };
  rerender(<TrialBanner />);
  expect(state.enabled).toBe(false);
});

it("blocks the app after the trial: owners choose a plan, members are told to ask the owner", async () => {
  state.status = { status: "trial_expired", plan: { id: "starter" } };
  const { rerender } = render(<TrialEndedGate />);
  expect(screen.getByRole("dialog", { name: "conversion.trial.endedTitle" })).toHaveTextContent("conversion.trial.endedOwner");
  await userEvent.click(screen.getByRole("button", { name: "conversion.trial.choosePlan" }));
  expect(state.navigate).toHaveBeenCalledWith("/checkout", { state: { selectedPlanId: "starter" } });
  state.user = { ...state.user, isOrganizationOwner: false };
  rerender(<TrialEndedGate />);
  expect(screen.getByRole("dialog")).toHaveTextContent("conversion.trial.endedMember");
  expect(screen.queryByRole("button", { name: "conversion.trial.choosePlan" })).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "conversion.trial.signOut" }));
  expect(state.signOut).toHaveBeenCalled();
  expect(state.navigate).toHaveBeenLastCalledWith("/auth/signin", { replace: true });
});

it("stays out of the way while the subscription is active", () => {
  state.status = { status: "active", isTrial: false };
  const { container } = render(<TrialEndedGate />);
  expect(container.innerHTML).toBe("");
});
