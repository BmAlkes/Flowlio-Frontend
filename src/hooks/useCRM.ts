import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export type LeadTemperature = "Hot" | "Warm" | "Cold" | "Lost";

export interface ClientInteraction {
  id: string;
  clientId: string;
  userId: string;
  type: "note" | "call" | "email" | "meeting" | "status_change" | "temperature_change";
  content: string;
  metadata?: any;
  createdAt: string;
  user?: {
    name: string;
    image: string;
  };
}

export interface LeadInsights {
  score: number;
  temperature: LeadTemperature;
  isManualTemperature: boolean;
  daysSinceLastContact: number;
  interactionCount: number;
  recommendedAction: string;
}

// Patches a single client in all cached variants of ["clients", *]
function patchClientInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  clientId: string,
  patch: Record<string, any>
) {
  queryClient.setQueriesData({ queryKey: ["clients"] }, (old: any) => {
    if (!old?.data) return old;
    return {
      ...old,
      data: old.data.map((c: any) =>
        c.id === clientId ? { ...c, ...patch } : c
      ),
    };
  });
}

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      newStatus: string;
      oldStatus?: string;
      newPosition?: number;
    }) => {
      const response = await axios.patch("/leads/status", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Lead status updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
};

export const useUpdateLeadTemperature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      temperature: LeadTemperature | null;
    }) => {
      const response = await axios.patch(`/leads/${data.clientId}/temperature`, {
        temperature: data.temperature,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lead-insights", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["client-timeline", variables.clientId] });
      toast.success(
        variables.temperature ? "Temperature updated" : "Temperature reset to automatic"
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update temperature");
    },
  });
};

export const useClientTimeline = (clientId: string) => {
  return useQuery({
    queryKey: ["client-timeline", clientId],
    queryFn: async () => {
      const response = await axios.get(`/leads/timeline/${clientId}`);
      return response.data.data as ClientInteraction[];
    },
    enabled: !!clientId,
  });
};

export const useAddInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      type: string;
      content: string;
      metadata?: any;
    }) => {
      const response = await axios.post("/leads/timeline", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Optimistic: update lastInteractionAt immediately in the kanban cache
      patchClientInCache(queryClient, variables.clientId, {
        lastInteractionAt: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["client-timeline", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["lead-insights", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Interaction logged");
    },
  });
};

export const useUpdateLeadValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { clientId: string; leadValue: number }) => {
      const response = await axios.patch(`/leads/${data.clientId}/value`, {
        leadValue: data.leadValue,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Optimistic: update leadValue immediately in the kanban cache
      patchClientInCache(queryClient, variables.clientId, {
        leadValue: variables.leadValue,
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["lead-insights", variables.clientId] });
      toast.success("Value updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update value");
    },
  });
};

export const useSetFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { clientId: string; followUpAt: string | null }) => {
      const response = await axios.patch(`/leads/${data.clientId}/followup`, {
        followUpAt: data.followUpAt,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      patchClientInCache(queryClient, variables.clientId, {
        followUpAt: variables.followUpAt,
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["followups-dashboard"] });
      // Refresh notifications so the bell picks up the new follow_up_scheduled entry
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(variables.followUpAt ? "Follow-up agendado" : "Follow-up cancelado");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to schedule follow-up");
    },
  });
};

export const useDeleteInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { interactionId: string; clientId: string }) => {
      const response = await axios.delete(`/leads/timeline/${data.interactionId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["client-timeline", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["lead-insights", variables.clientId] });
      toast.success("Interaction deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete interaction");
    },
  });
};

export interface FollowUpLead {
  id: string;
  name: string;
  businessIndustry?: string;
  status: string;
  followUpAt: string;
  image?: string;
}

export interface FollowUpDashboardData {
  overdue: FollowUpLead[];
  today: FollowUpLead[];
  upcoming: FollowUpLead[];
}

export const useFollowUpsDashboard = () => {
  return useQuery({
    queryKey: ["followups-dashboard"],
    queryFn: async () => {
      const response = await axios.get("/leads/followups/dashboard");
      return response.data.data as FollowUpDashboardData;
    },
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useLeadInsights = (clientId: string) => {
  return useQuery({
    queryKey: ["lead-insights", clientId],
    queryFn: async () => {
      const response = await axios.get(`/leads/insights/${clientId}`);
      return response.data.data as LeadInsights;
    },
    enabled: !!clientId,
  });
};
