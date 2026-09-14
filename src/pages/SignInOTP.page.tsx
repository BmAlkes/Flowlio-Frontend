import { FC, useEffect, useState, useRef } from "react";
import { OTPSignIn } from "@/components/auth/OTPSignIn";
import {
  useGenerateSignInOTP,
  useVerifySignInOTP,
} from "@/hooks/useBetterAuthTwoFA";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { getRoleBasedRedirectPathAfterLogin } from "@/utils/sessionPersistence.util";
import { fetchUserProfile } from "@/hooks/useuserprofile";
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
  const secondFactor = sessionStorage.getItem("otpSecondFactor") === "true";
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
      generateOTPMutation.mutate(
        { email, secondFactor },
        {
          onError: (error) =>
            toast.error(
              error.message || "Failed to send OTP. Please try again.",
            ),
        },
      );
    }
  }, [email, secondFactor, generateOTPMutation]);

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
      const session = await verifyOTPMutation.mutateAsync({
        email,
        otp,
        secondFactor,
      });
      const response = await fetchUserProfile(session.user.id);
      const profile = response.data!;
      await refetchUser();
      sessionStorage.removeItem("otpEmail");
      sessionStorage.removeItem("otpSecondFactor");
      navigate("/auth/signin", { replace: true });
      sessionStorage.removeItem("otpSecondFactor");
      toast.success("Login successful!");
      navigate(
        profile.status === "pending"
          ? profile.selectedPlanId
            ? "/checkout"
            : "/pricing"
          : getRoleBasedRedirectPathAfterLogin(profile.role),
        {
          replace: true,
          state:
            profile.status === "pending"
              ? {
                  planId: profile.selectedPlanId,
                  ...profile.pendingOrganizationData,
                }
              : undefined,
        },
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Sign-in failed. Please try again.",
      );
      throw error;
    }
  };

  const handleResend = async () => {
    try {
      await generateOTPMutation.mutateAsync({ email, secondFactor });
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
