import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";

interface OrganizationPendingTasksResponse {
  pendingTasks: number;
}

export const useFetchOrganizationPendingTasks = () => {
  const scope = useDataScope();
  return useQuery<ApiResponse<OrganizationPendingTasksResponse>>({
    queryKey: ["organization-pending-tasks", scope],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<OrganizationPendingTasksResponse>
      >("/organizations/stats/pending-tasks");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
