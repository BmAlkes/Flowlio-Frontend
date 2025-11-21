import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useUser } from "@/providers/user.provider";
import { backendURL } from "@/configs/axios.config";

// Generate OTP for sign-in (no user context required)
export const useGenerateSignInOTP = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "email-verification",
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to send OTP");
      }

      return result.data;
    },
    onError: (error: any) => {
      console.error("Failed to generate sign-in OTP:", error);
      throw error;
    },
  });
};

// Verify OTP for sign-in (no user context required)
export const useVerifySignInOTP = () => {
  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      // For sign-in with OTP, we need to use the correct Better Auth flow
      try {
        // First verify the OTP
        const verifyResult = await authClient.emailOtp.verifyEmail({
          email: email,
          otp: otp,
        });

        if (verifyResult.error) {
          throw new Error(
            verifyResult.error.message || "Invalid or expired OTP"
          );
        }

        // After successful OTP verification, we need to establish a session
        // The backend should handle session creation after OTP verification
        // Let's wait a moment and then check for session
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          const sessionResult = await authClient.getSession();

          if (sessionResult.data) {
            return sessionResult.data;
          } else {
            // Try to use the regular sign-in method with OTP as password
            try {
              const signInResult = await authClient.signIn.email({
                email: email,
                password: otp, // Use OTP as password
              });

              if (signInResult.data) {
                return signInResult.data;
              } else {
                console.log(
                  `⚠️ Sign-in with OTP failed, trying session refresh...`
                );

                // Fallback: try to refresh the session
                const refreshResult = await authClient.getSession();

                if (refreshResult.data) {
                  return refreshResult.data;
                } else {
                  return verifyResult.data;
                }
              }
            } catch (signInError) {
              console.error(`❌ Sign-in with OTP failed:`, signInError);

              // Fallback: try to refresh the session
              const refreshResult = await authClient.getSession();

              if (refreshResult.data) {
                return refreshResult.data;
              } else {
                return verifyResult.data;
              }
            }
          }
        } catch (sessionError) {
          console.error(`❌ Session handling failed:`, sessionError);
          return verifyResult.data;
        }
      } catch (error) {
        console.error(`❌ Sign-in OTP verification error:`, error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error("Failed to verify sign-in OTP:", error);
      throw error;
    },
  });
};

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

// Verify OTP for 2FA using better-auth client
export const useVerifyOTP = () => {
  const { data: user } = useUser();

  return useMutation({
    mutationFn: async ({ otp }: { otp: string }) => {
      if (!user?.user?.email) {
        throw new Error("User email not found");
      }

      // Try different verification approaches
      try {
        const result = await authClient.emailOtp.verifyEmail({
          email: user.user.email,
          otp: otp,
        });

        if (result.error) {
          try {
            const signInResult = await authClient.signIn.emailOtp({
              email: user.user.email,
              otp: otp,
            });

            if (signInResult.error) {
              throw new Error(
                signInResult.error.message || "Invalid or expired OTP"
              );
            }

            return signInResult.data;
          } catch (signInError) {
            console.error(`❌ SignIn OTP also failed:`, signInError);
            throw new Error(result.error.message || "Invalid or expired OTP");
          }
        }

        return result.data;
      } catch (error) {
        console.error(`❌ OTP verification error:`, error);
        throw error;
      }
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
