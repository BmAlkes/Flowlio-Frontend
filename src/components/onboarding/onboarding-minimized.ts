/** Whether the first-steps checklist is shrunk to its small reopen button. Kept per browser; storage may be unavailable. */
const KEY = "flowlio:onboarding-minimized";

export function readOnboardingMinimized(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function writeOnboardingMinimized(minimized: boolean) {
  try {
    if (minimized) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // Without storage the checklist just opens expanded next time.
  }
}
