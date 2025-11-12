import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ deletedPlan: { id: string; name: string; slug: string } }>,
    ErrorWithMessage,
    string
  >({
    mutationKey: ["delete plan"],
    mutationFn: async (planId: string) => {
      const res = await axios.delete<
        ApiResponse<{ deletedPlan: { id: string; name: string; slug: string } }>
      >(`/superadmin/plans/${planId}`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch plans after successful deletion
      queryClient.invalidateQueries({ queryKey: ["fetch plans"] });
    },
  });
};
