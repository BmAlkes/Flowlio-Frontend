import { describe, expect, it } from "vitest";
import { extractItemsFound, type RawRunAutomationResult } from "./useAutomations";

function makeRaw(overrides: Partial<RawRunAutomationResult> = {}): RawRunAutomationResult {
  return { emailsSent: 0, emailsFailed: 0, errors: [], ...overrides };
}

describe("extractItemsFound", () => {
  it("picks whichever '*Found' numeric field the backend returned", () => {
    expect(extractItemsFound(makeRaw({ tasksFound: 3 }))).toBe(3);
    expect(extractItemsFound(makeRaw({ organizationsFound: 5 }))).toBe(5);
    expect(extractItemsFound(makeRaw({ leadsFound: 0 }))).toBe(0);
  });

  it("returns 0 when no '*Found' field is present", () => {
    expect(extractItemsFound(makeRaw())).toBe(0);
  });

  it("ignores non-numeric '*Found' fields", () => {
    expect(extractItemsFound(makeRaw({ statusFound: "yes" as unknown as number }))).toBe(0);
  });

  it("picks the first matching numeric '*Found' field when multiple exist", () => {
    const raw = makeRaw({ tasksFound: 2, projectsFound: 7 });
    expect(extractItemsFound(raw)).toBe(2);
  });
});
