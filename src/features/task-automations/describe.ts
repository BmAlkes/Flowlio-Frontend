import type { TFunction } from "i18next";
import type { CustomFieldDefinition } from "@/hooks/usecustomfields";
import type { Action, Condition, RuleDraft, Trigger } from "./api";
import { STATUS_I18N } from "@/components/task management/task-ui";

export type Lookup = {
  fields: CustomFieldDefinition[];
  projects: { id: string; name: string }[];
  members: { id: string; name: string }[];
};

export const statusLabel = (t: TFunction, status: string) => t((STATUS_I18N as Record<string, string>)[status] ?? status);

const name = (list: { id: string; name: string }[], id: string | undefined, fallback: string) => list.find(item => item.id === id)?.name ?? fallback;

export function describeTrigger(t: TFunction, trigger: Trigger, lookup: Lookup) {
  switch (trigger.type) {
    case "task_created": return t("taskAutomations.when.task_created");
    case "status_changed": return trigger.to ? t("taskAutomations.when.status_to", { status: statusLabel(t, trigger.to) }) : t("taskAutomations.when.status_changed");
    case "field_changed": {
      const field = name(lookup.fields.map(f => ({ id: f.id, name: f.name })), trigger.fieldId, "?");
      return trigger.to !== undefined ? t("taskAutomations.when.field_to", { field, value: String(trigger.to) }) : t("taskAutomations.when.field_changed", { field });
    }
    case "assignee_changed": return t("taskAutomations.when.assignee_changed");
    case "due_date":
      return trigger.offsetDays === 0 ? t("taskAutomations.when.due_today")
        : trigger.offsetDays > 0 ? t("taskAutomations.when.due_before", { count: trigger.offsetDays })
        : t("taskAutomations.when.due_after", { count: -trigger.offsetDays });
    case "schedule":
      return trigger.every === "day" ? t("taskAutomations.when.every_day")
        : trigger.every === "week" ? t("taskAutomations.when.every_week", { day: t(`taskAutomations.weekdays.${trigger.weekday ?? 1}`) })
        : t("taskAutomations.when.every_month", { day: trigger.monthDay ?? 1 });
  }
}

export function describeCondition(t: TFunction, condition: Condition, lookup: Lookup) {
  if (condition.type === "status") return t(`taskAutomations.if.status_${condition.op}`, { status: statusLabel(t, condition.value) });
  if (condition.type === "assignee") return t(`taskAutomations.if.assignee_${condition.op}`, { person: name(lookup.members, condition.value, "?") });
  const field = lookup.fields.find(f => f.id === condition.fieldId)?.name ?? "?";
  return t(`taskAutomations.if.field_${condition.op}`, { field, value: String(condition.value ?? "") });
}

export function describeAction(t: TFunction, action: Action, lookup: Lookup) {
  switch (action.type) {
    case "notify": {
      const who = typeof action.recipient === "object" ? name(lookup.members, action.recipient.userId, "?") : t(`taskAutomations.recipients.${action.recipient}`);
      return t(action.channel === "email" ? "taskAutomations.then.notify_email" : "taskAutomations.then.notify", { who });
    }
    case "set_status": return t("taskAutomations.then.set_status", { status: statusLabel(t, action.status) });
    case "set_field": {
      const field = lookup.fields.find(f => f.id === action.fieldId)?.name ?? "?";
      return action.value === null ? t("taskAutomations.then.clear_field", { field }) : t("taskAutomations.then.set_field", { field, value: String(action.value) });
    }
    case "assign": return t("taskAutomations.then.assign", { who: action.userId === "creator" ? t("taskAutomations.recipients.creator") : name(lookup.members, action.userId, "?") });
    case "set_due": return t("taskAutomations.then.set_due", { count: action.days });
    case "move_project": return t("taskAutomations.then.move_project", { project: name(lookup.projects, action.projectId, "?") });
    case "create_task": return t("taskAutomations.then.create_task", { title: action.title, project: action.projectId === "same" ? t("taskAutomations.sameProject") : name(lookup.projects, action.projectId, "?") });
  }
}

/** The whole rule as one sentence, used on rule cards and as a live preview in the builder. */
export function describeRule(t: TFunction, rule: RuleDraft, lookup: Lookup) {
  const parts = [`${t("taskAutomations.whenWord")} ${describeTrigger(t, rule.trigger, lookup)}`];
  if (rule.conditions.length) parts.push(`${t("taskAutomations.ifWord")} ${rule.conditions.map(c => describeCondition(t, c, lookup)).join(` ${t("taskAutomations.and")} `)}`);
  if (rule.actions.length) parts.push(`${t("taskAutomations.thenWord")} ${rule.actions.map(a => describeAction(t, a, lookup)).join(` ${t("taskAutomations.and")} `)}`);
  return parts.join(", ");
}

/** Mirrors the server checks so the builder can say what is missing before saving. */
export function draftProblems(rule: RuleDraft): string[] {
  const problems: string[] = [];
  if (!rule.name.trim()) problems.push("name");
  if (!rule.actions.length) problems.push("actions");
  if (rule.trigger.type === "field_changed" && !rule.trigger.fieldId) problems.push("trigger");
  if (rule.trigger.type === "schedule" && (rule.conditions.length || rule.actions.some(a => a.type !== "create_task" || a.projectId === "same" || a.assignee === "same"))) problems.push("schedule");
  for (const action of rule.actions) {
    if (action.type === "notify" && !action.message.trim()) problems.push("message");
    if (action.type === "create_task" && (!action.title.trim() || !action.projectId)) problems.push("create_task");
    if ((action.type === "set_field" && !action.fieldId) || (action.type === "assign" && !action.userId) || (action.type === "move_project" && !action.projectId)) problems.push("incomplete");
  }
  for (const condition of rule.conditions) if (condition.type === "field" && !condition.fieldId) problems.push("incomplete");
  return [...new Set(problems)];
}
