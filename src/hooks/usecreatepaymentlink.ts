import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface CreatePaymentLinkRequest {
  clientId: string;
  projectId: string;
  description: string;
  amount: number;
}

export interface CreatePaymentLinkResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    organizationId: string;
    clientId: string;
    projectId: string;
    createdBy: string;
    description: string;
    project: string;
    submittedby: string;
    clientname: string;
    amount: string;
    paymentLink: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useCreatePaymentLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreatePaymentLinkRequest
    ): Promise<CreatePaymentLinkResponse> => {
      const response = await axios.post("/payment-links", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Invalidate and refetch payment links!", data);
      // Invalidate and refetch payment links
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });

      toast.success("Payment link created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating payment link:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create payment link";
      toast.error(errorMessage);
    },
  });
};
