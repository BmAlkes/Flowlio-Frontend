import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

interface DeleteClientResponse {
  id: string;
  deleted: boolean;
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<DeleteClientResponse>,
    ErrorWithMessage,
    string
  >({
    mutationFn: async (id: string) => {
      const response = await axios.delete<ApiResponse<DeleteClientResponse>>(
        `/clients/${id}`
      );
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log("Client deleted successfully:", data);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["organization-clients"] });

      // Remove the deleted client from cache
      queryClient.removeQueries({ queryKey: ["client", id] });
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
    },
  });
};
