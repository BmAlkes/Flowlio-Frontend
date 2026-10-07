import { authClient } from "./auth-client";

const pendingSends = new Map<string, Promise<unknown>>();

export function beginSignInOTP() {
  sessionStorage.setItem("otpAttemptId", crypto.randomUUID());
  sessionStorage.removeItem("otpInitialSend");
}

export function clearSignInOTP() {
  for (const key of ["otpEmail", "otpSecondFactor", "otpAttemptId", "otpInitialSend"])
    sessionStorage.removeItem(key);
}

function sendKey(email: string, secondFactor: boolean) {
  if (!sessionStorage.getItem("otpAttemptId")) beginSignInOTP();
  return JSON.stringify([sessionStorage.getItem("otpAttemptId"), email.toLowerCase(), secondFactor]);
}

// Remounts and reloads must not silently replace a code that is already on its way.
// After a failed/uncertain send, the explicit resend action remains available.
export async function sendInitialSignInOTP(email: string, secondFactor: boolean) {
  const key = sendKey(email, secondFactor);
  if (sessionStorage.getItem("otpInitialSend") === key) return pendingSends.get(key);
  sessionStorage.setItem("otpInitialSend", key);
  await sendSignInOTP(email, secondFactor);
}

export async function sendSignInOTP(email: string, secondFactor: boolean) {
  const key = sendKey(email, secondFactor);
  const pending = pendingSends.get(key);
  if (pending) return pending;
  const request = (async () => {
    // Publish the in-flight promise before invoking the SDK, including sync failures.
    await Promise.resolve();
    try {
      const result = secondFactor
        ? await authClient.twoFactor.sendOtp({})
        : await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
      if (result.error) throw new Error(result.error.message || "Failed to send OTP");
      return result.data;
    } finally { pendingSends.delete(key); }
  })();
  pendingSends.set(key, request);
  return request;
}

export async function verifySignInOTP(
  email: string,
  otp: string,
  secondFactor: boolean,
) {
  const result = secondFactor
    ? await authClient.twoFactor.verifyOtp({ code: otp })
    : await authClient.signIn.emailOtp({ email, otp });
  if (result.error)
    throw new Error(result.error.message || "Invalid or expired OTP");
  const session = await authClient.getSession({
    query: { disableCookieCache: true },
  });
  if (
    session.error ||
    !session.data ||
    session.data.user.email.toLowerCase() !== email.toLowerCase()
  ) {
    throw new Error("Sign-in could not be confirmed. Please try again.");
  }
  return session.data;
}
