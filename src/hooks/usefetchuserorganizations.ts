import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  website?: string;
  industry?: string;
  size?: string;
  subscriptionPlanId: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  trialEndsAt: string;
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  settings: any;
  createdAt: string;
  updatedAt: string;
  subscriptionPlan?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    currency: string;
    billingCycle: string;
    features: any;
  };
}

export const useFetchUserOrganizations = (options?: { enabled?: boolean }) => {
  return useQuery<
    ApiResponse<
      {
        id: string;
        userId: string;
        organizationId: string;
        role: string;
        status: string;
        permissions: any;
        joinedAt: string;
        createdAt: string;
        updatedAt: string;
        organization: OrganizationResponse;
      }[]
    >,
    ErrorWithMessage
  >({
    retryDelay: 5000,
    staleTime: 1000 * 10,
    queryKey: ["fetch user organizations"],
    queryFn: async () => {
      const response = await axios.get(`/organizations/user-organizations`);
      return response.data;
    },
    ...options,
  });
};
