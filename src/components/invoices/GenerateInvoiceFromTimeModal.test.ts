import { describe, expect, it } from "vitest";
import { aggregateTimeEntriesByTask, computeInvoiceAmount } from "./GenerateInvoiceFromTimeModal";

describe("aggregateTimeEntriesByTask", () => {
  it("sums minutes across multiple entries for the same task", () => {
    const result = aggregateTimeEntriesByTask([
      { taskId: "t1", taskTitle: "Design", duration: 30 },
      { taskId: "t1", taskTitle: "Design", duration: 45 },
      { taskId: "t2", taskTitle: "Development", duration: 120 },
    ]);
    expect(result).toEqual([
      { taskTitle: "Design", minutes: 75 },
      { taskTitle: "Development", minutes: 120 },
    ]);
  });

  it("returns an empty list for no entries", () => {
    expect(aggregateTimeEntriesByTask([])).toEqual([]);
  });

  it("treats a missing duration as 0 minutes instead of NaN", () => {
    const result = aggregateTimeEntriesByTask([{ taskId: "t1", taskTitle: "Design" }]);
    expect(result).toEqual([{ taskTitle: "Design", minutes: 0 }]);
  });
});

describe("computeInvoiceAmount", () => {
  it("multiplies hours by rate", () => {
    expect(computeInvoiceAmount(10, 50)).toBe(500);
  });

  it("rounds to the nearest cent, avoiding floating point drift", () => {
    // 1.005 * 3 in raw JS floating point is 3.0149999999999997, not 3.015
    expect(computeInvoiceAmount(1.005, 3)).toBeCloseTo(3.01, 2);
  });

  it("returns 0 for 0 hours or 0 rate", () => {
    expect(computeInvoiceAmount(0, 50)).toBe(0);
    expect(computeInvoiceAmount(10, 0)).toBe(0);
  });
});
