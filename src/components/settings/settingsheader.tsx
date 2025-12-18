import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Stack } from "@/components/ui/stack";
import { Center } from "@/components/ui/center";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { IoMdLock, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Box } from "@/components/ui/box";
import { Switch } from "@/components/ui/switch";
import React, { useRef, useState, useEffect } from "react";
import { useUser } from "@/providers/user.provider";
import { useUpdateUserProfile } from "@/hooks/useupdateuserprofile";
import { useUpdateProfileImage } from "@/hooks/useupdateprofileimage";
import { toast } from "sonner";
import { TwoFAModal } from "./TwoFAModal";
import {
  useVerifyOTP,
  useGenerateOTP,
  useDisable2FA,
  useEnable2FA,
} from "@/hooks/useBetterAuthTwoFA";
import { useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { authClient } from "@/lib/auth-client";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

const settingsSchema = z
  .object({
    avatar: z.any().optional(),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    address: z.string().optional(),
    currentpassword: z.string().optional(),
    newpassword: z.string().optional(),
    confirmpassword: z.string().optional(),
    paymentAlertNotifications: z.boolean(),
    invoiceRemindersNotifications: z.boolean(),
    projectActivityUpdatesNotifications: z.boolean(),
  })
  .refine(
    (data) => {
      // If any password field is filled, all must be filled and valid
      if (data.currentpassword || data.newpassword || data.confirmpassword) {
        return data.currentpassword && data.newpassword && data.confirmpassword;
      }
      return true;
    },
    {
      message: "If changing password, all password fields must be filled.",
      path: ["currentpassword"],
    }
  )
  .refine(
    (data) => {
      // If password fields are filled, validate their lengths
      if (data.currentpassword) {
        return (
          data.currentpassword.length >= 8 && data.currentpassword.length <= 12
        );
      }
      return true;
    },
    {
      message: "Current password must be 8-12 characters long.",
      path: ["currentpassword"],
    }
  )
  .refine(
    (data) => {
      // If password fields are filled, validate their lengths
      if (data.newpassword) {
        return data.newpassword.length >= 8 && data.newpassword.length <= 12;
      }
      return true;
    },
    {
      message: "New password must be 8-12 characters long.",
      path: ["newpassword"],
    }
  )
  .refine(
    (data) => {
      // If password fields are filled, validate their lengths
      if (data.confirmpassword) {
        return (
          data.confirmpassword.length >= 8 && data.confirmpassword.length <= 12
        );
      }
      return true;
    },
    {
      message: "Confirm password must be 8-12 characters long.",
      path: ["confirmpassword"],
    }
  )
  .refine(
    (data) => {
      // If password fields are filled, new and confirm must match
      if (data.newpassword && data.confirmpassword) {
        return data.newpassword === data.confirmpassword;
      }
      return true;
    },
    {
      message: "New password and confirm password must match.",
      path: ["confirmpassword"],
    }
  );

export const SettingsHeader = () => {
  const { t } = useTranslation();
  const { data: userData, isLoading } = useUser();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateUserProfile();
  const updateProfileImageMutation = useUpdateProfileImage();
  const verifyOTPMutation = useVerifyOTP();
  const generateOTPMutation = useGenerateOTP();
  const disable2FAMutation = useDisable2FA();
  const enable2FAMutation = useEnable2FA();

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get 2FA status from user data
  const is2FAEnabled = userData?.user?.twoFactorEnabled || false;

  // Local state for immediate 2FA status updates
  const [local2FAStatus, setLocal2FAStatus] = useState<boolean>(is2FAEnabled);

  // Update local state when user data changes
  useEffect(() => {
    if (userData?.user?.twoFactorEnabled !== undefined) {
      setLocal2FAStatus(userData.user.twoFactorEnabled || false);
    }
  }, [userData?.user?.twoFactorEnabled]);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      avatar: undefined,
      fullName: "",
      email: "",
      phone: "",
      address: "",
      currentpassword: "",
      newpassword: "",
      confirmpassword: "",
      paymentAlertNotifications: true,
      invoiceRemindersNotifications: true,
      projectActivityUpdatesNotifications: true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Update form with user data when available
  useEffect(() => {
    if (userData?.user) {
      setValue("fullName", userData.user.name || "");
      setValue("email", userData.user.email || "");
      setValue("phone", userData.user.phone || "");
      setValue("address", userData.user.address || "");
      if (userData.user.image) {
        setAvatarPreview(userData.user.image);
      }

      // Initialize notification preferences from database
      const prefs = userData.user.notificationPreferences || {
        paymentAlerts: true,
        invoiceReminders: true,
        projectActivityUpdates: true,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
      };
      setValue("paymentAlertNotifications", prefs.paymentAlerts ?? true);
      setValue("invoiceRemindersNotifications", prefs.invoiceReminders ?? true);
      setValue(
        "projectActivityUpdatesNotifications",
        prefs.projectActivityUpdates ?? true
      );
    }
  }, [userData, setValue]);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA modal state
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    try {
      // Update profile image if a new one was selected
      if (values.avatar && values.avatar instanceof File) {
        await updateProfileImageMutation.mutateAsync({ image: values.avatar });
        toast.success("Profile image updated successfully!");
      }

      // Note: Password changes are now handled separately via the dedicated password change button

      // Update profile information (name, email, phone, address)
      const profileData = {
        name: values.fullName,
        email: values.email,
        phone: values.phone && values.phone.trim() !== "" ? values.phone : "",
        address:
          values.address && values.address.trim() !== "" ? values.address : "",
      };

      await updateProfileMutation.mutateAsync(profileData);

      // Password fields are cleared separately in the password change handl  er

      // Force refetch user data to ensure form is updated
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        errorObject: error,
      });

      // Check if it's an axios error with response data
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        console.error("❌ Axios error response:", axiosError.response);
      }

      toast.error("Failed to update profile. Please try again.");
    }
  }

  // Handle file selection
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setAvatarPreview(undefined);
    setValue("avatar", undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      }
    } catch (error) {
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
    } catch (error) {
      console.error("OTP verification failed:", error);
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
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      throw error;
    }
  };

  // Notification toggle handlers with toast messages
  const handlePaymentAlertsToggle = async (enabled: boolean) => {
    try {
      setValue("paymentAlertNotifications", enabled);

      // Get current preferences and update paymentAlerts
      const currentPrefs = userData?.user?.notificationPreferences || {};
      const updatedPrefs = {
        ...currentPrefs,
        paymentAlerts: enabled,
      };

      // Save to database
      await axios.patch("/user/profile", {
        notificationPreferences: updatedPrefs,
      });

      // Refresh user data to reflect the new notification preferences
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      if (enabled) {
        toast.success(
          "🔔 Payment alerts enabled! You'll receive notifications for transactions and overdue payments."
        );
      } else {
        toast.info(
          "🔕 Payment alerts disabled. You won't receive payment notifications."
        );
      }
    } catch (error) {
      console.error("Failed to update payment alerts:", error);
      // Revert the toggle on error
      setValue("paymentAlertNotifications", !enabled);
      toast.error(
        "Failed to update payment alert preferences. Please try again."
      );
    }
  };

  const handleInvoiceRemindersToggle = async (enabled: boolean) => {
    try {
      setValue("invoiceRemindersNotifications", enabled);

      // Get current preferences and update invoiceReminders
      const currentPrefs = userData?.user?.notificationPreferences || {};
      const updatedPrefs = {
        ...currentPrefs,
        invoiceReminders: enabled,
      };

      // Save to database
      await axios.patch("/user/profile", {
        notificationPreferences: updatedPrefs,
      });

      // Refresh user data to reflect the new notification preferences
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      if (enabled) {
        toast.success(
          "📧 Invoice reminders enabled! You'll be notified about upcoming due dates and pending payments."
        );
      } else {
        toast.info(
          "🔕 Invoice reminders disabled. You won't receive invoice notifications."
        );
      }
    } catch (error) {
      console.error("Failed to update invoice reminders:", error);
      // Revert the toggle on error
      setValue("invoiceRemindersNotifications", !enabled);
      toast.error(
        "Failed to update invoice reminder preferences. Please try again."
      );
    }
  };

  const handleProjectUpdatesToggle = async (enabled: boolean) => {
    try {
      setValue("projectActivityUpdatesNotifications", enabled);

      // Get current preferences and update projectActivityUpdates
      const currentPrefs = userData?.user?.notificationPreferences || {};
      const updatedPrefs = {
        ...currentPrefs,
        projectActivityUpdates: enabled,
      };

      // Save to database
      await axios.patch("/user/profile", {
        notificationPreferences: updatedPrefs,
      });

      // Refresh user data to reflect the new notification preferences
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      if (enabled) {
        toast.success(
          "🚀 Project activity updates enabled! You'll receive alerts on project changes and task assignments."
        );
      } else {
        toast.info(
          "🔕 Project activity updates disabled. You won't receive project notifications."
        );
      }
    } catch (error) {
      console.error("Failed to update project updates:", error);
      // Revert the toggle on error
      setValue("projectActivityUpdatesNotifications", !enabled);
      toast.error(
        "Failed to update project activity preferences. Please try again."
      );
    }
  };

  // Password strength calculation
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = (password: string): string => {
    const strength = getPasswordStrength(password);
    switch (strength) {
      case 0:
      case 1:
        return "Very weak";
      case 2:
        return "Weak";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  // Separate password change handler
  const handlePasswordChange = async () => {
    const currentPassword = watch("currentpassword");
    const newPassword = watch("newpassword");
    const confirmPassword = watch("confirmpassword");

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const { error } = await authClient.changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        revokeOtherSessions: true, // Log out from all other devices for security
      });

      if (error) {
        toast.error(
          (error as any)?.message ||
            "Failed to change password. Please check your current password."
        );
        return;
      }

      toast.success(
        "Password changed successfully! You will be logged out from other devices for security."
      );

      // Clear password fields
      setValue("currentpassword", "");
      setValue("newpassword", "");
      setValue("confirmpassword", "");

      // Refresh user data
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (passwordError) {
      console.error("❌ Password change failed:", passwordError);
      toast.error("Failed to change password. Please try again.");
    }
  };

  // Show loading state while user data is being fetched
  if (isLoading || !userData?.user) {
    return (
      <ComponentWrapper className="mt-8 px-6 py-5 max-md:px-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper className="mt-8 px-6 py-5 max-md:px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Center className="justify-between max-sm:flex-col max-sm:items-start gap-2">
          <Stack className="gap-0">
            <h1 className="text-2xl font-medium">{t("settings.title")}</h1>
            <h1 className="text-gray-500 font-normal">
              {t("settings.subtitle")}
            </h1>
          </Stack>
          <Button
            type="submit"
            variant="outline"
            className="bg-black text-white border border-gray-200 rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer h-11"
            disabled={
              updateProfileMutation.isPending ||
              updateProfileImageMutation.isPending
            }
          >
            {updateProfileMutation.isPending ||
            updateProfileImageMutation.isPending
              ? t("common.saving")
              : t("settings.saveChanges")}
          </Button>
        </Center>

        <Stack className="gap-8 mt-4">
          <Stack className="w-full bg-white border-1 border-gray-200 p-8 rounded-xl max-md:px-3 ">
            <h1 className="text-xl font-medium">{t("settings.userProfile")}</h1>

            <Flex className="justify-between w-xs max-sm:w-full">
              <img
                src={
                  avatarPreview || userData?.user?.image || "/dashboard/1.svg"
                }
                alt="Profile"
                className="rounded-full bg-cover bg-center w-26 h-26 border-2 border-dashed border-gray-600"
              />

              <Flex className="flex-col gap-2">
                <Button
                  type="button"
                  className="bg-black text-white rounded-full flex items-center gap-2 cursor-pointer h-10 w-30 hover:bg-black/80"
                  onClick={handleChooseFile}
                  disabled={updateProfileImageMutation.isPending}
                >
                  {updateProfileImageMutation.isPending
                    ? t("settings.uploading")
                    : t("settings.chooseFile")}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  className="bg-[#DDDDDD] text-black rounded-full flex items-center gap-2 cursor-pointer h-10 w-30 hover:bg-[#DDDDDD]/80 hover:text-white"
                  onClick={handleRemove}
                  disabled={
                    !avatarPreview || updateProfileImageMutation.isPending
                  }
                >
                  {t("settings.remove")}
                </Button>
              </Flex>
            </Flex>

            <Flex className="justify-between gap-6 w-full max-sm:flex-col">
              <Flex className="mt-4 w-3xl max-sm:w-full flex-1 flex-col gap-4">
                <Input
                  className="bg-white rounded-full"
                  size="lg"
                  type="text"
                  placeholder={t("settings.fullName")}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <span className="text-red-500 text-xs">
                    {errors.fullName.message as string}
                  </span>
                )}

                <Input
                  className="bg-white rounded-full"
                  size="lg"
                  type="text"
                  placeholder={t("settings.phone")}
                  {...register("phone")}
                />

                <Input
                  className="bg-white rounded-full"
                  size="lg"
                  type="text"
                  placeholder={t("settings.address")}
                  {...register("address")}
                />

                <Flex className="w-full relative border border-gray-200 rounded-full">
                  <Input
                    className="bg-white rounded-full relative"
                    size="lg"
                    disabled
                    type="email"
                    placeholder={t("settings.email")}
                    {...register("email")}
                  />
                  <IoMdLock className="size-6 text-gray-500 absolute right-4 top-3 " />
                </Flex>
                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message as string}
                  </span>
                )}
              </Flex>
              <LanguageSwitcher />
            </Flex>
          </Stack>

          {/* Security Settings Section */}
          <Stack className="w-full bg-white border-1 border-gray-200 p-8 rounded-xl max-md:px-3">
            <h1 className="text-2xl font-semibold">
              {t("settings.securitySettings")}
            </h1>

            <Box className=" bg-[#f6fcfe] border border-white mt-4 min-h-6 w-3xl p-4 rounded-md max-md:w-full max-md:text-xs">
              <p className="text-sm text-gray-600">
                <strong>{t("settings.profileUpdates")}:</strong>{" "}
                {t("settings.profileUpdatesDesc")}
                <br />
                <strong>{t("settings.passwordChanges")}:</strong>{" "}
                {t("settings.passwordChangesDesc")}
              </p>
            </Box>
          </Stack>

          {/* Dedicated Password Change Section */}
          <Stack className="w-full bg-white border-1 border-gray-200 p-8 rounded-xl max-md:px-3">
            <h1 className="text-2xl font-semibold">
              {t("settings.passwordSecurity")}
            </h1>

            <Box className="bg-yellow-50 border border-yellow-200 mt-4 min-h-6 w-3xl p-4 rounded-md max-md:w-full max-md:text-xs">
              <p className="text-sm text-yellow-800">
                <strong>🔒 {t("settings.securityNotice")}:</strong>{" "}
                {t("settings.securityNoticeDesc")}
                <br />
                <strong>💡 {t("settings.tip")}:</strong> {t("settings.tipDesc")}
              </p>
            </Box>

            <Box className="mt-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                {t("settings.changePassword")}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {t("settings.changePasswordDesc")}
              </p>

              <Stack className="gap-6 w-3xl max-md:w-full">
                {/* Current Password Field with Eye Icon */}
                <Box className="relative">
                  <Input
                    className="bg-white rounded-full pr-12"
                    size="lg"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder={t("settings.currentPassword")}
                    {...register("currentpassword")}
                  />
                  <Button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none cursor-pointer bg-transparent hover:bg-transparent shadow-none"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <IoMdEye size={22} />
                    ) : (
                      <IoMdEyeOff size={22} />
                    )}
                  </Button>
                </Box>
                {errors.currentpassword && (
                  <span className="text-red-500 text-xs">
                    {errors.currentpassword.message as string}
                  </span>
                )}
                {/* New Password Field with Eye Icon */}
                <Box className="relative">
                  <Input
                    className="bg-white rounded-full pr-12"
                    placeholder={t("settings.newPassword")}
                    type={showNewPassword ? "text" : "password"}
                    size="lg"
                    {...register("newpassword")}
                  />
                  <Button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none cursor-pointer bg-transparent hover:bg-transparent shadow-none"
                    onClick={() => setShowNewPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <IoMdEye size={22} />
                    ) : (
                      <IoMdEyeOff size={22} />
                    )}
                  </Button>
                </Box>
                {errors.newpassword && (
                  <span className="text-red-500 text-xs">
                    {errors.newpassword.message as string}
                  </span>
                )}
                {/* Confirm Password Field with Eye Icon */}
                <Box className="relative">
                  <Input
                    className="bg-white rounded-full pr-12"
                    placeholder={t("settings.confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    size="lg"
                    {...register("confirmpassword")}
                  />
                  <Button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none cursor-pointer bg-transparent hover:bg-transparent shadow-none"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <IoMdEye size={22} />
                    ) : (
                      <IoMdEyeOff size={22} />
                    )}
                  </Button>
                </Box>
                {errors.confirmpassword && (
                  <span className="text-red-500 text-xs">
                    {errors.confirmpassword.message as string}
                  </span>
                )}

                {/* Password Strength Indicator */}
                {watch("newpassword") && (
                  <Box className="mt-2">
                    <div className="text-xs text-gray-600 mb-2">
                      {t("settings.passwordStrength")}:
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            getPasswordStrength(watch("newpassword") ?? "") >=
                            level
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getPasswordStrengthText(watch("newpassword") ?? "")}
                    </p>
                  </Box>
                )}

                {/* Separate Password Change Button */}
                <Flex className="justify-end mt-6">
                  <Button
                    type="button"
                    className="bg-red-600 text-white rounded-full px-8 py-3 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    onClick={handlePasswordChange}
                    disabled={
                      !watch("currentpassword") ||
                      !watch("newpassword") ||
                      !watch("confirmpassword") ||
                      watch("newpassword") !== watch("confirmpassword")
                    }
                  >
                    🔒 {t("settings.changePassword")}
                  </Button>
                </Flex>
              </Stack>
            </Box>

            <Box className="mt-12">
              <h1 className="text-xl font-semibold">
                {t("settings.notificationPreferences")}
              </h1>

              <Stack className="gap-6 mt-8 w-3xl max-sm:w-full">
                <Flex className="justify-between w-full rounded-md max-md:px-3">
                  <Stack className="gap-0">
                    <span className="text-[#7184B4]">
                      {t("settings.paymentAlerts")}
                    </span>
                    <h1 className="text-md max-md:text-sm">
                      {t("settings.paymentAlertsDesc")}
                    </h1>
                  </Stack>
                  <Switch
                    checked={watch("paymentAlertNotifications")}
                    className="cursor-pointer"
                    color="red"
                    onCheckedChange={handlePaymentAlertsToggle}
                  />
                </Flex>
                <Flex className="justify-between w-full rounded-md max-md:px-3">
                  <Stack className="gap-0">
                    <span className="text-[#7184B4]">
                      {t("settings.invoiceReminders")}
                    </span>
                    <h1 className="text-md max-md:text-sm">
                      {t("settings.invoiceRemindersDesc")}
                    </h1>
                  </Stack>
                  <Switch
                    className="cursor-pointer"
                    checked={watch("invoiceRemindersNotifications")}
                    onCheckedChange={handleInvoiceRemindersToggle}
                  />
                </Flex>
                <Flex className="justify-between w-full rounded-md max-md:px-3">
                  <Stack className="gap-0">
                    <span className="text-[#7184B4]">
                      {t("settings.projectActivityUpdates")}
                    </span>
                    <h1 className="text-md max-md:text-sm">
                      {t("settings.projectActivityUpdatesDesc")}
                    </h1>
                  </Stack>
                  <Switch
                    className="cursor-pointer"
                    checked={watch("projectActivityUpdatesNotifications")}
                    onCheckedChange={handleProjectUpdatesToggle}
                  />
                </Flex>

                {/* Two-Factor Authentication Section */}
                <Flex className="items-center justify-between w-full py-4 border-t border-gray-200">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      {t("settings.twoFactorAuthentication")}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {local2FAStatus
                        ? t("settings.twoFactorAuthenticationDesc")
                        : t("settings.twoFactorAuthenticationDesc2")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className={`rounded-full px-4 py-2 cursor-pointer transition-all duration-200 font-medium ${
                      local2FAStatus
                        ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                        : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                    }`}
                    onClick={() => setShowTwoFAModal(true)}
                  >
                    {local2FAStatus
                      ? t("settings.disable2FA")
                      : t("settings.enable2FA")}
                  </Button>
                </Flex>

                {/* 2FA Modal */}
                {showTwoFAModal && (
                  <TwoFAModal
                    open={showTwoFAModal}
                    isEnabled={local2FAStatus}
                    onToggle={async (enabled, password) => {
                      await handleToggle2FA(enabled, password);
                      // Don't close modal here - let the modal handle its own closing
                    }}
                    onVerifyOTP={handleVerifyOTP}
                    onResendOTP={handleResendOTP}
                    onDisable2FA={handleDisable2FA}
                    onClose={() => setShowTwoFAModal(false)}
                    userEmail={userData?.user?.email || ""}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </form>
    </ComponentWrapper>
  );
};
