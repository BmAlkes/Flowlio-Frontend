import { describe, expect, it } from "vitest";
import { parseDefaultHour } from "./automations.page";

describe("parseDefaultHour", () => {
  it("extracts the hour from a 'Daily at HH:MM UTC' schedule", () => {
    expect(parseDefaultHour("Daily at 08:00 UTC")).toBe(8);
    expect(parseDefaultHour("Daily at 23:30 UTC")).toBe(23);
  });

  it("extracts the hour from a 'Weekly, <day> at HH:MM UTC' schedule", () => {
    expect(parseDefaultHour("Weekly, Monday at 09:00 UTC")).toBe(9);
  });

  it("returns null for interval-based schedules with no fixed hour", () => {
    expect(parseDefaultHour("Every 6 hours")).toBeNull();
    expect(parseDefaultHour("Every 4 hours")).toBeNull();
  });
});
