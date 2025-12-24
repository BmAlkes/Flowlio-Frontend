import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface UserWithOrganizations {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string;
  isSuperAdmin: boolean;
  subadminId?: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  organizations: Array<{
    organizationId: string;
    role: string;
    status: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  organizationCount: number;
}

interface GetAllUsersResponse {
  users: UserWithOrganizations[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface FetchAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useFetchAllUsers = (params?: FetchAllUsersParams) => {
  return useQuery<ApiResponse<GetAllUsersResponse>>({
    queryKey: ["superadmin-users", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const response = await axios.get<ApiResponse<GetAllUsersResponse>>(
        `/superadmin/users?${queryParams.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
