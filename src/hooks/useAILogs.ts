import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIUsageLog {
  id: string;
  organizationId: string;
  userId: string;
  feature: string;
  endpoint: string;
  tokensUsed: number;
  model: string | null;
  durationMs: number | null;
  status: string;
  errorMessage: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  organizationName?: string;
}

export interface AILogsSummary {
  totalTokens: number;
  totalRequests: number;
  avgDurationMs: number;
  errorRate: number;
}

export interface AILogsResponse {
  logs: AIUsageLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: AILogsSummary;
}

export interface AILogsFilters {
  orgId?: string;
  userId?: string;
  feature?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Superadmin: All AI logs ─────────────────────────────────────────────────

export const useAILogs = (filters: AILogsFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.orgId) params.set("orgId", filters.orgId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.feature) params.set("feature", filters.feature);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 50));

  return useQuery<AILogsResponse>({
    queryKey: ["ai-logs", filters],
    queryFn: async () => {
      const res = await axios.get<{ success: boolean; data: AILogsResponse }>(
        `/superadmin/ai/logs?${params.toString()}`
      );
      return res.data.data;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ─── User: own AI logs ───────────────────────────────────────────────────────

export const useMyAILogs = (filters: Omit<AILogsFilters, "orgId" | "userId"> = {}) => {
  const params = new URLSearchParams();
  if (filters.feature) params.set("feature", filters.feature);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 25));

  return useQuery<AILogsResponse>({
    queryKey: ["ai-my-logs", filters],
    queryFn: async () => {
      const res = await axios.get<{ success: boolean; data: AILogsResponse }>(
        `/ai/my-usage-logs?${params.toString()}`
      );
      return res.data.data;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ─── Org admin: per-user token limits ────────────────────────────────────────

export interface AIUserLimit {
  userId: string;
  userName: string;
  userEmail: string;
  monthlyLimit: number | null;
  tokensUsedThisMonth: number;
}

export const useAIUserLimits = () => {
  return useQuery<AIUserLimit[]>({
    queryKey: ["ai-user-limits"],
    queryFn: async () => {
      const res = await axios.get<{ success: boolean; data: AIUserLimit[] }>(
        "/ai/user-limits"
      );
      return res.data.data ?? [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSetAIUserLimit = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { userId: string; monthlyLimit: number | null }>({
    mutationFn: async (payload) => {
      const res = await axios.put("/ai/user-limits", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-user-limits"] });
    },
  });
};

// ─── Dismiss AI alerts ───────────────────────────────────────────────────────

export const useDismissAIAlerts = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { alertIds: string[] }>({
    mutationFn: async (payload) => {
      const res = await axios.post("/ai/alerts/dismiss", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-org-usage"] });
      queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
    },
  });
};
