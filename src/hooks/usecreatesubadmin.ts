import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { ISubAdmin, CreateSubAdminRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useCreateSubAdmin = () => {
  return useMutation<
    ApiResponse<ISubAdmin>,
    ErrorWithMessage,
    CreateSubAdminRequest
  >({
    mutationKey: ["create subadmin"],
    mutationFn: async (body) => {
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const res = await axios.post<ApiResponse<ISubAdmin>>(
        "/superadmin/create-subadmin",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    },
  });
};
