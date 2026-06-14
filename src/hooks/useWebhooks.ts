import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export type WebhookSource = "wordpress" | "facebook" | "generic";

export interface Webhook {
  id: string;
  orgId: string;
  name: string;
  source: WebhookSource;
  token: string;
  active: boolean;
  fieldMapping: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  totalCalls?: number;
  lastCallAt?: string | null;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  status: "success" | "error";
  payload: Record<string, any>;
  leadId: string | null;
  error: string | null;
  ip: string;
  createdAt: string;
}

export interface WebhookLogsResponse {
  logs: WebhookLog[];
  total: number;
  page: number;
}

export const useWebhooks = () => {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const response = await axios.get<{ webhooks: Webhook[] }>("/webhooks");
      return response.data.webhooks;
    },
  });
};

export const useWebhook = (id: string) => {
  return useQuery({
    queryKey: ["webhook", id],
    queryFn: async () => {
      const response = await axios.get<{ webhook: Webhook }>(`/webhooks/${id}`);
      return response.data.webhook;
    },
    enabled: !!id,
  });
};

export const useCreateWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; source: WebhookSource }) => {
      const response = await axios.post<{ webhook: Webhook }>("/webhooks", data);
      return response.data.webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create webhook");
    },
  });
};

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; source?: WebhookSource; active?: boolean } }) => {
      const response = await axios.patch(`/webhooks/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhook", variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update webhook");
    },
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/webhooks/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete webhook");
    },
  });
};

export const useUpdateWebhookMapping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, mapping }: { id: string; mapping: Record<string, string> }) => {
      const response = await axios.put(`/webhooks/${id}/mapping`, mapping);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["webhook", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Mapping saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save mapping");
    },
  });
};

export const useWebhookLogs = (id: string, page = 1) => {
  return useQuery({
    queryKey: ["webhook-logs", id, page],
    queryFn: async () => {
      const response = await axios.get<WebhookLogsResponse>(`/webhooks/${id}/logs?page=${page}&limit=20`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useTestWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/webhooks/${id}/test`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["webhook-logs", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Test sent — check the logs and your leads");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Test failed");
    },
  });
};

export const useLeadWebhookPayload = (leadId: string) => {
  return useQuery({
    queryKey: ["lead-webhook-payload", leadId],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        data: { payload: Record<string, any>; webhookName: string | null; createdAt: string } | null;
      }>(`/webhooks/logs/by-lead/${leadId}`);
      return response.data.data;
    },
    enabled: !!leadId,
  });
};

export const useDeleteWebhookLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { logId: string; webhookId: string }) => {
      const response = await axios.delete(`/webhooks/logs/${params.logId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["webhook-logs", variables.webhookId] });
      toast.success("Log deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete log");
    },
  });
};

export const useRotateWebhookToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post<{ webhook: Webhook }>(`/webhooks/${id}/rotate-token`);
      return response.data.webhook;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["webhook", id] });
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Token rotated — update your integration URL");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to rotate token");
    },
  });
};
