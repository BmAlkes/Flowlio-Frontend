import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { OrganizationResponse } from "./usefetchuserorganizations";

export interface SubscriptionResponse {
  id: string;
  organizationId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  trialStart: string;
  trialEnd: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  organization: OrganizationResponse;
  plan: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    currency: string;
    billingCycle: string;
    features: any;
  };
  userRole: string;
}

export const useFetchUserSubscriptions = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<SubscriptionResponse[]>, ErrorWithMessage>({
    retryDelay: 5000,
    staleTime: 1000 * 10,
    queryKey: ["fetch user subscriptions"],
    queryFn: async () => {
      const response = await axios.get(`/organizations/user-subscriptions`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    ...options,
  });
};
