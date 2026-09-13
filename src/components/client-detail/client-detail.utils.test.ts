import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatDate,
  isOverdue,
  safeExternalUrl,
  summarizeInvoices,
  summarizeTasks,
} from "./client-detail.utils";

describe("client overview summaries", () => {
  const now = new Date(2026, 8, 13, 12);
  it("does not count cancelled, paid or draft invoices as outstanding", () => {
    const summary = summarizeInvoices(
      [
        { status: "paid", dueDate: "2026-01-01" },
        { status: "cancelled", dueDate: "2026-01-01" },
        { status: "draft", dueDate: "2026-01-01" },
        { status: "sent", dueDate: "2026-01-01" },
        { status: "pending", dueDate: "2026-12-01" },
        { status: "overdue", dueDate: null },
      ],
      now,
    );
    expect(summary).toEqual({ paid: 1, open: 3, overdue: 2 });
  });
  it("keeps date-only deadlines due today until the end of the day", () => {
    expect(isOverdue("2026-09-13", now)).toBe(false);
    expect(isOverdue("2026-09-12", now)).toBe(true);
  });
  it("handles missing and malformed dates without crashing", () => {
    expect(formatDate(null, "pt")).toBe("—");
    expect(formatDate("not-a-date", "en")).toBe("—");
    expect(isOverdue(undefined, now)).toBe(false);
  });
  it("does not mark completed tasks overdue and accepts legacy task status spelling", () => {
    expect(
      summarizeTasks(
        [
          { status: "completed", endDate: "2026-01-01" },
          { status: "in progress", endDate: "2026-12-01" },
          { status: "todo", endDate: "2026-01-01" },
        ],
        now,
      ),
    ).toEqual({ total: 3, completed: 1, active: 1, overdue: 1 });
  });
  it("does not present missing amounts as zero or guess a currency", () => {
    expect(formatAmount(null, "en")).toBe("—");
    expect(formatAmount("", "en")).toBe("—");
    expect(formatAmount("invalid", "en")).toBe("—");
    expect(formatAmount("0", "en")).toBe("0.00");
    expect(formatAmount("1234.5", "en")).toBe("1,234.50");
  });
  it("only exposes HTTP(S) document links", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeExternalUrl("data:text/html,example")).toBeUndefined();
    expect(safeExternalUrl("https://example.com/document.pdf")).toBe(
      "https://example.com/document.pdf",
    );
  });
});
