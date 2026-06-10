import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

interface CreateOrgInteractionPayload {
  clientId: string;
  content: string;
}

export const useCreateOrgInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrgInteractionPayload) => {
      const response = await axios.post("/crm/interactions", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-interactions"] });
      queryClient.invalidateQueries({ queryKey: ["client-timeline"] });
    },
  });
};
