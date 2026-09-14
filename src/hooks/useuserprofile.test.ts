import { beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, CanceledError } from "axios";
const get = vi.hoisted(() => vi.fn());
vi.mock("@/configs/axios.config", () => ({ axios: { get } }));
vi.mock("@/lib/auth-client", () => ({ authClient: {} }));
import { fetchUserProfile, profileQueryKey } from "./useuserprofile";
describe("validated profile loading", () => {
  beforeEach(() => vi.resetAllMocks());
  it("forwards cancellation and rejects a late profile belonging to another account", async () => {
    get.mockResolvedValue({ data: { data: { id: "bob" } } });
    const signal = new AbortController().signal;
    await expect(fetchUserProfile("alice", signal)).rejects.toThrow(
      "current session",
    );
    expect(get).toHaveBeenCalledWith(
      "/user/profile",
      expect.objectContaining({ signal }),
    );
  });
  it("keys profiles by both user and session", () => {
    expect(profileQueryKey("alice", "s1")).not.toEqual(
      profileQueryKey("alice", "s2"),
    );
    expect(profileQueryKey("alice", "s1")).not.toEqual(
      profileQueryKey("bob", "s1"),
    );
  });

  it("retries a login transition once while preserving identity validation", async () => {
    get.mockRejectedValueOnce(new CanceledError("Session changed"));
    get.mockResolvedValueOnce({ data: { data: { id: "alice" } } });
    expect((await fetchUserProfile("alice")).data?.id).toBe("alice");
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("does not restart an explicitly aborted profile request", async () => {
    const controller = new AbortController();
    controller.abort();
    get.mockRejectedValue(new CanceledError("Aborted"));
    await expect(fetchUserProfile("alice", controller.signal)).rejects.toThrow(
      "Aborted",
    );
    expect(get).toHaveBeenCalledTimes(1);
  });
  it("preserves pending checkout without organization privileges", async () => {
    const error = new AxiosError("pending");
    error.response = {
      status: 403,
      data: {
        code: "USER_PENDING",
        data: {
          id: "alice",
          selectedPlanId: "plan-a",
          isOrganizationOwner: true,
          organizationId: "forged",
        },
      },
    } as any;
    get.mockRejectedValue(error);
    const result = await fetchUserProfile("alice");
    expect(result.data).toMatchObject({
      id: "alice",
      selectedPlanId: "plan-a",
      status: "pending",
      organizationId: null,
      isOrganizationOwner: false,
    });
    await expect(fetchUserProfile("bob")).rejects.toBe(error);
  });
  it("does not turn forbidden access into an authenticated profile", async () => {
    const error = new AxiosError("forbidden");
    error.response = {
      status: 403,
      data: { code: "MEMBERSHIP_INACTIVE", data: { id: "alice" } },
    } as any;
    get.mockRejectedValue(error);
    await expect(fetchUserProfile("alice")).rejects.toBe(error);
  });
});
