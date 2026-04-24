import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface TeamProductivityItem {
  userId: string;
  userName: string;
  userImage: string | null;
  totalMinutes: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

export const useFetchTeamProductivity = () => {
  return useQuery<ApiResponse<TeamProductivityItem[]>>({
    queryKey: ["team-productivity"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<TeamProductivityItem[]>>(
        "/organizations/stats/team-productivity"
      );
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};
