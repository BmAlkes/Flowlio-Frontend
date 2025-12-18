import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { toast } from "sonner";

interface CreateUpgradeOrderRequest {
  newPlanId: string;
  // demoMode?: boolean; // COMMENTED OUT FOR PRODUCTION - Only real payments allowed
}

interface CreateUpgradeOrderResponse {
  orderId: string | null;
  status: string;
  amount: number;
  currency: string;
  currentPlan: {
    id: string;
    name: string;
    price: number;
  };
  newPlan: {
    id: string;
    name: string;
    price: number;
  };
  proratedAmount: number;
  isUpgrade: boolean;
  isDowngrade: boolean;
}

interface CaptureUpgradeOrderRequest {
  orderId: string;
  newPlanId?: string; // Required for demo orders
}

interface CaptureUpgradeOrderResponse {
  orderId: string;
  subscriptionId: string;
  newPlanId: string;
  currentPeriodEnd: string;
}

export const useCreateUpgradeOrder = () => {
  return useMutation<
    ApiResponse<CreateUpgradeOrderResponse>,
    ErrorWithMessage,
    CreateUpgradeOrderRequest
  >({
    mutationFn: async (data: CreateUpgradeOrderRequest) => {
      const response = await axios.post(
        "/subscriptions/upgrade/create-order",
        data
      );
      return response.data;
    },
  });
};

export const useCaptureUpgradeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CaptureUpgradeOrderResponse>,
    ErrorWithMessage,
    CaptureUpgradeOrderRequest
  >({
    mutationFn: async (data: CaptureUpgradeOrderRequest) => {
      const response = await axios.post(
        "/subscriptions/upgrade/capture-order",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Plan upgraded successfully!");
      // Invalidate subscription status to refresh data
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["all-organizations"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upgrade plan");
    },
  });
};
