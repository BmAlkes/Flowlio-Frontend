import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { IPlan } from "@/types";
import { useMutation } from "@tanstack/react-query";

export interface UpsertPlanRequest {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  customPlanName?: string | null; // Custom display name
  price: number;
  currency?: string;
  billingCycle?: "days" | "monthly" | "yearly";
  durationValue?: number | null;
  durationType?: "days" | "monthly" | "yearly" | null;
  trialDays?: number | null; // Number of trial days (0 = no trial, null = default 7)
  features?: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    maxTasks: number;
    aiAssist: boolean;
    prioritySupport: boolean;
    calendarAccess?: boolean;
    taskManagement?: boolean;
    timeTracking?: boolean;
    customFeatures?: string[];
    [key: string]: any;
  };
  isActive?: boolean;
  sortOrder?: number;
}

export const useUpsertPlan = () => {
  return useMutation<
    ApiResponse<IPlan & { isUpdate: boolean }>,
    ErrorWithMessage,
    UpsertPlanRequest
  >({
    mutationKey: ["upsert plan"],
    mutationFn: async (data) => {
      const res = await axios.post<ApiResponse<IPlan & { isUpdate: boolean }>>(
        `/superadmin/plans/upsert`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    },
  });
};
