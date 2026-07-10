import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

export type AutomationKey = "task-overdue";

export interface AutomationDefinition {
  key: AutomationKey;
  title: string;
  description: string;
  schedule: string;
  templateKey: string;
}

export const AUTOMATIONS: AutomationDefinition[] = [
  {
    key: "task-overdue",
    title: "Task Overdue",
    description:
      "Notifies the assignee and project manager by email when a task passes its due date. Runs once per day and never re-notifies the same task.",
    schedule: "Daily at 08:00 UTC",
    templateKey: "task_overdue",
  },
];

interface RunAutomationResponse {
  success: boolean;
  message: string;
}

export const useRunAutomation = () => {
  return useMutation({
    mutationFn: async (key: AutomationKey): Promise<RunAutomationResponse> => {
      const response = await axios.post(`/automations/${key}/run`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Automation ran successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to run automation";
      toast.error(errorMessage);
    },
  });
};
