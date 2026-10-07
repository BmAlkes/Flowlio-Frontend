import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useFetchViewerProjects } from "./useFetchViewerProjects";
import { useFetchViewerTasks } from "./useFetchViewerTasks";

const state = vi.hoisted(() => ({ scope: "session-a", get: vi.fn() }));
vi.mock("@/configs/axios.config", () => ({ axios: { get: state.get } }));
vi.mock("./useDataScope", () => ({ useDataScope: () => state.scope }));
beforeEach(() => { vi.clearAllMocks(); state.scope = "session-a"; state.get.mockResolvedValue({ data: { data: [{ id: "private-a" }] } }); });
afterEach(cleanup);
function wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
}
it.each([useFetchViewerProjects, useFetchViewerTasks])("does not reuse another session's fresh viewer data", async useHook => {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { result, rerender } = renderHook(() => useHook(), { wrapper: ({ children }) => <QueryClientProvider client={cache}>{children}</QueryClientProvider> });
  await waitFor(() => expect(result.current.data?.data?.[0].id).toBe("private-a"));
  state.scope = "session-b";
  state.get.mockResolvedValue({ data: { data: [] } });
  rerender();
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.data?.data).toEqual([]));
});
it("does not fetch viewer endpoints when disabled for an internal user", () => {
  renderHook(() => { useFetchViewerProjects({ enabled: false }); useFetchViewerTasks({ enabled: false }); }, { wrapper });
  expect(state.get).not.toHaveBeenCalled();
});
