import { useQuery } from "@tanstack/react-query";
import { axios, type ApiResponse, type ErrorWithMessage } from "@/configs/axios.config";

export interface UserOrganization {
  userId: string;
  organizationId: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    subscriptionPlan?: {
      id: string;
      name: string;
    } | null;
    subscriptions?: Array<{
      id: string;
      status: string;
    }>;
    userOrganizations?: Array<{ userId: string }>;
  };
}

export const useFetchUserOrganization = () => {
  return useQuery<ApiResponse<UserOrganization[]>, ErrorWithMessage>({
    queryKey: ["user-organization"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<UserOrganization[]>>(
        "/organizations/user-organizations"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
