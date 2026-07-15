import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface UpdatePaymentLinkRequest {
  clientId: string;
  projectId: string;
  description: string;
  amount: number;
  externalPaymentUrl: string;
}

export interface UpdatePaymentLinkResponse {
  success: boolean;
  message: string;
}

export const useUpdatePaymentLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaymentLinkRequest;
    }): Promise<UpdatePaymentLinkResponse> => {
      const response = await axios.patch(`/payment-links/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
      toast.success("Payment link updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update payment link";
      toast.error(errorMessage);
    },
  });
};
