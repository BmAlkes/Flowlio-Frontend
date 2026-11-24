import { describe, expect, it } from "vitest";
import type { IPlan } from "@/types";
import { chooseStart, countryFromLocale, trialDaysOf } from "./start-plan";

const plan = (id: string, price: number, trialDays?: number | null, isActive = true) =>
  ({ id, name: id, price, trialDays, isActive, description: "", createdAt: "", updatedAt: "", features: {} }) as unknown as IPlan;
const plans = [plan("free", 0, 0), plan("starter", 19, 14), plan("pro", 49, 0), plan("legacy", 9, null), plan("old-free", 0, 0, false)];

describe("chooseStart", () => {
  it("starts free and trial plans without payment and sends paid plans without a trial to checkout", () => {
    expect(chooseStart(plans, "free").kind).toBe("free");
    expect(chooseStart(plans, "starter")).toMatchObject({ kind: "trial", trialDays: 14 });
    expect(chooseStart(plans, "pro").kind).toBe("checkout");
    expect(chooseStart(plans, "legacy")).toMatchObject({ kind: "trial", trialDays: 7 });
  });

  it("falls back to the free plan without a choice, and to pricing when there is no free plan", () => {
    expect(chooseStart(plans, null)).toMatchObject({ kind: "free", plan: { id: "free" } });
    expect(chooseStart(plans, "unknown")).toMatchObject({ kind: "free", plan: { id: "free" } });
    expect(chooseStart([plan("pro", 49, 0), plan("old-free", 0, 0, false)], null).kind).toBe("pricing");
  });

  it("reads trial length and country", () => {
    expect([trialDaysOf({ trialDays: null }), trialDaysOf({ trialDays: 0 }), trialDaysOf({ trialDays: 30 })]).toEqual([7, 0, 30]);
    expect(countryFromLocale("pt-BR")).toBe("BR");
    expect(countryFromLocale("he")).toBe("IL");
    expect(countryFromLocale("not a locale!")).toBeUndefined();
  });
});
