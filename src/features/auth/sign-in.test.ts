import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completeEmailSignIn } from "./complete-email-sign-in";
import { handleSignInError } from "./handle-sign-in-error";

const api = vi.hoisted(() => ({ get: vi.fn() }));
const auth = vi.hoisted(() => ({ signOut: vi.fn() }));
const toast = vi.hoisted(() => ({ error: vi.fn(), info: vi.fn(), success: vi.fn(), warning: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("@/lib/auth-client", () => ({ authClient: auth }));
vi.mock("sonner", () => ({ toast }));
const ports = { navigate: vi.fn(), refetchUser: vi.fn(), setIsLoading: vi.fn(), setError: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  sessionStorage.clear();
  ports.refetchUser.mockResolvedValue(undefined);
  auth.signOut.mockResolvedValue(undefined);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

async function complete(profile: unknown) {
  api.get.mockResolvedValue({ status: 200, data: { data: profile } });
  const promise = completeEmailSignIn("user@example.com", {}, ports);
  await vi.advanceTimersByTimeAsync(500);
  await promise;
}

describe("email sign-in orchestration", () => {
  it("requires the second factor before fetching a profile or entering the dashboard", async () => {
    await completeEmailSignIn("user@example.com", { twoFactorRedirect: true }, ports);
    expect(sessionStorage.getItem("otpEmail")).toBe("user@example.com");
    expect(sessionStorage.getItem("otpSecondFactor")).toBe("true");
    expect(api.get).not.toHaveBeenCalled();
    expect(ports.refetchUser).not.toHaveBeenCalled();
    expect(ports.navigate).toHaveBeenCalledWith("/auth/signin-otp", { replace: true });
  });

  it("refreshes the session before navigating an active user", async () => {
    await complete({ role: "user", status: "active" });
    expect(api.get).toHaveBeenCalledWith("/user/profile");
    expect(ports.navigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(ports.refetchUser.mock.invocationCallOrder[0]).toBeLessThan(ports.navigate.mock.invocationCallOrder[0]);
    expect(toast.success).toHaveBeenCalledWith("Login successful");
  });

  it("sends pending users with a selected plan to checkout, otherwise to pricing", async () => {
    await complete({ role: "user", status: "pending", selectedPlanId: "plan-a" });
    expect(ports.navigate).toHaveBeenLastCalledWith("/checkout", expect.objectContaining({ state: expect.objectContaining({ selectedPlanId: "plan-a", pendingPayment: true }) }));
    await complete({ role: "user", status: "pending" });
    expect(ports.navigate).toHaveBeenLastCalledWith("/pricing", expect.objectContaining({ replace: true }));
  });

  it("preserves the demo exemption from pending-payment redirects", async () => {
    await complete({ role: "user", status: "pending", organization: { settings: { demo: true } } });
    expect(ports.navigate).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("ends the session on organization suspension and never navigates to the dashboard", async () => {
    api.get.mockRejectedValue({ response: { status: 403, data: { code: "ORGANIZATION_DEACTIVATED", message: "Suspended" } } });
    const promise = completeEmailSignIn("user@example.com", {}, ports);
    await vi.advanceTimersByTimeAsync(500); await promise;
    expect(auth.signOut).toHaveBeenCalledOnce();
    expect(ports.navigate).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Suspended");
  });

  it("preserves rejected pending-account responses as checkout redirects", async () => {
    api.get.mockRejectedValue({ response: { status: 403, data: { code: "USER_PENDING", message: "Payment needed", data: { selectedPlanId: "plan-a" } } } });
    const promise = completeEmailSignIn("user@example.com", {}, ports);
    await vi.advanceTimersByTimeAsync(500); await promise;
    expect(ports.navigate).toHaveBeenCalledWith("/checkout", expect.objectContaining({ state: expect.objectContaining({ selectedPlanId: "plan-a" }) }));
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it("shows invalid credentials without starting another login", async () => {
    await handleSignInError({ error: { message: "Invalid email or password", code: "INVALID_EMAIL_OR_PASSWORD" } }, ports);
    expect(ports.setIsLoading).toHaveBeenCalledWith(false);
    expect(ports.setError).toHaveBeenCalledWith(expect.any(String));
    expect(toast.error).toHaveBeenCalled();
    expect(ports.navigate).not.toHaveBeenCalled();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("recognizes a wrapped expired-trial error without fetching a profile", async () => {
    await handleSignInError({ error: { cause: { data: { code: "TRIAL_EXPIRED" } } } }, ports);
    expect(ports.setError).toHaveBeenCalledWith("Your trial period has expired. Please contact the administrator to upgrade your subscription.");
    expect(api.get).not.toHaveBeenCalled();
    expect(ports.navigate).not.toHaveBeenCalled();
  });
  it.each([401, 403, 500])("does not invent a dashboard or OTP redirect after a profile failure (%s)", async (status) => {
    api.get.mockRejectedValue({ response: { status, data: {} } });
    const promise = completeEmailSignIn("user@example.com", {}, ports);
    await vi.advanceTimersByTimeAsync(500); await promise;
    expect(ports.navigate).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(ports.setError).toHaveBeenCalledWith("Could not confirm your session. Please try signing in again.");
    expect(ports.setIsLoading).toHaveBeenLastCalledWith(false);
    expect(sessionStorage.getItem("otpSecondFactor")).toBeNull();
  });

  it("keeps an absent profile retryable instead of silently stopping", async () => {
    await complete(null);
    expect(ports.navigate).not.toHaveBeenCalled();
    expect(ports.setError).toHaveBeenCalledWith(expect.stringContaining("Could not confirm"));
    expect(ports.setIsLoading).toHaveBeenLastCalledWith(false);
  });

  it("does not announce success if refreshing the authenticated context fails", async () => {
    ports.refetchUser.mockRejectedValueOnce(new Error("Offline"));
    await complete({ role: "user", status: "active" });
    expect(toast.success).not.toHaveBeenCalled();
    expect(ports.navigate).not.toHaveBeenCalled();
    expect(ports.setIsLoading).toHaveBeenLastCalledWith(false);
  });

});
