import { parseCalendarDate } from "@/lib/locale-format";

export const normalizeStatus = (status?: string | null) =>
  status
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_") || "unknown";

export function validDate(value?: string | null): Date | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseCalendarDate(value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isOverdue(value?: string | null, now = new Date()): boolean {
  const date = validDate(value);
  if (!date) return false;
  // A date-only deadline remains due today until the end of the local day.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value!)) {
    const [year, month, day] = value!.split("-").map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999) < now;
  }
  return date < now;
}

export function formatDate(
  value: string | null | undefined,
  locale: string,
): string {
  let date = validDate(value);
  if (!date) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value!)) {
    const [year, month, day] = value!.split("-").map(Number);
    date = new Date(year, month - 1, day);
  }
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatAmount(
  value: string | null | undefined,
  locale: string,
): string {
  if (value == null || value.trim() === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    : "—";
}

export function safeExternalUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export const progressValue = (value: number) =>
  Math.min(100, Math.max(0, Number(value) || 0));

export function summarizeTasks(
  tasks: { status: string; endDate?: string | null }[],
  now = new Date(),
) {
  return {
    total: tasks.length,
    completed: tasks.filter(
      (task) => normalizeStatus(task.status) === "completed",
    ).length,
    active: tasks.filter(
      (task) => normalizeStatus(task.status) === "in_progress",
    ).length,
    overdue: tasks.filter(
      (task) =>
        normalizeStatus(task.status) !== "completed" &&
        isOverdue(task.endDate, now),
    ).length,
  };
}

export function summarizeInvoices(
  invoices: { status: string; dueDate?: string | null }[],
  now = new Date(),
) {
  const open = invoices.filter((invoice) =>
    ["sent", "pending", "unpaid", "overdue"].includes(
      normalizeStatus(invoice.status),
    ),
  );
  return {
    open: open.length,
    paid: invoices.filter(
      (invoice) => normalizeStatus(invoice.status) === "paid",
    ).length,
    overdue: open.filter(
      (invoice) =>
        normalizeStatus(invoice.status) === "overdue" ||
        isOverdue(invoice.dueDate, now),
    ).length,
  };
}
