import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PropsWithChildren } from "react";
import { useActiveTimeEntries, useEndTask, useStartTask } from "./useTimeTracking";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: api }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
class Channel {
  static instances: Channel[] = [];
  onmessage: (() => void) | null = null;
  closed = false;
  constructor() { Channel.instances.push(this); }
  postMessage() { Channel.instances.filter(item => item !== this && !item.closed).forEach(item => item.onmessage?.()); }
  close() { this.closed = true; }
}
function context() {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return { cache, wrapper: ({ children }: PropsWithChildren) => <QueryClientProvider client={cache}>{children}</QueryClientProvider> };
}
beforeEach(() => {
  vi.clearAllMocks();
  Channel.instances = [];
  vi.stubGlobal("BroadcastChannel", Channel);
  api.post.mockResolvedValue({ data: { data: { taskTitle: "Design", status: "active", duration: 1 } } });
  api.get.mockResolvedValue({ data: { data: [] } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("reuses a start key after a connection failure, then uses a new key for a new session", async () => {
  const { wrapper } = context();
  const { result } = renderHook(() => useStartTask(), { wrapper });
  api.post.mockRejectedValueOnce(new Error("Connection lost"));
  await act(async () => { await expect(result.current.mutateAsync("task")).rejects.toThrow(); });
  await act(async () => { await result.current.mutateAsync("task"); });
  expect(api.post.mock.calls[0]).toEqual(api.post.mock.calls[1]);
  await act(async () => { await result.current.mutateAsync("task"); });
  expect(api.post.mock.calls[2][1].requestKey).not.toBe(api.post.mock.calls[0][1].requestKey);
});
it("stops the selected entry rather than whichever session is currently active", async () => {
  const { wrapper } = context();
  const { result } = renderHook(() => useEndTask(), { wrapper });
  const target = { taskId: "task", timeEntryId: "old-session" };
  await act(async () => { await result.current.mutateAsync(target); });
  await act(async () => { await result.current.mutateAsync(target); });
  expect(api.post).toHaveBeenNthCalledWith(1, "/tasks/task/end", { timeEntryId: "old-session" });
  expect(api.post.mock.calls[1]).toEqual(api.post.mock.calls[0]);
});
it("refreshes the active timer in another tab and closes its channel on unmount", async () => {
  const { wrapper } = context();
  const { unmount } = renderHook(() => useActiveTimeEntries(), { wrapper });
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  const channel = Channel.instances[0];
  await act(async () => { new Channel().postMessage(); });
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  unmount();
  expect(channel.closed).toBe(true);
});
it("refreshes stale active-time state after a start conflict", async () => {
  const { wrapper, cache } = context();
  const invalidate = vi.spyOn(cache, "invalidateQueries");
  const { result } = renderHook(() => useStartTask(), { wrapper });
  api.post.mockRejectedValueOnce({ response: { status: 409, data: { message: "Stop your active timer" } } });
  await act(async () => { await expect(result.current.mutateAsync("task")).rejects.toBeDefined(); });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["active-time-entries"] });
});
