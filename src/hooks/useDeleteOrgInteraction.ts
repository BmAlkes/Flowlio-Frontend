import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export const useDeleteOrgInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interactionId: string) => {
      const response = await axios.delete(`/crm/interactions/${interactionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-interactions"] });
      queryClient.invalidateQueries({ queryKey: ["client-timeline"] });
    },
  });
};
