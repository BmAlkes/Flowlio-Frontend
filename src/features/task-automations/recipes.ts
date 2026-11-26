import type { RuleDraft } from "./api";

/** Starting points like Monday's recipe center; the builder opens with them filled in. */
export type Recipe = { key: string; draft: (t: (key: string) => string) => RuleDraft };

const base = { enabled: true, projectId: null, conditions: [] } as const;

export const RECIPES: Recipe[] = [
  { key: "doneNotify", draft: t => ({ ...base, conditions: [], name: t("taskAutomations.recipes.doneNotify"), trigger: { type: "status_changed", to: "completed" }, actions: [{ type: "notify", recipient: "creator", channel: "internal", message: t("taskAutomations.recipes.doneNotifyMessage") }] }) },
  { key: "dueSoon", draft: t => ({ ...base, conditions: [{ type: "status", op: "is_not", value: "completed" }], name: t("taskAutomations.recipes.dueSoon"), trigger: { type: "due_date", offsetDays: 1 }, actions: [{ type: "notify", recipient: "assignee", channel: "email", message: t("taskAutomations.recipes.dueSoonMessage") }] }) },
  { key: "overdueDelay", draft: t => ({ ...base, conditions: [{ type: "status", op: "is_not", value: "completed" }], name: t("taskAutomations.recipes.overdueDelay"), trigger: { type: "due_date", offsetDays: -1 }, actions: [{ type: "set_status", status: "delay" }, { type: "notify", recipient: "project_owner", channel: "internal", message: t("taskAutomations.recipes.overdueDelayMessage") }] }) },
  { key: "assignedStart", draft: t => ({ ...base, conditions: [{ type: "status", op: "is", value: "todo" }], name: t("taskAutomations.recipes.assignedStart"), trigger: { type: "assignee_changed" }, actions: [{ type: "notify", recipient: "assignee", channel: "internal", message: t("taskAutomations.recipes.assignedStartMessage") }] }) },
  { key: "newTaskDue", draft: t => ({ ...base, conditions: [], name: t("taskAutomations.recipes.newTaskDue"), trigger: { type: "task_created" }, actions: [{ type: "set_due", days: 7 }] }) },
  { key: "weekly", draft: t => ({ ...base, conditions: [], name: t("taskAutomations.recipes.weekly"), trigger: { type: "schedule", every: "week", weekday: 1 }, actions: [{ type: "create_task", title: t("taskAutomations.recipes.weeklyTitle"), projectId: "", assignee: "none", dueInDays: 4 }] }) },
];

export const emptyDraft = (): RuleDraft => ({ name: "", enabled: true, projectId: null, trigger: { type: "task_created" }, conditions: [], actions: [] });
