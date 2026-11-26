import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";

export const TASK_STATUSES = ["todo", "in_progress", "delay", "changes", "updated", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
type FieldValue = string | number | boolean;

export type Trigger =
  | { type: "task_created" }
  | { type: "status_changed"; to?: TaskStatus }
  | { type: "field_changed"; fieldId: string; to?: FieldValue }
  | { type: "assignee_changed" }
  | { type: "due_date"; offsetDays: number }
  | { type: "schedule"; every: "day" | "week" | "month"; weekday?: number; monthDay?: number };

export type Condition =
  | { type: "status"; op: "is" | "is_not"; value: TaskStatus }
  | { type: "field"; fieldId: string; op: "is" | "is_not" | "empty" | "not_empty"; value?: FieldValue }
  | { type: "assignee"; op: "is" | "empty" | "not_empty"; value?: string };

export type Recipient = "assignee" | "creator" | "project_owner" | { userId: string };
export type Action =
  | { type: "notify"; recipient: Recipient; channel: "internal" | "email"; message: string }
  | { type: "set_status"; status: TaskStatus }
  | { type: "set_field"; fieldId: string; value: FieldValue | null }
  | { type: "assign"; userId: string }
  | { type: "set_due"; days: number }
  | { type: "move_project"; projectId: string }
  | { type: "create_task"; title: string; projectId: string; assignee: string; dueInDays?: number };

export type RuleDraft = { name: string; enabled: boolean; projectId: string | null; trigger: Trigger; conditions: Condition[]; actions: Action[] };
export type Rule = RuleDraft & { id: string; runCount: number; lastRunAt: string | null; createdAt: string };
export type Run = { id: string; ruleId: string; ruleName: string; taskId: string | null; taskTitle: string | null; outcome: string; details: { actions?: string[]; error?: string } | null; createdAt: string };

const unwrap = <T,>(response: { data: { data: T } }) => response.data.data;

export function useTaskAutomations() {
  const scope = useDataScope();
  return useQuery({ queryKey: ["task-automations", scope], queryFn: async () => unwrap<Rule[]>(await axios.get("/task-automations")) });
}

export function useAutomationRuns(ruleId: string | null) {
  const scope = useDataScope();
  return useQuery({
    queryKey: ["task-automation-runs", scope, ruleId],
    enabled: !!ruleId,
    queryFn: async () => unwrap<Run[]>(await axios.get("/task-automations/history", { params: { ruleId } })),
  });
}

export function useSaveAutomation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rule }: { id?: string; rule: RuleDraft }) =>
      unwrap<Rule>(id ? await axios.put(`/task-automations/${encodeURIComponent(id)}`, rule) : await axios.post("/task-automations", rule)),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["task-automations"] }),
  });
}

export function useToggleAutomation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => unwrap<Rule>(await axios.patch(`/task-automations/${encodeURIComponent(id)}/enabled`, { enabled })),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["task-automations"] }),
  });
}

export function useDeleteAutomation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => axios.delete(`/task-automations/${encodeURIComponent(id)}`),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["task-automations"] }),
  });
}
