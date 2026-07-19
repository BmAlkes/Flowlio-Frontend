import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

export interface SlackIntegrationSettings {
  slackWebhookUrl: string | null;
  slackConnectedAt: string | null;
}

export const useSlackIntegration = (organizationId: string | undefined) =>
  useQuery<{ success: boolean; data: SlackIntegrationSettings }>({
    queryKey: ["slack-integration", organizationId],
    enabled: !!organizationId,
    retry: false,
    queryFn: async () => {
      const response = await axios.get(`/organizations/integrations/slack?organizationId=${organizationId}`);
      return response.data;
    },
  });

export const useUpdateSlackIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      organizationId,
      webhookUrl,
    }: {
      organizationId: string;
      webhookUrl: string | null;
    }) => {
      const response = await axios.patch("/organizations/integrations/slack", {
        organizationId,
        webhookUrl,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["slack-integration", variables.organizationId] });
      toast.success(variables.webhookUrl ? "Slack connected!" : "Slack disconnected.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update Slack integration");
    },
  });
};

export const useTestSlackIntegration = () =>
  useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await axios.post("/organizations/integrations/slack/test", { organizationId });
      return response.data;
    },
    onSuccess: () => toast.success("Test message sent — check your Slack channel!"),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send test message");
    },
  });
