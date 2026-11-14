import { differenceInCalendarDays } from "date-fns";

// Shared look of the Tasks screens: soft (50%) status fills with full-strength text.
// Orange is reserved for overdue due dates.

export const TASK_STATUSES = ["todo", "in_progress", "delay", "changes", "updated", "completed"] as const;
export type TaskStatusKey = typeof TASK_STATUSES[number];

// Labels the Kanban board and the task modal already use for each API status.
export type StatusLabel = "To Do" | "In Progress" | "Delay" | "Changes" | "Updated" | "Completed";
export const STATUS_LABEL: Record<TaskStatusKey, StatusLabel> = {
  todo: "To Do",
  in_progress: "In Progress",
  delay: "Delay",
  changes: "Changes",
  updated: "Updated",
  completed: "Completed",
};
export const STATUS_I18N: Record<TaskStatusKey, string> = {
  todo: "taskManagement.statusColumns.toDo",
  in_progress: "taskManagement.statusColumns.inProgress",
  delay: "taskManagement.statusColumns.delay",
  changes: "taskManagement.statusColumns.changes",
  updated: "taskManagement.statusColumns.updated",
  completed: "taskManagement.statusColumns.completed",
};
// CSS class that sets --tone / --ink for a status (tasks-layout.css).
export const statusToneClass = (status: TaskStatusKey) => `tk-tone-${status}`;
export const toStatusKey = (status?: string | null): TaskStatusKey =>
  (TASK_STATUSES as readonly string[]).includes(status ?? "") ? (status as TaskStatusKey) : "todo";

export type DueState = "overdue" | "today" | "week" | "later" | "done" | "none";
export type Due = { state: DueState; date: Date | null; daysLate: number };

/** Where a task's due date stands today. Completed tasks are never overdue. */
export function dueOf(endDate: string | null | undefined, status: TaskStatusKey, now = new Date()): Due {
  if (!endDate) return { state: "none", date: null, daysLate: 0 };
  const date = new Date(endDate);
  if (Number.isNaN(date.getTime())) return { state: "none", date: null, daysLate: 0 };
  if (status === "completed") return { state: "done", date, daysLate: 0 };
  const days = differenceInCalendarDays(date, now);
  if (days < 0) return { state: "overdue", date, daysLate: -days };
  if (days === 0) return { state: "today", date, daysLate: 0 };
  return { state: days <= 7 ? "week" : "later", date, daysLate: 0 };
}

export type TaskStatFilter = "open" | "overdue" | "week" | "completed" | null;
export function matchesStat(task: { statusKey: TaskStatusKey; endDate?: string | null }, stat: TaskStatFilter, now = new Date()) {
  if (stat === null) return true;
  if (stat === "completed") return task.statusKey === "completed";
  if (task.statusKey === "completed") return false;
  if (stat === "open") return true;
  const due = dueOf(task.endDate, task.statusKey, now).state;
  return stat === "overdue" ? due === "overdue" : due === "today" || due === "week";
}
