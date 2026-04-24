import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface ClientPositionUpdate {
  clientId: string;
  position: number;
}

export interface BulkUpdatePositionsResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    position: number;
  }>;
}

export const useBulkUpdateClientPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: ClientPositionUpdate[]
    ): Promise<BulkUpdatePositionsResponse> => {
      const response = await axios.patch("/clients/reorder", { updates });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch clients data
      queryClient.invalidateQueries({
        queryKey: ["organization-clients"],
      });
    },
  });
};
