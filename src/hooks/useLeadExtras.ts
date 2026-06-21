import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LeadTag {
  id: string;
  name: string;
  color: string;
  leadCount?: number;
}

export interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  conditions: {
    match: "all" | "any";
    rules: { field: string; operator: string; value: string }[];
  };
  actions: {
    assignTo?: string | null;
    setTemperature?: string | null;
    setStatus?: string | null;
    addTags?: string[];
    notify?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingLead?: { id: string; name: string; email: string };
}

// ─── Lead Assignment ─────────────────────────────────────────────────────────

export const useAssignLead = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { leadId: string; userId: string | null }>({
    mutationFn: async ({ leadId, userId }) => {
      const res = await axios.patch(`/leads/${leadId}/assign`, { userId });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

// ─── Lead Tags ───────────────────────────────────────────────────────────────

export const useLeadTags = () =>
  useQuery<LeadTag[]>({
    queryKey: ["lead-tags"],
    queryFn: async () => {
      const res = await axios.get("/leads/tags");
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 60_000,
  });

export const useCreateLeadTag = () => {
  const qc = useQueryClient();
  return useMutation<LeadTag, Error, { name: string; color: string }>({
    mutationFn: async (payload) => {
      const res = await axios.post("/leads/tags", payload);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-tags"] }),
  });
};

export const useUpdateLeadTag = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { tagId: string; name?: string; color?: string }>({
    mutationFn: async ({ tagId, ...payload }) => {
      const res = await axios.patch(`/leads/tags/${tagId}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-tags"] }),
  });
};

export const useDeleteLeadTag = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (tagId) => {
      const res = await axios.delete(`/leads/tags/${tagId}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead-tags"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useSetLeadTags = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { leadId: string; tagIds: string[] }>({
    mutationFn: async ({ leadId, tagIds }) => {
      const res = await axios.post(`/leads/${leadId}/tags`, { tagIds });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
};

// ─── Routing Rules ───────────────────────────────────────────────────────────

export const useRoutingRules = () =>
  useQuery<RoutingRule[]>({
    queryKey: ["lead-routing-rules"],
    queryFn: async () => {
      const res = await axios.get("/leads/routing-rules");
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 60_000,
  });

export const useCreateRoutingRule = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, Omit<RoutingRule, "id" | "createdAt" | "updatedAt">>({
    mutationFn: async (payload) => {
      const res = await axios.post("/leads/routing-rules", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-routing-rules"] }),
  });
};

export const useUpdateRoutingRule = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { ruleId: string } & Partial<RoutingRule>>({
    mutationFn: async ({ ruleId, ...payload }) => {
      const res = await axios.patch(`/leads/routing-rules/${ruleId}`, payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-routing-rules"] }),
  });
};

export const useDeleteRoutingRule = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (ruleId) => {
      const res = await axios.delete(`/leads/routing-rules/${ruleId}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-routing-rules"] }),
  });
};

// ─── Duplicate Check ─────────────────────────────────────────────────────────

export const useCheckDuplicate = () =>
  useMutation<DuplicateCheckResult, Error, { email?: string; phone?: string }>({
    mutationFn: async (payload) => {
      const res = await axios.post("/leads/check-duplicate", payload);
      return res.data?.data ?? res.data;
    },
  });

// ─── Export CSV ──────────────────────────────────────────────────────────────

export const useExportLeads = () =>
  useMutation<void, Error, Record<string, string>>({
    mutationFn: async (filters) => {
      const params = new URLSearchParams(filters);
      const res = await axios.get(`/leads/export?${params.toString()}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });

// ─── Bulk Operations ─────────────────────────────────────────────────────────

export interface BulkPayload {
  leadIds: string[];
  action: "assign" | "set_status" | "set_temperature" | "add_tags" | "delete";
  payload?: {
    userId?: string;
    status?: string;
    temperature?: string;
    tagIds?: string[];
  };
}

export const useBulkLeadAction = () => {
  const qc = useQueryClient();
  return useMutation<{ affected: number }, Error, BulkPayload>({
    mutationFn: async (body) => {
      const res = await axios.post("/leads/bulk", body);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead-tags"] });
    },
  });
};

// ─── Webhook Retry ───────────────────────────────────────────────────────────

export const useRetryWebhookLog = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { logId: string; webhookId: string }>({
    mutationFn: async ({ logId }) => {
      const res = await axios.post(`/webhooks/logs/${logId}/retry`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhook"] }),
  });
};
