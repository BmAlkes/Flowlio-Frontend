import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";

interface OrganizationTotalClientsResponse {
  totalClients: number;
}

export const useFetchOrganizationTotalClients = (enabled = true) => {
  const scope = useDataScope();
  return useQuery<ApiResponse<OrganizationTotalClientsResponse>>({
    queryKey: ["organization-total-clients", scope],
    enabled,
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<OrganizationTotalClientsResponse>
      >("/organizations/stats/total-clients");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
