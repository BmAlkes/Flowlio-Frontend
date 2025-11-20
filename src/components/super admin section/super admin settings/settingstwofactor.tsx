import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { TwoFAModal } from "@/components/settings/TwoFAModal";
import {
  useVerifyOTP,
  useGenerateOTP,
  useDisable2FA,
  useEnable2FA,
} from "@/hooks/useBetterAuthTwoFA";
import { useUser } from "@/providers/user.provider";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export const SettingsTwoFactor = () => {
  const { data: userData } = useUser();
  const queryClient = useQueryClient();
  const verifyOTPMutation = useVerifyOTP();
  const generateOTPMutation = useGenerateOTP();
  const disable2FAMutation = useDisable2FA();
  const enable2FAMutation = useEnable2FA();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get 2FA status from user data
  const is2FAEnabled = userData?.user?.twoFactorEnabled || false;

  // Local state for immediate 2FA status updates (real-time UI feedback)
  const [local2FAStatus, setLocal2FAStatus] = useState<boolean>(is2FAEnabled);

  // Update local state when user data changes
  useEffect(() => {
    if (userData?.user?.twoFactorEnabled !== undefined) {
      setLocal2FAStatus(userData.user.twoFactorEnabled || false);
    }
  }, [userData?.user?.twoFactorEnabled]);

  // 2FA handlers
  const handleToggle2FA = async (enabled: boolean, password?: string) => {
    try {
      if (enabled) {
        if (password) {
          // Password provided - verify it and generate OTP
          await generateOTPMutation.mutateAsync();
        } else {
          // Generate OTP when enabling 2FA
          await generateOTPMutation.mutateAsync();
        }
      } else {
        // Disable 2FA directly
        await disable2FAMutation.mutateAsync({ password: password || "" });
        // Immediately update local state for instant UI feedback
        setLocal2FAStatus(false);
        // Close modal after successful disable
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to toggle 2FA:", error);
      toast.error("Failed to update 2FA settings. Please try again.");
      throw error;
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      await verifyOTPMutation.mutateAsync({ otp });
      // After successful OTP verification, enable 2FA by updating the database
      await enable2FAMutation.mutateAsync();
      // Immediately update local state for instant UI feedback
      setLocal2FAStatus(true);
      // Refresh user data to reflect the new 2FA status
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Close modal after successful enable
      setIsModalOpen(false);
    } catch (error) {
      console.error("OTP verification failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "OTP verification failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleResendOTP = async () => {
    try {
      await generateOTPMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      throw error;
    }
  };

  const handleDisable2FA = async (password: string) => {
    try {
      await disable2FAMutation.mutateAsync({ password });
      // Immediately update local state for instant UI feedback
      setLocal2FAStatus(false);
      // Refresh user data to reflect the new 2FA status
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Close modal after successful disable
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Wrapper to handle toggle and open modal
  const handleToggleWithModal = async (enabled: boolean, password?: string) => {
    // If password is provided, it means we're in the flow (password verified, etc.)
    // Otherwise, this is the initial switch click - just open the modal
    if (password !== undefined) {
      // Password provided means we're in the flow - handle the actual toggle
      await handleToggle2FA(enabled, password);
    } else {
      // Initial switch click - just open the modal
      // The modal's handleToggle will handle showing the password form
      setIsModalOpen(true);
    }
  };

  return (
    <Flex className="justify-between w-full bg-white border border-gray-400/50 p-8 rounded-md max-md:px-3">
      <Stack className="w-full">
        <h1 className="text-3xl font-semibold max-sm:text-xl">
          Two-Factor Authentication (2FA)
        </h1>
        <h1 className="max-md:text-xs">
          Choose Two-Factor Authentication (2FA) option for smart security
        </h1>
      </Stack>

      <TwoFAModal
        open={isModalOpen}
        isEnabled={local2FAStatus}
        onToggle={handleToggleWithModal}
        onVerifyOTP={handleVerifyOTP}
        onResendOTP={handleResendOTP}
        onDisable2FA={handleDisable2FA}
        onClose={handleCloseModal}
        userEmail={userData?.user?.email || ""}
      />
    </Flex>
  );
};
