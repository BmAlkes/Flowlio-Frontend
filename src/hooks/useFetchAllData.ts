import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
}

interface AllDataResponse {
  organizations: Organization[];
  projects: Project[];
  invoices: Invoice[];
}

export const useFetchAllData = () => {
  return useQuery<ApiResponse<AllDataResponse>>({
    queryKey: ["all-data"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<AllDataResponse>>(
        "/superadmin/all-data"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
