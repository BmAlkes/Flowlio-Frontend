/** Local calendar dates become an inclusive start and exclusive end instant. */
export function timePeriod(start: string, end: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end) return null;
  const first = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  last.setDate(last.getDate() + 1);
  if (!Number.isFinite(first.getTime()) || !Number.isFinite(last.getTime())) return null;
  return { start: first.toISOString(), end: last.toISOString() };
}
export function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
/** Match server rounding per line, using integer cents throughout. */
export function timeLineCents(minutes: number, rate: string | null): bigint | null {
  if (!rate || !/^\d{1,8}(\.\d{1,2})?$/.test(rate) || !Number.isInteger(minutes) || minutes <= 0) return null;
  const [whole, fraction = ""] = rate.split(".");
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (cents <= 0n) return null;
  return (BigInt(minutes) * cents + 30n) / 60n;
}
export function displayCents(cents: bigint) {
  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}
