import { describe, expect, it } from "vitest";
import { computeInvoiceStats, isOverdue } from "./invoicestatcards";
import type { Invoice } from "@/hooks/usefetchinvoices";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "1",
    invoiceNumber: "INV-001",
    clientname: "Acme Co",
    amount: "100",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("isOverdue", () => {
  it("is false for a paid invoice even with a past due date", () => {
    expect(isOverdue(makeInvoice({ status: "paid", dueDate: "2020-01-01" }))).toBe(false);
  });

  it("is true for an unpaid invoice with a past due date", () => {
    expect(isOverdue(makeInvoice({ status: "pending", dueDate: "2020-01-01" }))).toBe(true);
  });

  it("is false when there is no due date at all", () => {
    expect(isOverdue(makeInvoice({ status: "pending", dueDate: undefined }))).toBe(false);
  });
});

describe("computeInvoiceStats", () => {
  it("returns all zeros for an empty list", () => {
    expect(computeInvoiceStats([])).toEqual({
      total: 0,
      paidCount: 0,
      paidAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
      overdueCount: 0,
      overdueAmount: 0,
    });
  });

  it("buckets each invoice into exactly one of paid/pending/overdue", () => {
    const invoices = [
      makeInvoice({ id: "1", status: "paid", amount: "100", dueDate: "2020-01-01" }),
      makeInvoice({ id: "2", status: "pending", amount: "50", dueDate: "2020-01-01" }), // overdue
      makeInvoice({ id: "3", status: "pending", amount: "25", dueDate: "2099-01-01" }), // pending
    ];
    const stats = computeInvoiceStats(invoices);

    expect(stats.total).toBe(3);
    expect(stats.paidCount).toBe(1);
    expect(stats.paidAmount).toBe(100);
    expect(stats.overdueCount).toBe(1);
    expect(stats.overdueAmount).toBe(50);
    expect(stats.pendingCount).toBe(1);
    expect(stats.pendingAmount).toBe(25);
    // Every invoice must land in exactly one bucket
    expect(stats.paidCount + stats.pendingCount + stats.overdueCount).toBe(stats.total);
  });

  it("treats a malformed amount as 0 instead of NaN", () => {
    const stats = computeInvoiceStats([
      makeInvoice({ status: "paid", amount: "not-a-number" }),
    ]);
    expect(stats.paidAmount).toBe(0);
  });
});
