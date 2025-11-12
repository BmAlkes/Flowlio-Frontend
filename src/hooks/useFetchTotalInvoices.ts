import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

interface TotalInvoicesResponse {
  totalInvoices: number;
}

export const useFetchTotalInvoices = () => {
  return useQuery<ApiResponse<TotalInvoicesResponse>>({
    queryKey: ["total-invoices"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<TotalInvoicesResponse>>(
        "/superadmin/total-invoices"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
