import { describe, expect, it } from "vitest";
import { formatDateValue, formatMoney, parseCalendarDate, validTimeZone } from "./locale-format";

describe("locale formatting", () => {
  it("keeps calendar deadlines unchanged across opposite time zones", () => {
    expect(formatDateValue("2026-09-21", "en-US", "America/Los_Angeles")).toBe("Sep 21, 2026");
    expect(formatDateValue("2026-09-21", "en-US", "Pacific/Kiritimati")).toBe("Sep 21, 2026");
    expect(parseCalendarDate("2026-02-29")).toBeNull();
    expect(parseCalendarDate("2024-02-29")).not.toBeNull();
    expect(formatDateValue("invalid", "pt", "UTC")).toBe("—");
  });
  it("handles DST jumps and repeated hours as distinct instants", () => {
    expect(formatDateValue("2026-03-08T06:30:00Z", "en-US", "America/New_York", true)).toContain("1:30");
    expect(formatDateValue("2026-03-08T07:30:00Z", "en-US", "America/New_York", true)).toContain("3:30");
    expect(formatDateValue("2026-11-01T05:30:00Z", "en-US", "America/New_York", true)).toContain("1:30");
    expect(formatDateValue("2026-11-01T06:30:00Z", "en-US", "America/New_York", true)).toContain("1:30");
  });
  it("uses currency codes without guessing or converting missing currency", () => {
    expect(formatMoney("1234.50", "en-US", "USD")).toContain("USD");
    expect(formatMoney("1234.50", "pt-BR", "BRL")).toContain("1.234,50");
    expect(formatMoney("1234.50", "en-US")).toBe("1,234.50");
    expect(formatMoney(null, "en")).toBe("—");
    expect(formatMoney("invalid", "en")).toBe("—");
  });
  it("rejects malformed time zones without throwing", () => {
    expect(validTimeZone("Asia/Jerusalem")).toBe(true);
    expect(validTimeZone("UTC")).toBe(true);
    expect(validTimeZone([])).toBe(false);
    expect(validTimeZone("unknown")).toBe(false);
  });
});
