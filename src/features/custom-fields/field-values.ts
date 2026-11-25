import type { CustomFieldDefinition } from "@/hooks/usecustomfields";
import { formatMoney } from "@/lib/locale-format";

export type Member = { id: string; name: string };
export type FormatContext = { locale: string; currency?: string | null; members?: Member[]; yes: string; no: string };

/** Fields that apply to a task: organization-wide ones plus those of the task's project, in their order. */
export function fieldsForTask(fields: CustomFieldDefinition[] | undefined, projectId: string | undefined) {
  return (fields ?? [])
    .filter(field => !field.projectId || field.projectId === projectId)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

/** Columns for a list of tasks: project fields show only when the list is narrowed to that project. */
export function columnsFor(fields: CustomFieldDefinition[] | undefined, onlyProjectId: string | null) {
  return (fields ?? [])
    .filter(field => !field.projectId || field.projectId === onlyProjectId)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export const isEmpty = (value: unknown) => value === null || value === undefined || value === "";

/** Plain-text rendering of a value, used in cells, chips and tooltips. */
export function formatFieldValue(field: CustomFieldDefinition, value: unknown, context: FormatContext): string {
  if (isEmpty(value)) return "";
  switch (field.type) {
    case "boolean":
      return value === true ? context.yes : context.no;
    case "currency":
      return formatMoney(Number(value), context.locale, context.currency ?? undefined);
    case "number":
      return Number.isFinite(Number(value)) ? new Intl.NumberFormat(context.locale).format(Number(value)) : String(value);
    case "date": {
      const [year, month, day] = String(value).split("-").map(Number);
      return year ? new Intl.DateTimeFormat(context.locale, { dateStyle: "medium", timeZone: "UTC" }).format(Date.UTC(year, month - 1, day)) : String(value);
    }
    case "rating":
      return "★".repeat(Number(value)) + "☆".repeat(Math.max(0, 5 - Number(value)));
    case "progress":
      return `${value}%`;
    case "person":
      return context.members?.find(member => member.id === value)?.name ?? "—";
    default:
      return String(value);
  }
}

/** Sort order for a column; empty values always go last. */
export function compareFieldValues(field: CustomFieldDefinition, a: unknown, b: unknown, context: Pick<FormatContext, "members">) {
  if (isEmpty(a) && isEmpty(b)) return 0;
  if (isEmpty(a)) return 1;
  if (isEmpty(b)) return -1;
  if (["number", "currency", "rating", "progress"].includes(field.type)) return Number(a) - Number(b);
  if (field.type === "boolean") return Number(b === true) - Number(a === true);
  if (field.type === "select") {
    const order = (field.options ?? []).map(option => option.label);
    return order.indexOf(String(a)) - order.indexOf(String(b));
  }
  if (field.type === "person") {
    const name = (id: unknown) => context.members?.find(member => member.id === id)?.name ?? "";
    return name(a).localeCompare(name(b));
  }
  return String(a).localeCompare(String(b));
}

/** Link values are stored with their scheme; anything else is not rendered as a link. */
export function safeHref(field: CustomFieldDefinition, value: unknown) {
  if (isEmpty(value)) return undefined;
  if (field.type === "url" && /^https?:\/\//i.test(String(value))) return String(value);
  if (field.type === "email") return `mailto:${String(value)}`;
  if (field.type === "phone") return `tel:${String(value).replace(/[^\d+]/g, "")}`;
  return undefined;
}
