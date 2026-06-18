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

// ─── Plan Payment Link (On-Demand) ───────────────────────────────────────────

export interface CreatePlanPaymentPayload {
  orgId: string;
  planId: string;
  amount: number;
  currency?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  description?: string;
}

export interface CreatePlanPaymentResult {
  approvalUrl: string;
  orderId: string;
  requestId: string;
}

export const useCreatePlanPayment = () => {
  return useMutation<CreatePlanPaymentResult, Error, CreatePlanPaymentPayload>({
    mutationFn: async (payload) => {
      const res = await axios.post<{ success: boolean; data: CreatePlanPaymentResult }>(
        `/superadmin/invoices/plan-payment`,
        payload
      );
      return res.data.data;
    },
  });
};

export interface ConfirmPlanPaymentPayload {
  orderId: string;
  orgId: string;
  planId: string;
}

export interface ConfirmPlanPaymentResult {
  invoiceNumber: string;
  planName: string;
  orgName: string;
  amount: number;
  currency: string;
}

export const useConfirmPlanPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<ConfirmPlanPaymentResult, Error, ConfirmPlanPaymentPayload>({
    mutationFn: async (payload) => {
      const res = await axios.post<{ success: boolean; data: ConfirmPlanPaymentResult }>(
        `/superadmin/invoices/plan-payment/confirm`,
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetch all organizations"] });
      queryClient.invalidateQueries({ queryKey: ["ai-limits", "all"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
