import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";

interface OrganizationWeeklyHoursTrackedResponse {
  weeklyHours: number;
  weekStart: string;
  weekEnd: string;
}

export const useFetchOrganizationWeeklyHoursTracked = () => {
  const scope = useDataScope();
  return useQuery<ApiResponse<OrganizationWeeklyHoursTrackedResponse>>({
    queryKey: ["organization-weekly-hours-tracked", scope],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<OrganizationWeeklyHoursTrackedResponse>
      >("/organizations/stats/weekly-hours-tracked");
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds - shorter stale time for more frequent updates
    refetchOnWindowFocus: true, // Refetch when user returns to the tab/window
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds for real-time updates
  });
};
