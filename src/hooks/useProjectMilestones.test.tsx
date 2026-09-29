import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { useFetchProjectMilestones, useUpdateMilestone } from "./useProjectMilestones";
const state = vi.hoisted(() => ({scope: "org-a", get: vi.fn(), patch: vi.fn()}));
vi.mock("@/hooks/useDataScope", () => ({useDataScope: () => state.scope}));
vi.mock("@/configs/axios.config", () => ({axios: {get: state.get, patch: state.patch}}));
beforeEach(() => {state.scope = "org-a"; state.get.mockReset().mockImplementation(async () => ({data: {success: true, data: [{id: state.scope, title: state.scope}]}})); state.patch.mockReset().mockResolvedValue({data: {success: true, data: {}}});});
function wrapper(client: QueryClient) {
  return ({children}: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
it("does not retain milestones from the previous organization", async () => {
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
  const {result, rerender} = renderHook(() => useFetchProjectMilestones("project"), {wrapper: wrapper(client)});
  await waitFor(() => expect(result.current.data?.data?.[0].id).toBe("org-a"));
  state.scope = "org-b"; rerender();
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.data?.data?.[0].id).toBe("org-b"));
});
it("invalidates review versions and dependent queues after updating a milestone", async () => {
  const client = new QueryClient();
  const relatedKeys = [["project-milestones", "project/a", "org-a"], ["delivery-reviews", "org-a", "project/a"], ["client-pending", "org-a"], ["attention", "org-a"], ["onboarding", "org-a"]];
  relatedKeys.forEach(key => {client.setQueryData(key, {previous: true});});
  const {result} = renderHook(useUpdateMilestone, {wrapper: wrapper(client)});
  await act(async () => {await result.current.mutateAsync({projectId: "project/a", milestoneId: "milestone/b", data: {title: "Revised delivery", dueDate: null}});});
  expect(state.patch).toHaveBeenCalledWith("/projects/project%2Fa/milestones/milestone%2Fb", {title: "Revised delivery", dueDate: null});
  relatedKeys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
});
