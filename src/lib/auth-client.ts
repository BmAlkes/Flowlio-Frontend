import { createAuthClient } from "better-auth/client";
import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  plugins: [emailOTPClient(), twoFactorClient()],
});

// Export the email OTP methods for easy use
// Note: checkVerificationOtp exists at runtime but may not be in TypeScript types
const emailOtpClient = authClient.emailOtp as any;
export const emailOTP = {
  sendVerificationOTP: authClient.emailOtp.sendVerificationOtp,
  checkVerificationOTP: emailOtpClient.checkVerificationOtp,
  verifyOTP: authClient.emailOtp.verifyEmail,
  resetPassword: authClient.emailOtp.resetPassword,
  signInWithOTP: authClient.signIn.emailOtp,
};

// Export the two factor methods for easy use
export const twoFactor = {
  enable: authClient.twoFactor.enable,
  disable: authClient.twoFactor.disable,
  verifyTOTP: authClient.twoFactor.verifyTotp,
};
