import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPendingSubscription, readPendingSubscription, savePendingSubscription } from "./pending-subscription";

describe("pending subscription confirmation", () => {
  beforeEach(() => { sessionStorage.clear(); vi.restoreAllMocks(); });

  it("keeps the approved agreement and original plan across a reload, isolated by account", () => {
    const approval = { userId: "owner", subscriptionId: "I-approved", planId: "original-plan" };
    savePendingSubscription(approval);
    expect(readPendingSubscription("owner")).toEqual(approval);
    expect(readPendingSubscription("other-user")).toBeNull();
    clearPendingSubscription("owner");
    expect(readPendingSubscription("owner")).toBeNull();
  });

  it("ignores corrupted storage and tolerates blocked storage without hiding server success", () => {
    sessionStorage.setItem("flowlio:pending-subscription:owner", "invalid json");
    expect(readPendingSubscription("owner")).toBeNull();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("Blocked"); });
    expect(() => savePendingSubscription({ userId: "owner", subscriptionId: "I-1", planId: "plan" })).not.toThrow();
    expect(() => clearPendingSubscription("owner")).not.toThrow();
  });
});
