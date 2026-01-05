import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DeactivateSubscriptionRequest {
  reason?: string;
  notes?: string;
}

interface DeactivateSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscriptionId: string;
    organizationId: string;
    organizationName: string;
    status: string;
  };
}

export const useDeactivateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeactivateSubscriptionResponse,
    Error,
    { subscriptionId: string; data?: DeactivateSubscriptionRequest }
  >({
    mutationFn: async ({ subscriptionId, data }) => {
      const response = await api.put(
        `/superadmin/subscriptions/${subscriptionId}/deactivate`,
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
