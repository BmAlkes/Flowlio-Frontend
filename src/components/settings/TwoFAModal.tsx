import { FC, useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Switch } from "@/components/ui/switch";
import { Mail, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

interface TwoFAModalProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean, password?: string) => Promise<void>;
  onVerifyOTP: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  onDisable2FA: (password: string) => Promise<void>;
  onClose: () => void;
  userEmail: string;
  open: boolean;
}

export const TwoFAModal: FC<TwoFAModalProps> = ({
  isEnabled,
  onToggle,
  onVerifyOTP,
  onResendOTP,
  onDisable2FA,
  onClose,
  userEmail,
  open,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEnablePasswordForm, setShowEnablePasswordForm] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Create schemas with translations
  const otpSchema = z.object({
    otp: z
      .string()
      .min(6, t("settings.validation.otpMustBe6Digits"))
      .max(6, t("settings.validation.otpMustBe6Digits")),
  });

  const passwordSchema = z.object({
    password: z.string().min(1, t("settings.validation.passwordRequired")),
  });

  const modalProps = useGeneralModalDisclosure({ open });

  // Countdown timer for resend functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (countdown > 0 && !canResend) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown, canResend]);

  // Start countdown when OTP form is shown
  useEffect(() => {
    if (showOTPForm) {
      setCountdown(30); // 30 seconds cooldown
      setCanResend(false);
    }
  }, [showOTPForm]);

  // Effect to close modal and reset states when modal closes
  useEffect(() => {
    if (!open) {
      // Reset all form states when modal closes
      setShowOTPForm(false);
      setShowPasswordForm(false);
      setShowEnablePasswordForm(false);
      setShowSuccessState(false);
      form.reset();
      enablePasswordForm.reset();
      passwordForm.reset();
    } else {
      // When modal opens, automatically show the appropriate form based on 2FA status
      if (isEnabled) {
        // 2FA is enabled - show password form for disabling
        setShowPasswordForm(true);
        setShowOTPForm(false);
        setShowEnablePasswordForm(false);
        setShowSuccessState(false);
      } else {
        // 2FA is disabled - show enable password form
        setShowEnablePasswordForm(true);
        setShowOTPForm(false);
        setShowPasswordForm(false);
        setShowSuccessState(false);
      }
    }
  }, [open, isEnabled]);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const enablePasswordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleToggle = async (enabled: boolean) => {
    // First, notify parent to open the modal (this updates parent's isModalOpen state)
    // Call onToggle without password to just open the modal
    await onToggle(enabled);

    if (enabled && !isEnabled) {
      // Enabling 2FA - show password form first
      setShowEnablePasswordForm(true);
    } else if (!enabled && isEnabled) {
      // Disabling 2FA - show password form
      setShowPasswordForm(true);
    }
  };

  const handleOTPSubmit = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    try {
      await onVerifyOTP(values.otp);
      toast.success(t("settings.twoFactorAuthenticationEnabled"));

      // Show success state
      setShowSuccessState(true);

      // Close modal after showing success
      setTimeout(() => {
        setShowOTPForm(false);
        setShowSuccessState(false);
        onClose(); // Use the callback to close the modal
        form.reset();
      }, 2000); // Wait 2 seconds to show success
    } catch (error) {
      console.error("OTP verification failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("settings.invalidOTP");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnablePasswordSubmit = async (
    values: z.infer<typeof passwordSchema>
  ) => {
    setIsLoading(true);
    try {
      // Call the onToggle prop directly, not the internal handleToggle
      await onToggle(true, values.password);

      toast.success(t("settings.passwordVerifiedDesc"));
      setShowEnablePasswordForm(false);
      setShowOTPForm(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("settings.invalidPasswordDesc");
      toast.error(t("settings.invalidPassword"), {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (
    values: z.infer<typeof passwordSchema>
  ) => {
    setIsLoading(true);
    try {
      await onDisable2FA(values.password);
      toast.success(t("settings.twoFactorAuthenticationDisabled"));
      setShowPasswordForm(false);
      onClose();
      passwordForm.reset();
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      toast.error(t("settings.invalidPasswordDesc"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await onResendOTP();
      setCountdown(30); // 30 seconds cooldown
      setCanResend(false);
      toast.success(t("settings.otpSentDesc"));
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error(t("settings.failedToResendOTPDesc"));
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      form.setValue("otp", value);
    }
  };
  const location = useLocation();
  return (
    <>
      {/* 2FA Switch */}
      <Flex className="justify-between w-full rounded-md max-md:px-3">
        <Stack className={`gap-0`}>
          <span
            className={`text-[#7184B4] ${
              location.pathname === "/superadmin/settings" ? "hidden" : ""
            }`}
          >
            {t("settings.twoFactorAuthentication")}
          </span>
          <h1
            className={`text-md max-md:text-sm ${
              location.pathname === "/superadmin/settings" ? "hidden" : ""
            }`}
          >
            {t("settings.twoFactorAuthenticationDesc")}
          </h1>
        </Stack>
        <Switch
          checked={isEnabled}
          className="cursor-pointer"
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </Flex>

      {/* 2FA Modal */}
      <GeneralModal
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          } else {
            // When modal is opened externally, ensure internal state is synced
            modalProps.onOpenChange(true);
          }
        }}
        contentProps={{
          className: "max-w-md w-[95vw]",
        }}
      >
        {showOTPForm ? (
          // OTP Verification Form
          <Box className="space-y-6">
            <Stack className="gap-4 text-center">
              <Center className="mx-auto w-16 h-16 bg-blue-100 rounded-full">
                <Mail className="w-8 h-8 text-blue-600" />
              </Center>
              <Stack className="gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("settings.verifyYourEmail")}
                </h2>
                <p className="text-gray-600">
                  {t("settings.verifyYourEmailDesc")}
                </p>
                <p className="font-semibold text-gray-900">{userEmail}</p>
              </Stack>
            </Stack>

            <form
              onSubmit={form.handleSubmit(handleOTPSubmit)}
              className="space-y-4"
            >
              <Stack className="gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("settings.enterVerificationCode")}
                </label>
                <Input
                  {...form.register("otp")}
                  onChange={handleOTPChange}
                  value={form.watch("otp")}
                  className="text-center text-xl font-mono tracking-widest h-12"
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
                {form.formState.errors.otp && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.otp.message}
                  </p>
                )}
              </Stack>

              <Center>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResend}
                  disabled={!canResend || isLoading}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {canResend
                    ? t("settings.resendCode")
                    : `${t("settings.resendIn")} ${countdown}s`}
                </Button>
              </Center>

              <Flex className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowOTPForm(false);
                    onClose();
                    form.reset();
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t("settings.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || form.watch("otp").length !== 6}
                >
                  {isLoading
                    ? t("settings.verifying")
                    : t("settings.verifyAndEnable")}
                </Button>
              </Flex>
            </form>
          </Box>
        ) : showEnablePasswordForm ? (
          // Password Verification Form for Enabling 2FA
          <Box className="space-y-6">
            <Stack className="gap-4 text-center">
              <Center className="mx-auto w-16 h-16 bg-blue-100 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </Center>
              <Stack className="gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("settings.enableTwoFactorAuthentication")}
                </h2>
                <p className="text-gray-600">
                  {t("settings.enableTwoFactorAuthenticationDesc")}
                </p>
              </Stack>
            </Stack>

            <form
              onSubmit={enablePasswordForm.handleSubmit(
                handleEnablePasswordSubmit
              )}
              className="space-y-4"
            >
              <Stack className="gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("settings.password")}
                </label>
                <Input
                  {...enablePasswordForm.register("password")}
                  type="password"
                  placeholder={t("settings.enterYourPassword")}
                  className="w-full"
                />
                {enablePasswordForm.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {enablePasswordForm.formState.errors.password.message}
                  </p>
                )}
              </Stack>

              <Flex className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEnablePasswordForm(false);
                    onClose();
                    enablePasswordForm.reset();
                  }}
                >
                  {t("settings.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("settings.verifying")
                    : t("settings.verifyAndContinue")}
                </Button>
              </Flex>
            </form>
          </Box>
        ) : showSuccessState ? (
          // Success State
          <Box className="space-y-6">
            <Stack className="gap-4 text-center">
              <Center className="mx-auto w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </Center>
              <Stack className="gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("settings.success")}
                </h2>
                <p className="text-gray-600">
                  {t("settings.twoFactorAuthenticationEnabledDesc")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("settings.twoFactorAuthenticationEnabledDesc2")}
                </p>
              </Stack>
            </Stack>
          </Box>
        ) : showPasswordForm ? (
          // Password Verification Form for Disabling 2FA
          <Box className="space-y-6">
            <Stack className="gap-4 text-center">
              <Center className="mx-auto w-16 h-16 bg-red-100 rounded-full">
                <Shield className="w-8 h-8 text-red-600" />
              </Center>
              <Stack className="gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {t("settings.disableTwoFactorAuthentication")}
                </h2>
                <p className="text-gray-600">
                  {t("settings.disableTwoFactorAuthenticationDesc")}
                </p>
              </Stack>
            </Stack>

            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-4"
            >
              <Stack className="gap-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("settings.enterYourPassword")}
                </label>
                <Input
                  {...passwordForm.register("password")}
                  type="password"
                  placeholder={t("settings.enterYourPassword")}
                  className="text-center h-12"
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-red-500 text-sm text-center">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </Stack>

              <Flex className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    onClose();
                    passwordForm.reset();
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t("settings.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading || !passwordForm.watch("password")}
                >
                  {isLoading
                    ? t("settings.disabling")
                    : t("settings.disable2FA")}
                </Button>
              </Flex>
            </form>
          </Box>
        ) : (
          // 2FA Status Display
          <Box className="space-y-6">
            <Stack className="gap-4 text-center">
              <Center className="mx-auto w-16 h-16 bg-green-100 rounded-full">
                {isEnabled ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <Shield className="w-8 h-8 text-gray-600" />
                )}
              </Center>
              <Stack className="gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEnabled
                    ? t("settings.twoFactorAuthenticationEnabled")
                    : t("settings.twoFactorAuthenticationDisabled")}
                </h2>
                <p className="text-gray-600">
                  {isEnabled
                    ? t("settings.twoFactorAuthenticationEnabledDesc")
                    : t("settings.twoFactorAuthenticationDisabledDesc")}
                </p>
              </Stack>
            </Stack>

            <Flex className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose()}
                className="flex-1"
              >
                {t("settings.close")}
              </Button>
              {!isEnabled && (
                <Button
                  type="button"
                  onClick={() => handleToggle(true)}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t("settings.enable2FA")}
                </Button>
              )}
            </Flex>
          </Box>
        )}
      </GeneralModal>
    </>
  );
};
