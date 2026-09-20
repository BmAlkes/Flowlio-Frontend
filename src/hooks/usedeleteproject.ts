import { corePath } from "@/contracts/core-api";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ id: string; deleted: boolean }>,
    ErrorWithMessage,
    string
  >({
    mutationKey: ["delete project"],
    mutationFn: async (projectId: string) => {
      const res = await axios.delete<
        ApiResponse<{ id: string; deleted: boolean }>
      >(corePath("projectDelete", { id: projectId }));
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects after successful deletion
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["organization-projects"] });

      // Invalidate chart queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["project-schedule-data"] });
      queryClient.invalidateQueries({ queryKey: ["project-status-data"] });
    },
  });
};
