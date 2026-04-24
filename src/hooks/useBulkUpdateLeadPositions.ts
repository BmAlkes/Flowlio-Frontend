import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface LeadPositionUpdate {
  leadId: string;
  position: number;
}

export interface BulkUpdateLeadPositionsResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    position: number;
  }>;
}

/**
 * Hook for bulk updating lead positions via API
 * Used for drag-and-drop reordering functionality
 *
 * @example
 * const { mutate: bulkUpdatePositions } = useBulkUpdateLeadPositions();
 *
 * bulkUpdatePositions(
 *   updates.map((update) => ({
 *     leadId: update.id,
 *     position: update.position,
 *   })),
 *   {
 *     onSuccess: () => toast.success("Leads reordered"),
 *     onError: () => toast.error("Failed to reorder"),
 *   }
 * );
 */
export const useBulkUpdateLeadPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: LeadPositionUpdate[]
    ): Promise<BulkUpdateLeadPositionsResponse> => {
      const response = await axios.patch("/leads/reorder", { updates });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch leads data
      queryClient.invalidateQueries({
        queryKey: ["leads"],
      });
    },
  });
};
