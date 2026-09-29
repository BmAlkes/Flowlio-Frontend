import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { useFetchOrganizationUsers } from "./usefetchorganizationusers";
const state = vi.hoisted(() => ({scope: "org-a", get: vi.fn()}));
vi.mock("@/hooks/useDataScope", () => ({useDataScope: () => state.scope}));
vi.mock("@/configs/axios.config", () => ({axios: {get: state.get}}));
beforeEach(() => {state.scope = "org-a"; state.get.mockReset().mockImplementation(async () => ({data: {success: true, data: {userMembers: [{id: state.scope}], organizationId: state.scope}}}));});
function wrapper(client: QueryClient) {
  return ({children}: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
it("does not reuse assignee-option data or fetch a disabled members query", () => {
  const client = new QueryClient();
  client.setQueryData(["organization-users"], {data: [{id: "assignee-option"}]});
  const {result} = renderHook(() => useFetchOrganizationUsers({enabled: false}), {wrapper: wrapper(client)});
  expect(result.current.data).toBeUndefined();
  expect(state.get).not.toHaveBeenCalled();
});
it("does not expose the previous organization's members while the next organization loads", async () => {
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
  const {result, rerender} = renderHook(() => useFetchOrganizationUsers(), {wrapper: wrapper(client)});
  await waitFor(() => expect(result.current.data?.data?.organizationId).toBe("org-a"));
  state.scope = "org-b";
  rerender();
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.data?.data?.organizationId).toBe("org-b"));
});
