import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface DeletePaymentLinkResponse {
  success: boolean;
  message: string;
}

export const useDeletePaymentLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentLinkId: string): Promise<DeletePaymentLinkResponse> => {
      const response = await axios.delete(`/payment-links/${paymentLinkId}`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Payment link deleted successfully!", data);
      // Invalidate and refetch payment links
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });

      toast.success("Payment link deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting payment link:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete payment link";
      toast.error(errorMessage);
    },
  });
};
