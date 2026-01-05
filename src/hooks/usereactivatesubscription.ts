import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ReactivateSubscriptionRequest {
  paymentCollected?: boolean;
  paymentMethod?: string;
  paymentAmount?: string;
  notes?: string;
}

interface ReactivateSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscriptionId: string;
    organizationId: string;
    organizationName: string;
    status: string;
  };
}

export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<ReactivateSubscriptionResponse, Error, { subscriptionId: string; data?: ReactivateSubscriptionRequest }>({
    mutationFn: async ({ subscriptionId, data }) => {
      const response = await api.put(
        `/superadmin/subscriptions/${subscriptionId}/reactivate`,
        data || {}
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["all-organizations"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-history"] });
    },
  });
};

