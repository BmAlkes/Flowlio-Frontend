import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

export interface PlanAccessCheck {
  hasAccess: boolean;
  reason?: string;
  currentCount?: number;
  maxAllowed?: number;
  planFeatures?: {
    maxUsers?: number;
    maxProjects?: number;
    maxStorage?: number;
    maxTasks?: number;
    aiAssist?: boolean;
    prioritySupport?: boolean;
    calendarAccess?: boolean;
    taskManagement?: boolean;
    timeTracking?: boolean;
    customFeatures?: string[];
    [key: string]: any;
  };
}

/**
 * Hook to check if organization can create more users
 */
export const useCanCreateUser = () => {
  return useQuery<ApiResponse<PlanAccessCheck>, ErrorWithMessage>({
    queryKey: ["plan-access", "can-create-user"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PlanAccessCheck>>(
        "/organizations/plan-access/can-create-user"
      );
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to check if organization can create more projects
 */
export const useCanCreateProject = () => {
  return useQuery<ApiResponse<PlanAccessCheck>, ErrorWithMessage>({
    queryKey: ["plan-access", "can-create-project"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PlanAccessCheck>>(
        "/organizations/plan-access/can-create-project"
      );
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to check if organization has access to a specific feature
 */
export const useHasFeatureAccess = (featureName: string) => {
  return useQuery<ApiResponse<PlanAccessCheck>, ErrorWithMessage>({
    queryKey: ["plan-access", "feature", featureName],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PlanAccessCheck>>(
        `/organizations/plan-access/feature/${featureName}`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
