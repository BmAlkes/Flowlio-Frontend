import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { toast } from "sonner";

export interface UpdatePlanRequest {
  planId: string;
}

export interface UpdatePlanResponse {
  planId: string;
  trialStartDate: string | null;
  trialEndDate: string | null;
  subscriptionEndDate: string;
  status: string;
  isTrial: boolean;
  trialDaysRemaining: number;
}

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UpdatePlanResponse>,
    ErrorWithMessage,
    UpdatePlanRequest
  >({
    mutationFn: async (data) => {
      const response = await axios.put("/subscriptions/update-plan", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Subscription plan updated successfully!");

      // Invalidate and refetch subscription status
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["available-plans"] });
    },
    onError: (error) => {
      console.error("Failed to update subscription plan:", error);
      toast.error(error.message || "Failed to update subscription plan");
    },
  });
};
