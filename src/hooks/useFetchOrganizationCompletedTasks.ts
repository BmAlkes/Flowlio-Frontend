import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

interface OrganizationCompletedTasksResponse {
  completedTasks: number;
}

export const useFetchOrganizationCompletedTasks = () => {
  return useQuery<ApiResponse<OrganizationCompletedTasksResponse>>({
    queryKey: ["organization-completed-tasks"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<OrganizationCompletedTasksResponse>>(
        "/organizations/stats/completed-tasks"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
