import { useQuery, useMutation } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureBreakdownItem {
  feature: string;
  tokens: number;
  requests: number;
}

interface UnreadAlert {
  alertType: string;
  tokensUsed: number;
  tokenLimit: number;
  createdAt?: string;
}

interface AIUsageData {
  currentMonth: {
    totalTokens: number;
    totalRequests: number;
  };
  usagePercent: number;
  featureBreakdown: FeatureBreakdownItem[];
  unreadAlerts: UnreadAlert[];
}

interface AILimitsData {
  limit: {
    id: string;
    organizationId: string;
    tokenLimit: number;
    tokensUsed?: number;
    alertThresholdPercent: number;
    period?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
}

export interface ConfiguredAILimit {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  tokenLimit: number;
  tokensUsed: number;
  totalRequests: number;
  usagePercent: number;
  alertThresholdPercent: number;
  period: string;
  isActive: boolean;
  isDefault: boolean;   // true = no explicit limit in DB, using 50k default
  isDemo: boolean;      // true = demo organization
  createdAt: string;
  updatedAt: string;
}

interface SetAILimitPayload {
  orgId: string;
  tokenLimit: number;
  alertThresholdPercent: number;
}

// ─── Hook 1: useAIUsage ───────────────────────────────────────────────────────

export const useAIUsage = (orgId: string) => {
  return useQuery<AIUsageData>({
    queryKey: ["ai-usage", orgId],
    queryFn: async () => {
      const response = await axios.get(`/ai/usage?orgId=${orgId}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!orgId,
    refetchOnWindowFocus: false,
  });
};

// ─── Hook 2: useAILimits ──────────────────────────────────────────────────────

export const useAILimits = (orgId: string) => {
  return useQuery<AILimitsData>({
    queryKey: ["ai-limits", orgId],
    queryFn: async () => {
      const response = await axios.get(`/ai/limits?orgId=${orgId}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!orgId,
    refetchOnWindowFocus: false,
  });
};

export const useAllAILimits = () => {
  return useQuery<ConfiguredAILimit[]>({
    queryKey: ["ai-limits", "all"],
    queryFn: async () => {
      const response = await axios.get<{ data: ConfiguredAILimit[] }>(
        "/ai/limits/all"
      );
      return response.data.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ─── Hook 3: useSetAILimit ────────────────────────────────────────────────────

export const useSetAILimit = () => {
  return useMutation<unknown, Error, SetAILimitPayload>({
    mutationFn: async (payload: SetAILimitPayload) => {
      const response = await axios.put("/ai/limits", payload);
      return response.data;
    },
  });
};

export const useRemoveAILimit = () => {
  return useMutation<unknown, Error, string>({
    mutationFn: async (orgId: string) => {
      const response = await axios.delete(`/ai/limits/${orgId}`);
      return response.data;
    },
  });
};
