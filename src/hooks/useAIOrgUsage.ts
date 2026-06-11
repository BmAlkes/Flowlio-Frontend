import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AILimitData {
  tokenLimit: number | null;
  alertThresholdPercent: number;
}

export interface AIOrgUsageData {
  currentMonth: {
    totalTokens: number;
    totalRequests: number;
  };
  usagePercent: number;
  limit: AILimitData | null;
  featureBreakdown: {
    feature: string;
    tokens: number;
    requests: number;
  }[];
  unreadAlerts: {
    alertType: string;
    tokensUsed: number;
    tokenLimit: number;
    createdAt?: string;
  }[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches AI usage for the current session's organisation.
 * Backend resolves orgId from the session — no explicit orgId param needed.
 */
export const useAIOrgUsage = () => {
  return useQuery<AIOrgUsageData>({
    queryKey: ["ai-org-usage"],
    queryFn: async () => {
      const res = await axios.get<AIOrgUsageData>("/ai/usage");
      return res.data;
    },
    staleTime: 0,                  // always re-fetch — never serve stale token counts
    refetchOnWindowFocus: true,    // refresh when user switches tab and comes back
    refetchInterval: 60 * 1000,    // auto-poll every 60 s so widget stays live
  });
};
