import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface ProjectInsights {
  riskAnalysis: {
    highRiskProjects: Array<{
      projectId: string;
      projectName: string;
      projectNumber: string;
      riskScore: number;
      delayRisk: number;
      budgetRisk: number;
      progress: number;
      status: string;
      overdueTasks: number;
      totalTasks: number;
      completionRate: number;
      reasons: string[];
    }>;
    mediumRiskProjects: Array<{
      projectId: string;
      projectName: string;
      projectNumber: string;
      riskScore: number;
      delayRisk: number;
      budgetRisk: number;
      progress: number;
      status: string;
      overdueTasks: number;
      totalTasks: number;
      completionRate: number;
      reasons: string[];
    }>;
    lowRiskProjects: Array<{
      projectId: string;
      projectName: string;
      projectNumber: string;
      riskScore: number;
      delayRisk: number;
      budgetRisk: number;
      progress: number;
      status: string;
      overdueTasks: number;
      totalTasks: number;
      completionRate: number;
      reasons: string[];
    }>;
    totalRisks: number;
  };
  delayPredictions: {
    projectsAtRisk: Array<{
      projectId: string;
      projectName: string;
      daysOverdue?: number;
      daysRemaining?: number;
      progress: number;
      status: string;
    }>;
    tasksAtRisk: Array<{
      taskId: string;
      title: string;
      projectId: string;
      daysUntilDue: number;
      status: string;
    }>;
    predictedDelays: any[];
  };
  priorityInsights: {
    urgentTasks: Array<{
      taskId: string;
      title: string;
      projectId: string;
      daysUntilDue: number;
      status: string;
    }>;
    overdueTasks: Array<{
      taskId: string;
      title: string;
      projectId: string;
      daysOverdue: number;
      status: string;
    }>;
    highPriorityProjects: any[];
    recommendations: string[];
  };
  resourceAllocation: {
    overAllocatedUsers: any[];
    underUtilizedUsers: any[];
    workloadDistribution: Record<string, number>;
  };
  timelinePredictions: {
    projectsOnTrack: number;
    projectsDelayed: number;
    projectsAtRisk: number;
    averageCompletionTime: number;
  };
  summary: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalHoursTracked: number; // in minutes (for calculation)
    totalHoursTrackedFormatted: string; // formatted like "1h 3m"
  };
}

export interface ProjectInsightsResponse {
  success: boolean;
  message: string;
  data: ProjectInsights;
}

export const useProjectInsights = () => {
  return useQuery<ProjectInsightsResponse>({
    queryKey: ["project-insights"],
    queryFn: async () => {
      const response = await axios.get<ProjectInsightsResponse>(
        "/ai/project-insights"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
