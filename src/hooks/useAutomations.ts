import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

export type AutomationKey =
  | "task-overdue"
  | "project-risk"
  | "lead-followup"
  | "weekly-summary";

export interface AutomationDefinition {
  key: AutomationKey;
  title: string;
  description: string;
  schedule: string;
  templateKey: string;
  /** Label for the "X found" count in the result panel, e.g. "task(s)" or "project(s)" */
  itemLabel: string;
}

export const AUTOMATIONS: AutomationDefinition[] = [
  {
    key: "task-overdue",
    title: "Task Overdue",
    description:
      "Notifies the assignee and project manager by email when a task passes its due date, falling back to the organization owner if neither is set. Runs once per day and repeats every 7 days while the task stays overdue.",
    schedule: "Daily at 08:00 UTC",
    templateKey: "task_overdue",
    itemLabel: "task(s)",
  },
  {
    key: "project-risk",
    title: "Project at Risk",
    description:
      "Notifies the project owner (or organization owner as fallback) by email when a project's risk score goes high, and creates a dismissible alert visible on the dashboard and Projects page. Repeats every 7 days while still at risk; auto-resolves once risk drops.",
    schedule: "Daily at 09:00 UTC",
    templateKey: "project_risk",
    itemLabel: "project(s)",
  },
  {
    key: "lead-followup",
    title: "Lead Follow-up Overdue",
    description:
      "Notifies the lead's assignee (or organization owner as fallback) by email when a scheduled follow-up date passes without action. Repeats every 7 days while still overdue; resolves naturally once the follow-up is rescheduled or the lead is closed.",
    schedule: "Daily at 10:00 UTC",
    templateKey: "lead_follow_up",
    itemLabel: "lead(s)",
  },
  {
    key: "weekly-summary",
    title: "Weekly Summary",
    description:
      "Sends a weekly activity digest (active projects, tasks completed, hours worked, highlights, recommendations) to all owners and admins of organizations that had activity in the past 7 days. Organizations with no activity are skipped.",
    schedule: "Weekly, Monday at 08:00 UTC",
    templateKey: "weekly_summary",
    itemLabel: "organization(s)",
  },
];

export interface RunAutomationResult {
  itemsFound: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

// Raw shapes differ per automation (tasksFound / projectsFound / leadsFound / organizationsFound) — normalize to itemsFound.
interface RawRunAutomationResult {
  tasksFound?: number;
  projectsFound?: number;
  leadsFound?: number;
  organizationsFound?: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

interface RunAutomationResponse {
  success: boolean;
  message: string;
  data: RawRunAutomationResult;
}

export const useRunAutomation = () => {
  return useMutation({
    mutationFn: async (
      key: AutomationKey,
    ): Promise<{
      success: boolean;
      message: string;
      data: RunAutomationResult;
    }> => {
      const response = await axios.post<RunAutomationResponse>(
        `/automations/${key}/run`,
      );
      const raw = response.data.data;
      return {
        ...response.data,
        data: {
          itemsFound:
            raw.tasksFound ??
            raw.projectsFound ??
            raw.leadsFound ??
            raw.organizationsFound ??
            0,
          emailsSent: raw.emailsSent,
          emailsFailed: raw.emailsFailed,
          errors: raw.errors,
        },
      };
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
