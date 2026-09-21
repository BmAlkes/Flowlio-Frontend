const missing = "—";

export function validTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim() || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Calendar dates have no time zone and must never shift to the previous day. */
export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function formatDateValue(value: string | null | undefined, locale: string, timeZone: string, includeTime = false): string {
  if (!value) return missing;
  const calendar = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = calendar ? parseCalendarDate(value) : new Date(value);
  if (!date || !Number.isFinite(date.getTime())) return missing;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...(includeTime && !calendar ? { timeStyle: "short" as const } : {}),
    timeZone: calendar ? "UTC" : validTimeZone(timeZone) ? timeZone : "UTC",
  }).format(date);
}

export function formatMoney(value: string | number | null | undefined, locale: string, currency?: string | null): string {
  if (value == null || String(value).trim() === "" || !Number.isFinite(Number(value))) return missing;
  const options: Intl.NumberFormatOptions = /^[A-Z]{3}$/.test(currency ?? "")
    ? { style: "currency", currency: currency!, currencyDisplay: "code" }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return new Intl.NumberFormat(locale, options).format(Number(value));
}
