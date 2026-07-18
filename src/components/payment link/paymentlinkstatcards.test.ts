import { describe, expect, it } from "vitest";
import { computePaymentLinkStats } from "./paymentlinkstatcards";
import type { PaymentLink } from "@/hooks/usefetchpaymentlinks";

function makeLink(overrides: Partial<PaymentLink> = {}): PaymentLink {
  return {
    id: "1",
    organizationId: "org1",
    clientId: "client1",
    projectId: "project1",
    createdBy: "user1",
    description: "Deposit",
    project: "Website Redesign",
    submittedby: "Bruno",
    clientname: "Acme Co",
    amount: "100",
    externalPaymentUrl: "https://pay.example.com/abc",
    status: "unpaid",
    paymentLink: "abc123",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computePaymentLinkStats", () => {
  it("returns all zeros for an empty list", () => {
    expect(computePaymentLinkStats([])).toEqual({
      total: 0,
      totalAmount: 0,
      paidCount: 0,
      paidAmount: 0,
      unpaidCount: 0,
      unpaidAmount: 0,
    });
  });

  it("splits links into paid vs unpaid and sums each bucket independently", () => {
    const links = [
      makeLink({ id: "1", status: "paid", amount: "100" }),
      makeLink({ id: "2", status: "unpaid", amount: "50" }),
      makeLink({ id: "3", status: "unpaid", amount: "25" }),
    ];
    const stats = computePaymentLinkStats(links);

    expect(stats.total).toBe(3);
    expect(stats.totalAmount).toBe(175);
    expect(stats.paidCount).toBe(1);
    expect(stats.paidAmount).toBe(100);
    expect(stats.unpaidCount).toBe(2);
    expect(stats.unpaidAmount).toBe(75);
  });

  it("treats a malformed amount as 0 instead of NaN", () => {
    const stats = computePaymentLinkStats([makeLink({ amount: "" })]);
    expect(stats.totalAmount).toBe(0);
  });
});
