import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

interface UserMember {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  userrole: string;
  companyname: string;
  setpermission: string;
  status: string;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    emailVerified: boolean;
    isSuperAdmin: boolean;
  } | null;
  userOrganization: {
    id: string;
    role: string;
    permissions: any;
    status: string;
    joinedAt: string;
  } | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetAllUserMembersResponse {
  userMembers: UserMember[];
  pagination: PaginationInfo;
}

interface GetAllUserMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userrole?: string;
}

// Hook to get user members for the CURRENTLY LOGGED-IN organization
export const useGetCurrentOrgUserMembers = (
  params: GetAllUserMembersParams = {}
) => {
  return useQuery<
    ApiResponse<{
      userMembers: UserMember[];
      totalCount: number;
      organizationId: string;
    }>,
    ErrorWithMessage,
    ApiResponse<{
      userMembers: UserMember[];
      totalCount: number;
      organizationId: string;
    }>
  >({
    queryKey: ["get-current-org-user-members", params],
    queryFn: async () => {
      // Use the new endpoint specifically for current organization
      const response = await axios.get<
        ApiResponse<{
          userMembers: UserMember[];
          totalCount: number;
          organizationId: string;
        }>
      >("/organizations/current-org-user-members");

      return response.data;
    },
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Original hook for getting all user members (kept for backward compatibility)
export const useGetAllUserMembers = (params: GetAllUserMembersParams = {}) => {
  return useQuery<
    ApiResponse<GetAllUserMembersResponse>,
    ErrorWithMessage,
    ApiResponse<GetAllUserMembersResponse>
  >({
    queryKey: ["get-all-user-members", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.status) searchParams.append("status", params.status);
      if (params.userrole) searchParams.append("userrole", params.userrole);

      const response = await axios.get<ApiResponse<GetAllUserMembersResponse>>(
        `/organizations/user-members?${searchParams.toString()}`
      );

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single user member by ID
export const useGetUserMemberById = (id: string) => {
  return useQuery<
    ApiResponse<UserMember>,
    ErrorWithMessage,
    ApiResponse<UserMember>
  >({
    queryKey: ["get-user-member-by-id", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<UserMember>>(
        `/organizations/user-members/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
