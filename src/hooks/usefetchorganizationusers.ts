import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

export interface OrganizationUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber?: string;
  userrole: string;
  companyname?: string;
  setpermission: string;
  status: string;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginAttempts: number;
  lockedUntil?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
    emailVerified: boolean;
    isSuperAdmin: boolean;
  };
  userOrganization?: {
    id: string;
    role: string;
    permissions: any;
    status: string;
    joinedAt: string;
  };
}

export interface OrganizationUsersResponse {
  userMembers: OrganizationUser[];
  totalCount: number;
  organizationId: string;
}

export const useFetchOrganizationUsers = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<OrganizationUsersResponse>, ErrorWithMessage>({
    queryKey: ["organization-users"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<OrganizationUsersResponse>>(
        "/organizations/current-org-user-members"
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};
