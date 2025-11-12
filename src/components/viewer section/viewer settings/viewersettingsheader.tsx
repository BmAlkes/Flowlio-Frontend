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
import { TwoFAModal } from "@/components/settings/TwoFAModal";
import {
  useVerifyOTP,
  useGenerateOTP,
  useDisable2FA,
  useEnable2FA,
} from "@/hooks/useBetterAuthTwoFA";
import { useUser } from "@/providers/user.provider";
import { useUserProfile } from "@/hooks/useuserprofile";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateUserProfile } from "@/hooks/useupdateuserprofile";
import { useUpdateProfileImage } from "@/hooks/useupdateprofileimage";
import { authClient } from "@/lib/auth-client";

const settingsSchema = z.object({
  avatar: z.any().optional(),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  paymentAlertNotifications: z.boolean(),
  invoiceRemindersNotifications: z.boolean(),
  projectActivityUpdatesNotifications: z.boolean(),
});

export const ViewerSettingsHeader = () => {
  const { data: userData } = useUser();
  const { data: userProfile } = useUserProfile({ enabled: true });
  const queryClient = useQueryClient();
  const verifyOTPMutation = useVerifyOTP();
  const generateOTPMutation = useGenerateOTP();
  const disable2FAMutation = useDisable2FA();
  const enable2FAMutation = useEnable2FA();

  // Add hooks
  const updateProfileMutation = useUpdateUserProfile();
  const updateProfileImageMutation = useUpdateProfileImage();

  // Profile Form
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    userData?.user?.image || "/dashboard/1.svg"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      avatar: undefined,
      fullName: "",
      email: "",
      phone: "",
      address: "",
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
  } = profileForm;

  // Loading guard to avoid empty fields flash during refetch
  const isProfileReady = Boolean(userProfile?.data);

  // Keep profile form in sync with latest user data
  useEffect(() => {
    const u = userProfile?.data;
    if (u) {
      if (u.image) {
        setAvatarPreview(u.image);
      }
      profileForm.reset({
        avatar: undefined,
        fullName: u.name ?? "",
        email: u.email ?? "",
        phone: u.phone ?? "",
        address: u.address ?? "",
        paymentAlertNotifications:
          u.notificationPreferences?.paymentAlerts ?? true,
        invoiceRemindersNotifications:
          u.notificationPreferences?.invoiceReminders ?? true,
        projectActivityUpdatesNotifications:
          u.notificationPreferences?.projectActivityUpdates ?? true,
      });
    }
  }, [userProfile?.data]);

  // Password Form
  const passwordChangeSchema = z
    .object({
      currentpassword: z
        .string()
        .min(8, "Current password must be at least 8 characters long.")
        .max(12, "Current password must be at most 12 characters long."),
      newpassword: z
        .string()
        .min(8, "New password must be at least 8 characters long.")
        .max(12, "New password must be at most 12 characters long."),
      confirmpassword: z
        .string()
        .min(8, "Confirm password must be at least 8 characters long.")
        .max(12, "Confirm password must be at most 12 characters long."),
    })
    .refine((data) => data.newpassword === data.confirmpassword, {
      message: "New password and confirm password must match.",
      path: ["confirmpassword"],
    });

  const passwordChangeForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentpassword: "",
      newpassword: "",
      confirmpassword: "",
    },
  });
  const {
    register: changePwRegister,
    handleSubmit: handleChangePassSubmit,
    reset: resetChangePasswordForm,
    watch: changePwWatch,
    formState: { errors: changePwErrors },
  } = passwordChangeForm;

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA modal state
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const is2FAEnabled = userData?.user?.twoFactorEnabled || false;
  const [local2FAStatus, setLocal2FAStatus] = useState<boolean>(is2FAEnabled);
  useEffect(() => {
    setLocal2FAStatus(userData?.user?.twoFactorEnabled || false);
  }, [userData?.user?.twoFactorEnabled]);

  // Profile Save Handler
  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    try {
      setProfileSaving(true);
      // Update profile image if a new one was selected
      if (values.avatar && values.avatar instanceof File) {
        await updateProfileImageMutation.mutateAsync({ image: values.avatar });
        toast.success("Profile image updated successfully!");
      }
      // Update profile information
      await updateProfileMutation.mutateAsync({
        name: values.fullName,
        email: values.email,
        phone:
          values.phone && values.phone.trim() !== "" ? values.phone : undefined,
        address:
          values.address && values.address.trim() !== ""
            ? values.address
            : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  // Password Save Handler
  async function onChangePasswordSubmit(
    values: z.infer<typeof passwordChangeSchema>
  ) {
    try {
      setPasswordSaving(true);
      const { error } = await authClient.changePassword({
        currentPassword: values.currentpassword,
        newPassword: values.newpassword,
        revokeOtherSessions: true,
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
      resetChangePasswordForm();
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch {
      toast.error("Failed to change password. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  }

  // File/Image logic
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

  // 2FA handlers (same as SettingsHeader)
  const handleToggle2FA = async (enabled: boolean, password?: string) => {
    try {
      if (enabled) {
        await generateOTPMutation.mutateAsync();
      } else {
        await disable2FAMutation.mutateAsync({ password: password || "" });
        setLocal2FAStatus(false);
        toast.success("2FA disabled.");
        await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        await queryClient.invalidateQueries({ queryKey: ["user"] });
      }
    } catch {
      toast.error("Failed to update 2FA settings. Please try again.");
    }
  };
  const handleVerifyOTP = async (otp: string) => {
    try {
      await verifyOTPMutation.mutateAsync({ otp });
      await enable2FAMutation.mutateAsync();
      setLocal2FAStatus(true);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("2FA enabled successfully.");
    } catch {
      toast.error("OTP verification failed");
    }
  };
  const handleResendOTP = async () => {
    await generateOTPMutation.mutateAsync();
  };
  const handleDisable2FA = async (password: string) => {
    try {
      await disable2FAMutation.mutateAsync({ password });
      setLocal2FAStatus(false);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("2FA disabled.");
    } catch {
      toast.error("Failed to disable 2FA");
    }
  };

  // Notification toggles handlers, replicate pattern as needed
  // ... add your notification save logic (API, optimistic UI, etc.)

  // Password strength helpers (copy from settingsheader if needed)
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

  // Add new state
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  return (
    <ComponentWrapper className="mt-8 px-6 py-5 max-md:px-6">
      {!isProfileReady ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* PROFILE SECTION */}
          <Center className="justify-between max-sm:flex-col max-sm:items-start gap-2">
            <Stack className="gap-1">
              <h1 className="text-2xl font-medium">Setting</h1>
              <h1 className="text-gray-500 font-normal">
                Need Help? We've Got You Covered.
              </h1>
            </Stack>
            <Button
              type="submit"
              variant="outline"
              className="bg-black text-white border border-gray-200  rounded-full px-6 py-5 flex items-center gap-2 cursor-pointer h-11"
              disabled={
                profileSaving ||
                updateProfileMutation.isPending ||
                updateProfileImageMutation.isPending
              }
            >
              {profileSaving ||
              updateProfileMutation.isPending ||
              updateProfileImageMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </Center>
          <Stack className="gap-8 mt-8">
            <Stack className="w-full bg-white border-1 border-gray-200 p-8 rounded-xl max-md:px-3 ">
              <h1 className="text-xl font-medium">User Profile</h1>
              <Flex className="justify-between w-xs max-sm:w-full">
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="rounded-full bg-cover bg-center w-26 h-26 border-2 border-dashed border-gray-600"
                />
                <Flex className="flex-col gap-2">
                  <Button
                    type="button"
                    className="bg-black text-white rounded-full flex items-center gap-2 cursor-pointer h-10 w-30 hover:bg-black/80"
                    onClick={handleChooseFile}
                  >
                    Choose File
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
                    disabled={!avatarPreview}
                  >
                    Remove
                  </Button>
                </Flex>
              </Flex>
              <Flex className="mt-4 w-3xl max-sm:w-full flex-col gap-4">
                <Input
                  className="bg-white rounded-full"
                  size="lg"
                  type="text"
                  placeholder="Full Name"
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
                  placeholder="Phone Number"
                  {...register("phone")}
                />
                <Input
                  className="bg-white rounded-full"
                  size="lg"
                  type="text"
                  placeholder="Address"
                  {...register("address")}
                />
                <Flex className="w-full relative border border-gray-200 rounded-full">
                  <Input
                    className="bg-white rounded-full relative"
                    size="lg"
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                    disabled
                  />
                  <IoMdLock className="size-6 text-gray-500 absolute right-4 top-3 " />
                </Flex>
                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message as string}
                  </span>
                )}
              </Flex>
            </Stack>

            {/* SECURITY - PASSWORD SECTION */}
            <Stack className="w-full bg-white border-1 border-gray-200 p-8 rounded-xl max-md:px-3">
              <h1 className="text-2xl font-semibold">Password Security</h1>
              <Box className="bg-yellow-50 border border-yellow-200 mt-4 min-h-6 w-3xl p-4 rounded-md max-md:w-full max-md:text-xs">
                <p className="text-sm text-yellow-800">
                  <strong>🔒 Security Notice:</strong> Password changes will log
                  you out of all other devices for security.
                  <br />
                  <strong>💡 Tip:</strong> Use a strong password with at least 8
                  characters, including numbers and symbols.
                </p>
              </Box>
              {/* No nested <form> */}
              <Stack className="gap-6 w-3xl max-md:w-full mt-8">
                <Box className="relative">
                  <Input
                    className="bg-white rounded-full pr-12"
                    size="lg"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter Current Password"
                    {...changePwRegister("currentpassword")}
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
                {changePwErrors.currentpassword && (
                  <span className="text-red-500 text-xs">
                    {changePwErrors.currentpassword.message as string}
                  </span>
                )}
                <Box className="relative">
                  <Input
                    className="bg-white rounded-full pr-12"
                    placeholder="Enter New Password"
                    type={showNewPassword ? "text" : "password"}
                    size="lg"
                    {...changePwRegister("newpassword")}
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
                {changePwErrors.newpassword && (
                  <span className="text-red-500 text-xs">
                    {changePwErrors.newpassword.message as string}
                  </span>
                )}

                {/* Password strength indicator using new password value */}
                {changePwWatch("newpassword") && (
                  <Box className="mt-2">
                    <div className="text-xs text-gray-600 mb-2">
                      Password Strength:
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            getPasswordStrength(
                              changePwWatch("newpassword") ?? ""
                            ) >= level
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getPasswordStrengthText(
                        changePwWatch("newpassword") ?? ""
                      )}
                    </p>
                  </Box>
                )}
                <Box className="relative">
                  <Input
                    className="bg-white rounded-full pr-12"
                    placeholder="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    size="lg"
                    {...changePwRegister("confirmpassword")}
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
                {changePwErrors.confirmpassword && (
                  <span className="text-red-500 text-xs">
                    {changePwErrors.confirmpassword.message as string}
                  </span>
                )}
                <Flex className="justify-end mt-6">
                  <Button
                    type="button"
                    className="bg-red-600 text-white rounded-full px-8 py-3 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    disabled={passwordSaving}
                    onClick={handleChangePassSubmit(onChangePasswordSubmit)}
                  >
                    {passwordSaving ? "Saving..." : "🔒 Change Password"}
                  </Button>
                </Flex>
              </Stack>
            </Stack>

            {/* NOTIFICATIONS + 2FA SECTION */}
            <Stack className="w-full bg-white border-1 border-gray-200 p-8 rounded-xl max-md:px-3">
              <h1 className="text-xl font-semibold">
                Notification Preferences
              </h1>
              <Stack className="gap-6 mt-8 w-3xl max-sm:w-full">
                <Flex className="justify-between w-full rounded-md max-md:px-3">
                  <Stack className="gap-0">
                    <span className="text-[#7184B4]">
                      Project Activity Updates
                    </span>
                    <h1 className="text-md max-md:text-sm">
                      Receive alerts on project status changes, my task
                      notifications.
                    </h1>
                  </Stack>
                  <Switch
                    className="cursor-pointer"
                    checked={watch("projectActivityUpdatesNotifications")}
                    onCheckedChange={(val) =>
                      setValue("projectActivityUpdatesNotifications", val)
                    }
                  />
                </Flex>
                {/* Two-Factor Authentication Section */}
                <Flex className="items-center justify-between w-full py-4 border-t border-gray-200">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-gray-500">
                      {local2FAStatus
                        ? "Your account is protected with two-factor authentication"
                        : "Add an extra layer of security to your account"}
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
                    {local2FAStatus ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </Flex>
                {/* 2FA Modal */}
                {showTwoFAModal && (
                  <TwoFAModal
                    open={showTwoFAModal}
                    isEnabled={local2FAStatus}
                    onToggle={async (enabled, password) => {
                      await handleToggle2FA(enabled, password);
                    }}
                    onVerifyOTP={handleVerifyOTP}
                    onResendOTP={handleResendOTP}
                    onDisable2FA={handleDisable2FA}
                    onClose={() => setShowTwoFAModal(false)}
                    userEmail={userData?.user?.email || ""}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </form>
      )}
    </ComponentWrapper>
  );
};
