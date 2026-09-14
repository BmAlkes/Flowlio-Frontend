import { describe, expect, it } from "vitest";
import { mergeSessionProfile, sessionScope } from "./sessionScope";

const session = {
  user: { id: "alice", organizationId: "old-org" },
  session: { id: "s1" },
};
describe("session identity", () => {
  it("never exposes an unverified or foreign profile", () => {
    expect(mergeSessionProfile(session, null)).toBeNull();
    expect(mergeSessionProfile(session, { data: { id: "bob" } })).toBeNull();
    expect(mergeSessionProfile(null, { data: { id: "alice" } })).toBeNull();
  });
  it("does not restore a revoked organization from session cookies", () => {
    expect(
      mergeSessionProfile(session, {
        data: { id: "alice", organizationId: null },
      })?.user.organizationId,
    ).toBeNull();
  });
  it("isolates account, session, organization, client and permission changes", () => {
    const profile = { id: "alice", organizationId: "org-a", role: "user" };
    const initial = sessionScope(session, profile);
    for (const change of [
      { organizationId: "org-b" },
      { role: "client" },
      { isOrganizationOwner: true },
      { isOrganizationManager: true },
      { clientId: "client-b" },
    ]) {
      expect(sessionScope(session, { ...profile, ...change })).not.toBe(
        initial,
      );
    }
    expect(sessionScope({ ...session, user: { id: "bob" } }, profile)).not.toBe(
      initial,
    );
    expect(
      sessionScope({ ...session, session: { id: "s2" } }, profile),
    ).not.toBe(initial);
    expect(sessionScope(null)).not.toBe(initial);
  });
});
