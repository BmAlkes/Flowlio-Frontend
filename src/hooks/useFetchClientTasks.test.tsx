import {act, cleanup, renderHook, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {PropsWithChildren} from "react";
import {afterEach, beforeEach, expect, it, vi} from "vitest";
import {useFetchClientTasks} from "./useFetchClientTasks";
import {useCreateTask} from "./usecreatetask";
import {useUpdateTask, useUpdateTaskStatus} from "./useupdatetask";
import {useDeleteTask} from "./usedeletetask";
const state = vi.hoisted(() => ({scope: "session-a", request: Object.assign(vi.fn(), {post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn()})}));
vi.mock("@/configs/axios.config", () => ({axios: state.request}));
vi.mock("@/hooks/useDataScope", () => ({useDataScope: () => state.scope}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));
beforeEach(() => {
  vi.clearAllMocks(); state.scope = "session-a";
  state.request.mockResolvedValue({data: {data: {tasks: [{id: "shared-task"}]}}});
  for (const method of [state.request.post, state.request.put, state.request.patch, state.request.delete]) method.mockResolvedValue({data: {success: true}});
});
afterEach(cleanup);
function setup() {
  const cache = new QueryClient({defaultOptions: {queries: {retry: false}}});
  return {cache, wrapper: ({children}: PropsWithChildren) => <QueryClientProvider client={cache}>{children}</QueryClientProvider>};
}
it("rechecks a freshly cached empty list on entry so newly shared tasks are returned", async () => {
  const {cache, wrapper} = setup();
  cache.setQueryData(["client-tasks", "client/a", "org-a", state.scope], {data: {tasks: []}});
  const {result} = renderHook(() => useFetchClientTasks("client/a", "org-a"), {wrapper});
  await waitFor(() => expect(result.current.data?.data?.tasks[0].id).toBe("shared-task"));
  expect(state.request).toHaveBeenCalledOnce();
  expect(state.request).toHaveBeenCalledWith(expect.objectContaining({url: "/tasks/client/client%2Fa"}));
});
it("keeps sessions separate even for the same client and organization", async () => {
  const {wrapper} = setup();
  const {result, rerender} = renderHook(() => useFetchClientTasks("client", "org"), {wrapper});
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  state.scope = "session-b"; state.request.mockResolvedValue({data: {data: {tasks: []}}}); rerender();
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.data?.data?.tasks).toEqual([]));
});
it("does not make a request without a client or organization", () => {
  const {wrapper} = setup();
  renderHook(() => {useFetchClientTasks(undefined, "org"); useFetchClientTasks("client", undefined);}, {wrapper});
  expect(state.request).not.toHaveBeenCalled();
});
it.each(["create", "update", "status", "delete"] as const)("invalidates the client list after task %s", async action => {
  const {cache, wrapper} = setup();
  const key = ["client-tasks", "client", "org", "session-a"];
  cache.setQueryData(key, {data: {tasks: []}});
  const {result} = renderHook(() => ({create: useCreateTask(), update: useUpdateTask(), status: useUpdateTaskStatus(), delete: useDeleteTask()}), {wrapper});
  await act(async () => {
    if (action === "create") await result.current.create.mutateAsync({title: "Shared", projectId: "project", visibility: "public"});
    if (action === "update") await result.current.update.mutateAsync({taskId: "task", data: {visibility: "public"}});
    if (action === "status") await result.current.status.mutateAsync({taskId: "task", status: "completed"});
    if (action === "delete") await result.current.delete.mutateAsync("task");
  });
  expect(cache.getQueryState(key)?.isInvalidated).toBe(true);
});
