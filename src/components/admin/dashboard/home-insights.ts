import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { OngoingTask } from "@/hooks/useFetchOngoingTasks";

// A due date is a calendar day: date-only values are read as local days, not UTC midnight.
export function dueDay(task: Pick<OngoingTask, "endDate">): Date | null {
  if (!task.endDate) return null;
  const value = task.endDate.length === 10 ? new Date(`${task.endDate}T00:00:00`) : new Date(task.endDate);
  return isNaN(value.getTime()) ? null : startOfDay(value);
}

export function daysLate(task: Pick<OngoingTask, "endDate">, today = new Date()) {
  const due = dueDay(task);
  return due ? differenceInCalendarDays(startOfDay(today), due) : null;
}

export function taskUrgency(tasks: OngoingTask[], today = new Date()) {
  const late = tasks.map(task => daysLate(task, today)).filter((days): days is number => days != null);
  const overdue = late.filter(days => days > 0);
  return { overdue: overdue.length, dueToday: late.filter(days => days === 0).length, oldestLate: overdue.length ? Math.max(...overdue) : 0 };
}
