import { describe, expect, it } from "vitest";
import {
  canCreateResources,
  canDeleteResources,
  canUpdateResources,
} from "./resourcePermissions";
import { canViewInternalProjectFinancials } from "./projectFinancialAccess";

describe("resource permissions", () => {
  it.each(["client", "viewer", "unknown", undefined])(
    "denies staff mutations for %s",
    (role) => {
      expect(canCreateResources(role)).toBe(false);
      expect(canDeleteResources(role)).toBe(false);
      expect(canUpdateResources(role)).toBe(false);
    },
  );
  it("allows operators to edit but not create or delete", () => {
    expect(canUpdateResources("operator")).toBe(true);
    expect(canCreateResources("operator")).toBe(false);
    expect(canDeleteResources("operator")).toBe(false);
  });
  it("preserves member work permissions without granting internal financial access", () => {
    expect(canDeleteResources("user")).toBe(true);
    expect(canViewInternalProjectFinancials({ role: "user" })).toBe(false);
    expect(
      canViewInternalProjectFinancials({
        role: "user",
        isOrganizationOwner: true,
      }),
    ).toBe(true);
  });
  it.each(["client", "viewer", "unknown", "operator"])(
    "owner flag cannot elevate %s",
    (role) => {
      expect(
        canViewInternalProjectFinancials({ role, isOrganizationOwner: true }),
      ).toBe(false);
    },
  );
});
