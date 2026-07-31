import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUser } from "@/providers/user.provider";

export const ClientBillingSettings = () => {
  const { data: userData } = useUser();
  const queryClient = useQueryClient();
  const [billingEmail, setBillingEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    setBillingEmail(userData?.user?.billingEmail || "");
  }, [userData?.user?.billingEmail]);

  const handleSaveBillingEmail = async () => {
    setSavingEmail(true);
    try {
      await axios.patch("/user/profile", { billingEmail: billingEmail.trim() || null });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Billing contact updated");
    } catch {
      toast.error("Failed to update billing contact. Please try again.");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTogglePreference = async (key: "invoiceReminders" | "proposalNotifications", enabled: boolean) => {
    const currentPrefs = userData?.user?.notificationPreferences || {};
    try {
      await axios.patch("/user/profile", {
        notificationPreferences: { ...currentPrefs, [key]: enabled },
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(enabled ? "Notification enabled" : "Notification disabled");
    } catch {
      toast.error("Failed to update notification preference. Please try again.");
    }
  };

  const prefs: Record<string, any> = userData?.user?.notificationPreferences || {};

  return (
    <Stack className="w-full bg-card border-1 border-border p-8 rounded-xl max-md:px-3">
      <h1 className="text-xl font-semibold">Billing</h1>
      <Stack className="gap-6 mt-8 w-3xl max-sm:w-full">
        <Box>
          <Label className="text-[#7184B4] mb-2 block">Billing Contact Email</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Optional — if invoices and payment reminders should go to someone other than your
            account email, add them here.
          </p>
          <Flex className="gap-2">
            <Input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="billing@yourcompany.com"
              className="bg-background border-border"
            />
            <Button
              type="button"
              onClick={handleSaveBillingEmail}
              disabled={savingEmail}
              className="shrink-0"
            >
              {savingEmail ? "Saving..." : "Save"}
            </Button>
          </Flex>
        </Box>

        <Flex className="justify-between w-full rounded-md max-md:px-3 pt-4 border-t border-border">
          <Stack className="gap-0">
            <span className="text-[#7184B4]">Invoice Reminders</span>
            <h1 className="text-md max-md:text-sm">
              Get notified when a new invoice is issued or a payment is due.
            </h1>
          </Stack>
          <Switch
            className="cursor-pointer"
            checked={prefs.invoiceReminders ?? true}
            onCheckedChange={(val) => handleTogglePreference("invoiceReminders", val)}
          />
        </Flex>

        <Flex className="justify-between w-full rounded-md max-md:px-3">
          <Stack className="gap-0">
            <span className="text-[#7184B4]">New Proposal Notifications</span>
            <h1 className="text-md max-md:text-sm">
              Get notified when the agency sends you a proposal to review.
            </h1>
          </Stack>
          <Switch
            className="cursor-pointer"
            checked={prefs.proposalNotifications ?? true}
            onCheckedChange={(val) => handleTogglePreference("proposalNotifications", val)}
          />
        </Flex>
      </Stack>
    </Stack>
  );
};
