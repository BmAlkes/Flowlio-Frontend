import React, { FC } from "react";
import { GeneralModal } from "@/components/common/generalmodal";
import { Stack } from "@/components/ui/stack";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type PlanAccessSettings = {
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  maxTasks: number;
  aiAssist: boolean;
  prioritySupport: boolean;
  calendarAccess: boolean;
  taskManagement: boolean;
  timeTracking: boolean;
};

interface PlanAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  accessSettings: PlanAccessSettings;
  onSave: (settings: PlanAccessSettings) => Promise<void>;
  isSaving?: boolean;
}

export const PlanAccessModal: FC<PlanAccessModalProps> = ({
  open,
  onOpenChange,
  planName,
  accessSettings,
  onSave,
  isSaving = false,
}) => {
  const [settings, setSettings] =
    React.useState<PlanAccessSettings>(accessSettings);

  // Update local state when accessSettings prop changes
  React.useEffect(() => {
    setSettings(accessSettings);
  }, [accessSettings]);

  const handleSave = async () => {
    try {
      await onSave(settings);
      // Only close modal if save was successful
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component (toast notifications)
      // Don't close modal on error so user can retry or fix issues
      console.error("Failed to save access settings:", error);
    }
  };

  const handleChange = (
    field: keyof PlanAccessSettings,
    value: number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <GeneralModal
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{
        className: "max-w-2xl max-h-[90vh] overflow-y-auto",
      }}
    >
      <DialogHeader>
        <DialogTitle>Configure Plan Access - {planName}</DialogTitle>
        <DialogDescription>
          Set user limits and feature access for this subscription plan.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
        <Stack className="gap-6 mt-4">
          {/* User Limits Section */}
          <Box>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              User Limits
            </h3>
            <Stack className="gap-4">
              <Box>
                <Label htmlFor="maxUsers" className="mb-2 block">
                  Maximum Users
                </Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="0"
                  defaultValue={0}
                  value={settings.maxUsers}
                  onChange={(e) =>
                    handleChange("maxUsers", parseInt(e.target.value) || 0)
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of users allowed (e.g., 0, 2, 6, 8, etc.)
                </p>
              </Box>

              <Box>
                <Label htmlFor="maxProjects" className="mb-2 block">
                  Maximum Projects
                </Label>
                <Input
                  id="maxProjects"
                  type="number"
                  min="0"
                  defaultValue={0}
                  value={settings.maxProjects}
                  onChange={(e) =>
                    handleChange("maxProjects", parseInt(e.target.value) || 0)
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of projects allowed
                </p>
              </Box>

              <Box>
                <Label htmlFor="maxStorage" className="mb-2 block">
                  Maximum Storage (GB)
                </Label>
                <Input
                  id="maxStorage"
                  type="number"
                  min="0"
                  defaultValue={0}
                  value={settings.maxStorage}
                  onChange={(e) =>
                    handleChange("maxStorage", parseInt(e.target.value) || 0)
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum storage space in gigabytes
                </p>
              </Box>

              <Box>
                <Label htmlFor="maxTasks" className="mb-2 block">
                  Maximum Tasks per User
                </Label>
                <Input
                  id="maxTasks"
                  type="number"
                  min="0"
                  defaultValue={0}
                  value={settings.maxTasks}
                  onChange={(e) =>
                    handleChange("maxTasks", parseInt(e.target.value) || 0)
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of tasks each user can create
                </p>
              </Box>
            </Stack>
          </Box>

          {/* Feature Access Section */}
          <Box>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Feature Access
            </h3>
            <Stack className="gap-4">
              <Flex className="items-center gap-3">
                <Checkbox
                  id="aiAssist"
                  checked={settings.aiAssist}
                  onCheckedChange={(checked) =>
                    handleChange("aiAssist", checked === true)
                  }
                />
                <Label htmlFor="aiAssist" className="cursor-pointer flex-1">
                  AI Assist
                  <span className="text-xs text-gray-500 block">
                    Access to AI-powered assistance features
                  </span>
                </Label>
              </Flex>

              <Flex className="items-center gap-3">
                <Checkbox
                  id="prioritySupport"
                  checked={settings.prioritySupport}
                  onCheckedChange={(checked) =>
                    handleChange("prioritySupport", checked === true)
                  }
                />
                <Label
                  htmlFor="prioritySupport"
                  className="cursor-pointer flex-1"
                >
                  Priority Support
                  <span className="text-xs text-gray-500 block">
                    Priority customer support access
                  </span>
                </Label>
              </Flex>

              <Flex className="items-center gap-3">
                <Checkbox
                  id="calendarAccess"
                  checked={settings.calendarAccess}
                  onCheckedChange={(checked) =>
                    handleChange("calendarAccess", checked === true)
                  }
                />
                <Label
                  htmlFor="calendarAccess"
                  className="cursor-pointer flex-1"
                >
                  Calendar Access
                  <span className="text-xs text-gray-500 block">
                    Access to calendar and event management features
                  </span>
                </Label>
              </Flex>

              <Flex className="items-center gap-3">
                <Checkbox
                  id="taskManagement"
                  checked={settings.taskManagement}
                  onCheckedChange={(checked) =>
                    handleChange("taskManagement", checked === true)
                  }
                />
                <Label
                  htmlFor="taskManagement"
                  className="cursor-pointer flex-1"
                >
                  Task Management
                  <span className="text-xs text-gray-500 block">
                    Access to task creation and management features
                  </span>
                </Label>
              </Flex>

              <Flex className="items-center gap-3">
                <Checkbox
                  id="timeTracking"
                  checked={settings.timeTracking}
                  onCheckedChange={(checked) =>
                    handleChange("timeTracking", checked === true)
                  }
                />
                <Label htmlFor="timeTracking" className="cursor-pointer flex-1">
                  Time Tracking
                  <span className="text-xs text-gray-500 block">
                    Access to time tracking and reporting features
                  </span>
                </Label>
              </Flex>
            </Stack>
          </Box>
        </Stack>
      </div>

      <DialogFooter className="mt-6">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => onOpenChange(false)}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          className="cursor-pointer hover:bg-gray-600 hover:text-white/80"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Access Settings"}
        </Button>
      </DialogFooter>
    </GeneralModal>
  );
};
