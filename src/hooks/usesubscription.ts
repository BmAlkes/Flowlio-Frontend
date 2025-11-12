import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export interface SubscriptionStatus {
  hasSubscription: boolean;
  status: string;
  subscription?: any;
  plan?: any;
  message: string;
  requiresSubscription: boolean;
  redirectTo?: string;
}

export interface SubscriptionResponse {
  data: SubscriptionStatus;
}

export const useSubscriptionStatus = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<SubscriptionStatus>, ErrorWithMessage>({
    retryDelay: 5000,
    staleTime: 1000 * 30, // 30 seconds
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const response = await axios.get(`/subscriptions/status`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useSubscriptionValidation = () => {
  const { data, isLoading, error } = useSubscriptionStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.data && data.data.requiresSubscription && data.data.redirectTo) {
      // Redirect to pricing page if subscription is required
      navigate(data.data.redirectTo);
    }
  }, [data, navigate]);

  return {
    subscriptionStatus: data?.data,
    isLoading,
    error,
    requiresSubscription: data?.data?.requiresSubscription || false,
  };
};

export const useSubscriptionGuard = (
  redirectTo: string = "/pricing" // Changed default to pricing page
) => {
  const { data, isLoading, error } = useSubscriptionStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && data?.data && data.data.requiresSubscription) {
      // Use the redirectTo from the API response, or fallback to the provided redirectTo
      const targetRedirect = data.data.redirectTo || redirectTo;
      navigate(targetRedirect);
    }
  }, [data, isLoading, navigate, redirectTo]);

  return {
    subscriptionStatus: data?.data,
    isLoading,
    error,
    hasActiveSubscription:
      data?.data?.hasSubscription && !data.data.requiresSubscription,
  };
};
