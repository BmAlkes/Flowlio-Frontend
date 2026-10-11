import { useQuery } from "@tanstack/react-query";
import { useDataScope } from "./useDataScope";
import { axios, type ApiResponse, type ErrorWithMessage } from "@/configs/axios.config";
import type { OrganizationUsersResponse as DirectoryResponse } from "./usefetchorganizationdata";

// Assignee selectors use the staff directory, never the owner-only member records.
export interface OrganizationUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  position?: string;
  user: { id: string; name: string; email: string; role: string };
}

export interface OrganizationUsersResponse {
  userMembers: OrganizationUser[];
  totalCount: number;
}

export const useFetchOrganizationUsers = (options?: { enabled?: boolean }) => {
  const scope = useDataScope();
  return useQuery<ApiResponse<OrganizationUsersResponse>, ErrorWithMessage>({
    queryKey: ["organization-assignees", scope],
    queryFn: async () => {
      const { data: response } = await axios.get<DirectoryResponse>("/projects/users/organization");
      const userMembers = response.data.map(user => ({
        id: user.id, firstname: user.name ?? "", lastname: "", email: user.email,
        user: { id: user.id, name: user.name ?? "", email: user.email, role: user.role },
      }));
      return { ...response, data: { userMembers, totalCount: userMembers.length } };
    },
    staleTime: 0,
    refetchOnMount: true,
    ...options,
  });
};
