import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface UpdatePaymentLinkStatusResponse {
  success: boolean;
  message: string;
}

export const useUpdatePaymentLinkStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "paid" | "unpaid";
    }): Promise<UpdatePaymentLinkStatusResponse> => {
      const response = await axios.patch(`/payment-links/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update payment link status";
      toast.error(errorMessage);
    },
  });
};
