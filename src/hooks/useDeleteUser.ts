import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";
import { toast } from "sonner";

interface DeleteUserResponse {
  deletedUser: {
    id: string;
    name: string;
    email: string;
  };
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<DeleteUserResponse>, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await axios.delete<ApiResponse<DeleteUserResponse>>(
        `/superadmin/users/${userId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["superadmin-users"] });
      toast.success(
        `User ${data?.data?.deletedUser?.email} deleted successfully`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete user";
      toast.error(errorMessage);
    },
  });
};
