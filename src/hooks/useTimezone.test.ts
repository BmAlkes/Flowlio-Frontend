import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useTimezone } from "./useTimezone";

const state = vi.hoisted(() => ({ scope: "a", put: vi.fn() }));
vi.mock("./useDataScope", () => ({ useDataScope: () => state.scope }));
vi.mock("@/configs/axios.config", () => ({ axios: { put: state.put } }));
beforeEach(() => { state.scope = "a"; state.put.mockReset().mockResolvedValue({ data: { success: true } }); });
afterEach(() => vi.restoreAllMocks());

it("synchronizes UTC, deduplicates success, and updates the next session", async () => {
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({ timeZone: "UTC" } as Intl.ResolvedDateTimeFormatOptions);
  const hook = renderHook(() => useTimezone());
  await waitFor(() => expect(hook.result.current.isUpdating).toBe(false));
  expect(state.put).toHaveBeenCalledWith("/user/profile/timezone", { timezone: "UTC" });
  await act(async () => { await hook.result.current.updateUserTimezone(); });
  expect(state.put).toHaveBeenCalledTimes(1);
  state.scope = "b";
  hook.rerender();
  await waitFor(() => expect(state.put).toHaveBeenCalledTimes(2));
  await act(async () => { expect(await hook.result.current.updateUserTimezone("Invalid/Zone")).toBe(false); });
  expect(state.put).toHaveBeenCalledTimes(2);
});

it("allows retry after failure without starting an automatic retry loop", async () => {
  state.put.mockRejectedValueOnce(new Error("offline"));
  const hook = renderHook(() => useTimezone());
  await waitFor(() => expect(hook.result.current.isUpdating).toBe(false));
  expect(state.put).toHaveBeenCalledTimes(1);
  await act(async () => { expect(await hook.result.current.updateUserTimezone()).toBe(true); });
  expect(state.put).toHaveBeenCalledTimes(2);
});
