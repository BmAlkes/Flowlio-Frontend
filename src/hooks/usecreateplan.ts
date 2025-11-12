import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { IPlan, CreatePlanRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useCreatePlan = () => {
  return useMutation<ApiResponse<IPlan>, ErrorWithMessage, CreatePlanRequest>({
    mutationKey: ["create plan"],
    mutationFn: async (body) => {
      const res = await axios.post<ApiResponse<IPlan>>(
        "/superadmin/plans/create_singleplan",
        body,
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
