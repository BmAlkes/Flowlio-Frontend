import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface ClientProjectCounts {
  active: number;
  completed: number;
  delayed: number;
  pending: number;
  total: number;
}

export interface ClientActivityItem {
  client: {
    id: string;
    name: string;
    email: string;
    status: string;
    industry: string | null;
    image: string | null;
  };
  projects: ClientProjectCounts;
  tasks: {
    total: number;
    completed: number;
  };
  hoursTracked: number;
  activityScore: number;
}

export interface ClientActivityReport {
  clientStats: ClientActivityItem[];
  statusDistribution: { status: string; count: number }[];
  projectStatusSummary: { status: string; count: number }[];
}

export const useFetchClientActivity = () => {
  return useQuery({
    queryKey: ["client-activity-report"],
    queryFn: async () => {
      const response = await axios.get<{ success: boolean; data: ClientActivityReport }>(
        "/reports/client-activity"
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
