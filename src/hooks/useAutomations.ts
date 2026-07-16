import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

export type AutomationKey =
  | "task-overdue"
  | "project-risk"
  | "lead-followup"
  | "weekly-summary"
  | "invoice-overdue"
  | "payment-link-reminder"
  | "webhook-issue"
  | "new-lead-not-contacted"
  | "client-inactivity"
  | "support-ticket-unanswered"
  | "trial-and-usage";

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
  {
    key: "invoice-overdue",
    title: "Invoice Overdue",
    description:
      "Notifies the organization owner by email when an invoice passes its due date without being marked paid. Repeats every 7 days while still overdue.",
    schedule: "Daily at 08:30 UTC",
    templateKey: "invoice_overdue",
    itemLabel: "invoice(s)",
  },
  {
    key: "payment-link-reminder",
    title: "Payment Link Reminder",
    description:
      "Reminds the organization owner to follow up when a payment link has stayed unpaid for more than 7 days since creation.",
    schedule: "Daily at 09:30 UTC",
    templateKey: "payment_link_reminder",
    itemLabel: "payment link(s)",
  },
  {
    key: "webhook-issue",
    title: "Webhook Silent/Failing",
    description:
      "Alerts the admin when an active lead webhook has received no calls in 7+ days, or when most of its recent calls are failing — usually a sign the integration on the client's site broke.",
    schedule: "Daily at 11:00 UTC",
    templateKey: "webhook_issue",
    itemLabel: "webhook(s)",
  },
  {
    key: "new-lead-not-contacted",
    title: "New Lead Not Contacted",
    description:
      "Notifies the assigned user (or organization owner) when a brand-new lead has had no recorded contact within 24–48 hours — the window that matters most for conversion.",
    schedule: "Every 6 hours",
    templateKey: "lead_not_contacted",
    itemLabel: "lead(s)",
  },
  {
    key: "client-inactivity",
    title: "Client Inactivity",
    description:
      "Flags clients with no active project or task in the last 30 days — an early churn signal for the organization owner to act on.",
    schedule: "Weekly, Monday at 09:00 UTC",
    templateKey: "client_inactive",
    itemLabel: "client(s)",
  },
  {
    key: "support-ticket-unanswered",
    title: "Support Ticket Unanswered",
    description:
      "Notifies assigned admins when a support ticket has gone more than 24 hours without a first response.",
    schedule: "Every 4 hours",
    templateKey: "support_ticket_unanswered",
    itemLabel: "ticket(s)",
  },
  {
    key: "trial-and-usage",
    title: "Trial Ending / Plan Usage Limit",
    description:
      "Notifies the organization owner when their trial is 3 days or less from ending, or when plan usage (users, projects, storage) crosses 80% of the limit.",
    schedule: "Daily at 07:00 UTC",
    templateKey: "trial_and_usage",
    itemLabel: "organization(s)",
  },
];

export interface RunAutomationResult {
  itemsFound: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
}

// Raw shapes differ per automation (tasksFound / projectsFound / leadsFound /
// organizationsFound / invoicesFound / etc) — normalize to itemsFound by
// picking whichever "*Found" field the backend actually returned, so new
// automations don't need a frontend change just to report their count.
interface RawRunAutomationResult {
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
  [key: string]: unknown;
}

interface RunAutomationResponse {
  success: boolean;
  message: string;
  data: RawRunAutomationResult;
}

function extractItemsFound(raw: RawRunAutomationResult): number {
  const foundKey = Object.keys(raw).find(
    (k) => k.endsWith("Found") && typeof raw[k] === "number",
  );
  return foundKey ? (raw[foundKey] as number) : 0;
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
          itemsFound: extractItemsFound(raw),
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

export interface AutomationRun {
  id: string;
  organizationId: string;
  automationKey: AutomationKey;
  itemsFound: number | null;
  emailsSent: number | null;
  emailsFailed: number | null;
  errors: string[] | null;
  triggeredBy: "cron" | "manual";
  runAt: string;
}

export interface AutomationHistoryResponse {
  success: boolean;
  data: {
    runs: AutomationRun[];
    total: number;
    page: number;
  };
}

export const useAutomationHistory = (key: AutomationKey, page = 1, enabled = true) => {
  return useQuery({
    queryKey: ["automation-history", key, page],
    enabled,
    retry: false,
    queryFn: async () => {
      const response = await axios.get<AutomationHistoryResponse>(
        `/automations/${key}/history?page=${page}&limit=5`,
      );
      return response.data;
    },
  });
};

export interface AutomationSettingsEntry {
  automationKey: AutomationKey;
  enabled: boolean;
  lastScheduledRunAt: string | null;
}

export const useAutomationSettings = () => {
  return useQuery({
    queryKey: ["automation-settings"],
    retry: false,
    queryFn: async () => {
      const response = await axios.get<{ success: boolean; data: AutomationSettingsEntry[] }>(
        "/automations/settings",
      );
      return response.data;
    },
  });
};

export const useUpdateAutomationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, enabled }: { key: AutomationKey; enabled: boolean }) => {
      const response = await axios.patch(`/automations/${key}/settings`, { enabled });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["automation-settings"] });
      toast.success(variables.enabled ? "Automation enabled" : "Automation disabled");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update automation settings");
    },
  });
};
