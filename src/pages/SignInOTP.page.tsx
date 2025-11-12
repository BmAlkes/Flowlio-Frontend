import { FC, useEffect, useState, useRef } from "react";
import { OTPSignIn } from "@/components/auth/OTPSignIn";
import {
  useGenerateSignInOTP,
  useVerifySignInOTP,
} from "@/hooks/useBetterAuthTwoFA";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { getRoleBasedRedirectPathAfterLogin } from "@/utils/sessionPersistence.util";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";

interface SignInOTPPageProps {
  email?: string;
  onBack?: () => void;
}

export const SignInOTPPage: FC<SignInOTPPageProps> = ({
  email: propEmail,
  onBack: propOnBack,
}) => {
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const [email, setEmail] = useState<string>("");
  const generateOTPMutation = useGenerateSignInOTP();
  const verifyOTPMutation = useVerifySignInOTP();
  const otpSentRef = useRef<boolean>(false);

  useEffect(() => {
    // Get email from sessionStorage or props
    const storedEmail = sessionStorage.getItem("otpEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (propEmail) {
      setEmail(propEmail);
    } else {
      // No email found, redirect back to sign-in
      navigate("/auth/signin");
    }
  }, [propEmail, navigate]);

  // Automatically send OTP when email is available (only once)
  useEffect(() => {
    if (email && !otpSentRef.current) {
      otpSentRef.current = true; // Mark as sent
      generateOTPMutation.mutate({ email });
    }

    // Cleanup function to reset ref when component unmounts
    return () => {
      otpSentRef.current = false;
    };
  }, [email]);

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      // Clear stored email and go back to sign-in
      sessionStorage.removeItem("otpEmail");
    }
  };

  const handleVerify = async (otp: string) => {
    try {
      await verifyOTPMutation.mutateAsync({ email, otp });
      toast.success("Login successful!");

      // Clear stored email
      sessionStorage.removeItem("otpEmail");

      try {
        // Wait for Better Auth session to be established
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch user profile to get role for role-based redirection
        const profileResponse = await axios.get("/user/profile");

        // Check if organization is deactivated or trial expired
        if (profileResponse.status === 403) {
          const errorCode = profileResponse.data?.code;
          if (
            errorCode === "ORGANIZATION_DEACTIVATED" ||
            errorCode === "TRIAL_EXPIRED"
          ) {
            const errorMessage =
              profileResponse.data?.message ||
              "Access denied. Please contact the administrator for assistance.";
            toast.error(errorMessage);

            // Log out the user session that was created
            try {
              const { authClient } = await import("@/providers/user.provider");
              await authClient.signOut();
            } catch (signOutError) {
              console.error("Error signing out:", signOutError);
            }

            navigate("/auth/signin");
            return;
          }
        }

        const userProfile = profileResponse.data.data;
        const userRole = userProfile.role;

        // Get comprehensive role-based redirect path
        const redirectPath = getRoleBasedRedirectPathAfterLogin(userRole);

        // Refresh user context, then client-side navigate without reload
        await refetchUser();
        navigate(redirectPath, { replace: true });
      } catch (error: any) {
        console.error("Error fetching user profile for redirection:", error);

        // Check if organization is deactivated or trial expired
        if (error?.response?.status === 403) {
          const errorCode = error?.response?.data?.code;
          if (
            errorCode === "ORGANIZATION_DEACTIVATED" ||
            errorCode === "TRIAL_EXPIRED"
          ) {
            const errorMessage =
              error?.response?.data?.message ||
              "Access denied. Please contact the administrator for assistance.";
            toast.error(errorMessage);

            // Log out the user session that was created
            try {
              const { authClient } = await import("@/providers/user.provider");
              await authClient.signOut();
            } catch (signOutError) {
              console.error("Error signing out:", signOutError);
            }

            navigate("/auth/signin");
            return;
          }
        }

        // Fallback to default dashboard if profile fetch fails
        await refetchUser();
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  };

  const handleResend = async () => {
    try {
      await generateOTPMutation.mutateAsync({ email });
      toast.success("OTP sent to your email");
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      throw error;
    }
  };

  if (!email) {
    return <div>Loading...</div>;
  }

  return (
    <OTPSignIn
      email={email}
      onBack={handleBack}
      onVerify={handleVerify}
      onResend={handleResend}
      isLoading={verifyOTPMutation.isPending || generateOTPMutation.isPending}
    />
  );
};
