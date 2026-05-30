import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export type LeadTemperature = "Hot" | "Warm" | "Cold" | "Close";

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
    onSuccess: (responseData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["lead-insights", variables.clientId] });
      if (responseData?.data) {
        queryClient.setQueryData(["client", variables.clientId], responseData.data);
      }
      toast.success("Value updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update value");
    },
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
