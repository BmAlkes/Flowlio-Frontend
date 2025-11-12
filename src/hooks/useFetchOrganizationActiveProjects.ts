import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

interface OrganizationActiveProjectsResponse {
  activeProjects: number;
}

export const useFetchOrganizationActiveProjects = () => {
  return useQuery<ApiResponse<OrganizationActiveProjectsResponse>>({
    queryKey: ["organization-active-projects"],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<OrganizationActiveProjectsResponse>
      >("/organizations/stats/active-projects");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
