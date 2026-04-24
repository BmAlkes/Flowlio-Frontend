import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await axios.put(`/invoices/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the invoices queries
      queryClient.invalidateQueries({ queryKey: ["organization-invoices"] });
    },
  });
};
