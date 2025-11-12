import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

interface OrganizationWeeklyHoursTrackedResponse {
  weeklyHours: number;
  weekStart: string;
  weekEnd: string;
}

export const useFetchOrganizationWeeklyHoursTracked = () => {
  return useQuery<ApiResponse<OrganizationWeeklyHoursTrackedResponse>>({
    queryKey: ["organization-weekly-hours-tracked"],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<OrganizationWeeklyHoursTrackedResponse>
      >("/organizations/stats/weekly-hours-tracked");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
