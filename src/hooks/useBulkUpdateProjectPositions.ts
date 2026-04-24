import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface ProjectPositionUpdate {
  projectId: string;
  position: number;
}

export interface BulkUpdateProjectPositionsResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    position: number;
  }>;
}

/**
 * Hook for bulk updating project positions via API
 * Used for drag-and-drop reordering functionality
 *
 * @example
 * const { mutate: bulkUpdatePositions } = useBulkUpdateProjectPositions();
 *
 * bulkUpdatePositions(
 *   updates.map((update) => ({
 *     projectId: update.id,
 *     position: update.position,
 *   })),
 *   {
 *     onSuccess: () => toast.success("Projects reordered"),
 *     onError: () => toast.error("Failed to reorder"),
 *   }
 * );
 */
export const useBulkUpdateProjectPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: ProjectPositionUpdate[]
    ): Promise<BulkUpdateProjectPositionsResponse> => {
      const response = await axios.patch("/projects/reorder", { updates });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects data
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
};
