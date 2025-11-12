import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

interface UpdateSubAdminPermissionData {
  id: string;
  permission: "Active" | "Deactivated";
}

interface UpdateSubAdminPermissionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    permission: string;
    createdAt: string;
    updatedAt: string;
  };
}

const updateSubAdminPermission = async (
  data: UpdateSubAdminPermissionData
): Promise<UpdateSubAdminPermissionResponse> => {
  const response = await axios.put(
    `/superadmin/update-subadmin-permission/${data.id}`,
    {
      permission: data.permission,
    }
  );
  return response.data;
};

export const useUpdateSubAdminPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubAdminPermission,
    onSuccess: (data) => {
      // Invalidate and refetch sub admin queries
      queryClient.invalidateQueries({
        queryKey: ["subadmins"],
      });

      toast.success(
        `Sub admin permission updated to ${data.data.permission} successfully`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update sub admin permission";
      toast.error(errorMessage);
    },
  });
};
