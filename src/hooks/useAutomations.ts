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

export interface RunAutomationResult {
  tasksFound: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

interface RunAutomationResponse {
  success: boolean;
  message: string;
  data: RunAutomationResult;
}

export const useRunAutomation = () => {
  return useMutation({
    mutationFn: async (key: AutomationKey): Promise<RunAutomationResponse> => {
      const response = await axios.post(`/automations/${key}/run`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data.emailsFailed > 0) {
        toast.error(data.message || "Automation completed with failures");
      } else {
        toast.success(data.message || "Automation ran successfully");
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to run automation";
      toast.error(errorMessage);
    },
  });
};
