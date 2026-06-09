import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

interface ReplyPayload {
  interactionId: string;
  content: string;
}

export const useReplyToInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ interactionId, content }: ReplyPayload) => {
      const response = await axios.post(`/crm/interactions/${interactionId}/reply`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-interactions"] });
    },
  });
};
