import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useQuery } from "@tanstack/react-query";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  customPlanName?: string | null; // Custom display name
  price: number;
  currency: string;
  interval: string;
  billingCycle?: "days" | "monthly" | "yearly";
  durationValue?: number | null;
  durationType?: "days" | "monthly" | "yearly" | null;
  trialDays?: number | null; // Number of trial days (0 = no trial)
  features: string[] | any; // Can be array or object
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const useAvailablePlans = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<SubscriptionPlan[]>, ErrorWithMessage>({
    retryDelay: 5000,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryKey: ["available-plans"],
    queryFn: async () => {
      const response = await axios.get(`/subscriptions/plans`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    ...options,
  });
};
