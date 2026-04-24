import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/providers/user.provider";
import { useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const SettingsNotification = () => {
  const { t } = useTranslation();
  const { data: userData } = useUser();
  const queryClient = useQueryClient();
  const [loadingStates, setLoadingStates] = useState<{
    userSubscribeNotifications: boolean;
    newCompanyNotifications: boolean;
    projectCompletionNotifications: boolean;
    newUserSignupNotifications: boolean;
  }>({
    userSubscribeNotifications: false,
    newCompanyNotifications: false,
    projectCompletionNotifications: false,
    newUserSignupNotifications: false,
  });

  // Get current notification preferences or defaults
  const notificationPrefs = userData?.user?.notificationPreferences || {
    userSubscribeNotifications: true,
    newCompanyNotifications: true,
    projectCompletionNotifications: true,
    newUserSignupNotifications: true,
  };

  const handleToggle = async (
    key:
      | "userSubscribeNotifications"
      | "newCompanyNotifications"
      | "projectCompletionNotifications"
      | "newUserSignupNotifications",
    enabled: boolean
  ) => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));

    try {
      // Get current preferences and update the specific one
      const currentPrefs = userData?.user?.notificationPreferences || {};
      const updatedPrefs = {
        ...currentPrefs,
        [key]: enabled,
      };

      // Save to database
      await axios.patch("/user/profile", {
        notificationPreferences: updatedPrefs,
      });

      // Refresh user data to reflect the new notification preferences
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });

      const notificationNames = {
        userSubscribeNotifications: "User Subscription",
        newCompanyNotifications: "New Company Registration",
        projectCompletionNotifications: "Project Completion",
        newUserSignupNotifications: "New User Registration",
      };

      if (enabled) {
        toast.success(
          `🔔 ${notificationNames[key]} notifications enabled! You'll receive alerts when these events occur.`
        );
      } else {
        toast.info(
          `🔕 ${notificationNames[key]} notifications disabled. You won't receive alerts for these events.`
        );
      }
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
      toast.error(
        "Failed to update notification preferences. Please try again."
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }
  };

  const notifications = [
    {
      key: "userSubscribeNotifications" as const,
      label: t("settings.alerts.userSub", "User Subscription"),
      description: t("settings.alerts.userSubDesc", "Get notified when users subscribe to plans"),
      enabled: notificationPrefs.userSubscribeNotifications ?? true,
    },
    {
      key: "newCompanyNotifications" as const,
      label: t("settings.alerts.newCompany", "New Company Registration"),
      description: t("settings.alerts.newCompanyDesc", "Get notified when new companies register"),
      enabled: notificationPrefs.newCompanyNotifications ?? true,
    },
    {
      key: "projectCompletionNotifications" as const,
      label: t("settings.alerts.projectEnd", "Project Completion"),
      description: t("settings.alerts.projectEndDesc", "Get notified when projects are completed"),
      enabled: notificationPrefs.projectCompletionNotifications ?? true,
    },
    {
      key: "newUserSignupNotifications" as const,
      label: t("settings.alerts.newUser", "New User Registration"),
      description: t("settings.alerts.newUserDesc", "Get notified when new users sign up"),
      enabled: notificationPrefs.newUserSignupNotifications ?? true,
    },
  ];

  return (
    <Box>
      <h1 className="text-xl font-semibold">{t("settings.notificationsTitle", "Notification Preferences")}</h1>
      <h4 className="max-md:text-sm">
        {t("settings.notificationsDesc", "Customize alerts for user registrations, subscriptions, company registrations, and project completions to suit your needs.")}
      </h4>

      <Stack className="gap-6 mt-8">
        {notifications.map((notification) => (
          <Flex
            key={notification.key}
            className="justify-between text-start w-full bg-accent border border-gray-400/50 py-3 px-8 rounded-md max-md:px-3"
          >
            <Flex className="flex-col gap-1 justify-start text-start">
              <h1 className="text-lg max-md:text-sm font-medium text-start">
                {notification.label}
              </h1>
              <p className="text-sm text-muted-foreground max-md:text-xs">
                {notification.description}
              </p>
            </Flex>
            <Switch
              className="cursor-pointer"
              checked={notification.enabled}
              onCheckedChange={(checked) =>
                handleToggle(notification.key, checked)
              }
              disabled={
                loadingStates[notification.key as keyof typeof loadingStates]
              }
            />
          </Flex>
        ))}
      </Stack>
    </Box>
  );
};
