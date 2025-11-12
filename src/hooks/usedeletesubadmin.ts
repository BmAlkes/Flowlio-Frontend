import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { useMutation } from "@tanstack/react-query";

interface DeleteSubAdminRequest {
  id: string;
}

export const useDeleteSubAdmin = () => {
  return useMutation<ApiResponse, ErrorWithMessage, DeleteSubAdminRequest>({
    mutationKey: ["delete subadmin"],
    mutationFn: async ({ id }) => {
      const res = await axios.delete(`/superadmin/delete-subadmin/${id}`);
      return res.data;
    },
  });
};
