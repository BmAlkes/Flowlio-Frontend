import { authClient } from "./auth-client";

export async function sendSignInOTP(email: string, secondFactor: boolean) {
  const result = secondFactor
    ? await authClient.twoFactor.sendOtp({})
    : await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
  if (result.error)
    throw new Error(result.error.message || "Failed to send OTP");
  return result.data;
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
