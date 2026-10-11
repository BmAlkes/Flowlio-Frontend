import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { expect, it, vi } from "vitest";
import { useFetchOrganizationUsers } from "./usefetchorganizationusers";
import { useCreateUserMember } from "./usecreateusermember";
import { useDeleteUserMember, useDeactivateUserMember, useReactivateUserMember } from "./usedeleteusermember";
import { useUpdateOrganizationManager } from "./useUpdateOrganizationManager";
const api = vi.hoisted(() => ({ name: "Before", get: vi.fn(), write: vi.fn() }));
vi.mock("@/hooks/useDataScope", () => ({ useDataScope: () => "org-a" }));
vi.mock("@/configs/axios.config", () => ({ axios: { get: api.get, post: api.write, patch: api.write, delete: api.write } }));
it.each(["create", "delete", "deactivate", "reactivate", "manager"])("refreshes a mounted assignee selector after %s", async action => {
  api.name = "Before";
  api.get.mockImplementation(async () => ({data: {success: true, data: [{id: "member", name: api.name, email: "test@example.test", role: "viewer"}]}}));
  api.write.mockImplementation(async () => { api.name = "After"; return {data: {success: true}}; });
  const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
  const wrapper = ({children}: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const {result} = renderHook(() => ({
    directory: useFetchOrganizationUsers(), create: useCreateUserMember(), remove: useDeleteUserMember(),
    deactivate: useDeactivateUserMember(), reactivate: useReactivateUserMember(), manager: useUpdateOrganizationManager(),
  }), {wrapper});
  await waitFor(() => expect(result.current.directory.data?.data?.userMembers[0].user.name).toBe("Before"));
  await act(async () => {
    if(action === "create") await result.current.create.mutateAsync(new FormData());
    else if(action === "delete") await result.current.remove.mutateAsync("member");
    else if(action === "deactivate") await result.current.deactivate.mutateAsync("member");
    else if(action === "reactivate") await result.current.reactivate.mutateAsync("member");
    else await result.current.manager.mutateAsync({memberId: "member", setAsManager: true});
  });
  await waitFor(() => expect(result.current.directory.data?.data?.userMembers[0].user.name).toBe("After"));
});
