import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendSignInOTP, verifySignInOTP } from "@/lib/sign-in-otp";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/providers/user.provider";
import { backendURL } from "@/configs/axios.config";

// Login verification uses the server-issued challenge, never email verification as a password.
export const useGenerateSignInOTP = () =>
  useMutation({
    mutationFn: ({
      email,
      secondFactor = false,
    }: {
      email: string;
      secondFactor?: boolean;
    }) => sendSignInOTP(email, secondFactor),
  });

export const useVerifySignInOTP = () =>
  useMutation({
    mutationFn: ({
      email,
      otp,
      secondFactor = false,
    }: {
      email: string;
      otp: string;
      secondFactor?: boolean;
    }) => verifySignInOTP(email, otp, secondFactor),
  });

// Generate OTP for 2FA using better-auth client
export const useGenerateOTP = () => {
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async () => {
      if (!user?.user?.email) {
        throw new Error("User email not found");
      }

      const result = await authClient.emailOtp.sendVerificationOtp({
        email: user.user.email,
        type: "email-verification",
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to send OTP");
      }

      return result.data;
    },
    onError: (error: any) => {
      console.error("Failed to generate OTP:", error);
      throw error;
    },
  });
};

// Verify current password before sensitive auth actions (e.g. enabling 2FA)
export const useVerifyCurrentPassword = () => {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const response = await fetch(
        `${backendURL}/api/user/profile/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ password }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify password");
      }

      return response.json();
    },
    onError: (error: any) => {
      console.error("Failed to verify password:", error);
      throw error;
    },
  });
};

// Verify OTP for 2FA using better-auth client
export const useVerifyOTP = () => {
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async ({ otp }: { otp: string }) => {
      if (!user?.user?.email) {
        throw new Error("User email not found");
      }

      const result = await authClient.emailOtp.verifyEmail({
        email: user.user.email,
        otp,
      });
      if (result.error)
        throw new Error(result.error.message || "Invalid or expired OTP");
      return result.data;
    },
    onError: (error: any) => {
      console.error("Failed to verify OTP:", error);
      throw error;
    },
  });
};

// Enable 2FA after OTP verification
export const useEnable2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Update the twoFactorEnabled field to true after successful OTP verification
      const response = await fetch(`${backendURL}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          twoFactorEnabled: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to enable 2FA");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate user profile query to refresh 2FA status
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      console.error("Failed to enable 2FA:", error);
      throw error;
    },
  });
};

// Disable 2FA using email OTP approach
export const useDisable2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      // For disabling email OTP 2FA, we need to update the database directly
      const response = await fetch(`${backendURL}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          twoFactorEnabled: false,
          password: password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to disable 2FA");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate user profile query to refresh 2FA status
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      console.error("Failed to disable 2FA:", error);
      throw error;
    },
  });
};

// Toggle 2FA on/off using Better Auth's email OTP methods
export const useToggle2FA = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async ({
      enabled,
      password,
    }: {
      enabled: boolean;
      password?: string;
    }) => {
      if (!user?.user?.email) {
        throw new Error("User email not found");
      }

      if (enabled) {
        // For email OTP 2FA, we don't need to call enable/disable methods
        // The 2FA is enabled when the user verifies the OTP
        // This is just a placeholder to maintain the interface
        return {
          success: true,
          message:
            "2FA setup initiated. Please verify the OTP sent to your email.",
          data: { twoFactorEnabled: false }, // Will be true after OTP verification
        };
      } else {
        // For disabling email OTP 2FA, we need to update the database directly
        // Since Better Auth doesn't have a direct disable method for email OTP
        const response = await fetch(`${backendURL}/api/user/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            twoFactorEnabled: false,
            password: password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to disable 2FA");
        }

        return response.json();
      }
    },
    onSuccess: () => {
      // Invalidate user profile query to refresh 2FA status
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      console.error("Failed to toggle 2FA:", error);
      throw error;
    },
  });
};
