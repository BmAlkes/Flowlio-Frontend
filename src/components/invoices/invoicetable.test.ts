import { describe, expect, it } from "vitest";
import { getStatusDisplay } from "./invoicetable";
import type { Invoice } from "@/hooks/usefetchinvoices";

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "1",
    invoiceNumber: "INV-001",
    clientname: "Acme Co",
    amount: "100.00",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getStatusDisplay", () => {
  it("labels a paid invoice as Paid regardless of due date", () => {
    const invoice = makeInvoice({ status: "paid", dueDate: "2020-01-01" });
    expect(getStatusDisplay(invoice).label).toBe("Paid");
  });

  it("labels a draft invoice as Draft even if its due date has passed", () => {
    const invoice = makeInvoice({ status: "draft", dueDate: "2020-01-01" });
    expect(getStatusDisplay(invoice).label).toBe("Draft");
  });

  it("labels an unpaid invoice past its due date as Overdue", () => {
    const invoice = makeInvoice({ status: "pending", dueDate: "2020-01-01" });
    expect(getStatusDisplay(invoice).label).toBe("Overdue");
  });

  it("labels an unpaid invoice with a future due date as Pending", () => {
    const invoice = makeInvoice({ status: "pending", dueDate: "2099-01-01" });
    expect(getStatusDisplay(invoice).label).toBe("Pending");
  });

  it("labels an unpaid invoice with no due date as Pending", () => {
    const invoice = makeInvoice({ status: "pending", dueDate: undefined });
    expect(getStatusDisplay(invoice).label).toBe("Pending");
  });

  it("is case-insensitive on the status field", () => {
    const invoice = makeInvoice({ status: "PAID", dueDate: "2020-01-01" });
    expect(getStatusDisplay(invoice).label).toBe("Paid");
  });
});
