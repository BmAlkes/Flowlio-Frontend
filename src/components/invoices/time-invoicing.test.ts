import { describe, expect, it } from "vitest";
import { displayCents, localDate, timeLineCents, timePeriod } from "./time-invoicing";

describe("time invoice preview", () => {
  it("rounds each line to cents before summing", () => {
    const one = timeLineCents(1, "0.30")!;
    expect(one).toBe(1n);
    expect(displayCents(one + one)).toBe("0.02");
    expect(displayCents(timeLineCents(90, "12.35")!)).toBe("18.53");
  });
  it("requires positive minutes and a positive rate with two decimal places at most", () => {
    for (const rate of [null, "", "0", "-1", "1.005", "1e2", "NaN"]) expect(timeLineCents(60, rate)).toBeNull();
    expect(timeLineCents(0, "50")).toBeNull();
    expect(timeLineCents(1.5, "50")).toBeNull();
  });
  it("supports large values without floating point drift", () => {
    expect(displayCents(timeLineCents(60, "99999999.99")!)).toBe("99999999.99");
  });
  it("includes the entire end calendar day using local midnight boundaries", () => {
    const period = timePeriod("2026-09-01", "2026-09-17")!;
    expect(new Date(period.start).getHours()).toBe(0);
    expect(localDate(new Date(period.end))).toBe("2026-09-18");
    expect(new Date(period.end).getHours()).toBe(0);
  });
  it("rejects incomplete or reversed ranges", () => {
    expect(timePeriod("", "2026-09-17")).toBeNull();
    expect(timePeriod("2026-09-18", "2026-09-17")).toBeNull();
  });
});
