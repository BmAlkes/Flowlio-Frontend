import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

interface OrganizationHoursTrackedResponse {
  totalHours: number;
}

export const useFetchOrganizationHoursTracked = () => {
  return useQuery<ApiResponse<OrganizationHoursTrackedResponse>>({
    queryKey: ["organization-hours-tracked"],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<OrganizationHoursTrackedResponse>
      >("/organizations/stats/hours-tracked");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
