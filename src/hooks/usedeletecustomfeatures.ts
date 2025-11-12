import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteCustomFeaturesRequest {
  planId: string;
  featuresToDelete: string[];
}

interface DeleteCustomFeaturesResponse {
  plan: any;
  deletedFeatures: string[];
  remainingCustomFeatures: string[];
}

export const useDeleteCustomFeatures = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<DeleteCustomFeaturesResponse>,
    ErrorWithMessage,
    DeleteCustomFeaturesRequest
  >({
    mutationKey: ["delete custom features"],
    mutationFn: async (data: DeleteCustomFeaturesRequest) => {
      const res = await axios.delete<ApiResponse<DeleteCustomFeaturesResponse>>(
        `/superadmin/plans/features/delete`,
        {
          data,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch plans after successful deletion
      queryClient.invalidateQueries({ queryKey: ["fetch plans"] });
    },
  });
};
