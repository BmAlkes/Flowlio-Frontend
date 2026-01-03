import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface SubscriptionHistoryResponse {
  success: boolean;
  message: string;
  data: {
    organization: {
      id: string;
      name: string;
    };
    subscriptions: Array<{
      id: string;
      planId: string;
      planName: string;
      planPrice: number;
      planCurrency: string;
      status: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      trialStart: string | null;
      trialEnd: string | null;
      cancelAtPeriodEnd: boolean;
      cancelledAt: string | null;
      createdAt: string;
      updatedAt: string;
      renewalCount: number;
      lastRenewedAt: string | null;
      metadata: any;
      plan: {
        id: string;
        name: string;
        slug: string;
        price: number;
        currency: string;
        billingCycle: string;
        durationValue: number | null;
        durationType: string | null;
      };
    }>;
    totalSubscriptions: number;
    activeSubscriptions: number;
  };
}

export const useFetchSubscriptionHistory = (
  organizationId: string,
  enabled: boolean = true
) => {
  return useQuery<SubscriptionHistoryResponse>({
    queryKey: ["subscription-history", organizationId],
    queryFn: async () => {
      const response = await api.get(
        `/superadmin/organizations/${organizationId}/subscription-history`
      );
      return response.data;
    },
    enabled: enabled && !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};
