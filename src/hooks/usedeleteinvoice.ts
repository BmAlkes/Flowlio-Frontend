import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

interface DeleteInvoiceResponse {
  success: boolean;
  message: string;
}

const deleteInvoice = async (id: string): Promise<DeleteInvoiceResponse> => {
  try {
    const response = await axios.delete(`/invoices/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete invoice"
    );
  }
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      toast.success("Invoice deleted successfully!");
      // Invalidate and refetch invoices
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete invoice");
    },
  });
};
