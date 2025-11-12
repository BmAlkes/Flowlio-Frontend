import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import type { IPlan } from "@/types";
import { useQuery } from "@tanstack/react-query";

export type ResponseData = IPlan[];

export const useFetchPlans = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<ResponseData>, ErrorWithMessage>({
    retryDelay: 5000,
    staleTime: 1000 * 10,
    queryKey: ["fetch plans"],
    queryFn: async () => {
      const response = await axios.get(`/superadmin/plans/getallplans`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    ...options,
  });
};

// New hook for fetching public plans (no authentication required)
export const useFetchPublicPlans = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<ResponseData>, ErrorWithMessage>({
    retryDelay: 5000,
    staleTime: 1000 * 10,
    queryKey: ["fetch public plans"],
    queryFn: async () => {
      const response = await axios.get(`/superadmin/plans/public/getallplans`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    ...options,
  });
};
