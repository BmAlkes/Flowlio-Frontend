import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useMutation } from "@tanstack/react-query";

export interface UpdateSuperAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const useUpdateSuperAdminPassword = () => {
  return useMutation<
    ApiResponse<{ message: string }>,
    ErrorWithMessage,
    UpdateSuperAdminPasswordRequest
  >({
    mutationKey: ["update super admin password"],
    mutationFn: async (data) => {
      const res = await axios.put<ApiResponse<{ message: string }>>(
        `/superadmin/updatesuperadmin-password`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    },
  });
};
