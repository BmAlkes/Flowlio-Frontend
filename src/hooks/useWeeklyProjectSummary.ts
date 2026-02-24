import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface WeeklyProjectSummaryResponse {
  success: boolean;
  message: string;
  data: {
    summary: string;
    highlights: string[];
    metrics: {
      totalProjects: number;
      activeProjects: number;
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      totalHours: number;
      billableHours: number;
    };
    projectBreakdown: Array<{
      projectName: string;
      projectNumber: string;
      status: string;
      progress: number;
      tasksCompleted: number;
      tasksInProgress: number;
      tasksPending: number;
      hoursSpent: number;
      summary: string;
    }>;
    recommendations: string[];
    period: {
      start: string;
      end: string;
    };
  };
}

interface WeeklySummaryParams {
  startDate?: string;
  endDate?: string;
}

export const useWeeklyProjectSummary = (params?: WeeklySummaryParams) => {
  return useQuery({
    queryKey: ["weekly-project-summary", params?.startDate, params?.endDate],
    queryFn: async (): Promise<WeeklyProjectSummaryResponse> => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) {
        queryParams.append("startDate", params.startDate);
      }
      if (params?.endDate) {
        queryParams.append("endDate", params.endDate);
      }

      const url = `/ai/weekly-summary${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await axios.get(url);
      return response.data;
    },
    enabled: false, // Don't auto-fetch, only fetch when explicitly called
    retry: 1,
  });
};
