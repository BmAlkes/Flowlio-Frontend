import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

// ─── Assign Plan ─────────────────────────────────────────────────────────────

export interface AssignPlanPayload {
  planId: string;
  startDate: string;   // ISO date string e.g. "2026-06-16"
  endDate: string;     // ISO date string e.g. "2026-09-16"
  notes?: string;
}

export const useAssignPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { orgId: string } & AssignPlanPayload>({
    mutationFn: async ({ orgId, ...payload }) => {
      const res = await axios.put(
        `/superadmin/organizations/${orgId}/assign-plan`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetch all organizations"] });
      queryClient.invalidateQueries({ queryKey: ["fetch plans"] });
    },
  });
};

// ─── Override Limits ─────────────────────────────────────────────────────────

export interface OverrideLimitsPayload {
  maxUsers?: number | null;
  maxProjects?: number | null;
  maxStorage?: number | null;
  maxTasks?: number | null;
  maxLeads?: number | null;
  maxClients?: number | null;
  maxWebhooks?: number | null;
  maxInvoices?: number | null;
  maxProposals?: number | null;
  aiTokenLimit?: number | null;
}

export const useOverrideLimits = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { orgId: string; overrides: OverrideLimitsPayload }>({
    mutationFn: async ({ orgId, overrides }) => {
      const res = await axios.put(
        `/superadmin/organizations/${orgId}/override-limits`,
        overrides
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetch all organizations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-limits", "all"] });
    },
  });
};
