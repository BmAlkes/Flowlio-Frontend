import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import type { ApiResponse } from "@/configs/axios.config";

interface OverviewData {
  projectsCount: number;
  tasksCount: number;
  invoicesCount: number;
}

export const useFetchSuperadminOverview = () => {
  return useQuery<ApiResponse<OverviewData>>({
    queryKey: ["superadmin-overview"],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<OverviewData>>(
        "/superadmin/overview"
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
