import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { toast } from "sonner";

// Delete Organization Hook - using your existing API structure
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, ErrorWithMessage, string>({
    mutationFn: async (organizationId: string) => {
      const response = await axios.delete(
        `/superadmin/organizations/${organizationId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-organizations"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete organization");
    },
  });
};
