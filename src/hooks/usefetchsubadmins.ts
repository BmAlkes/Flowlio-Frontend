import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import type { ISubAdmin, IUser } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";

const LIMIT = 10;

export type ResponseData = ISubAdmin<{ users?: IUser[] }>;

export const useFetchSubAdmins = (options?: {
  enable?: boolean;
  limit?: number;
}) => {
  return useInfiniteQuery<ApiResponse<ResponseData[]>, ErrorWithMessage>({
    retryDelay: 5000,
    initialPageParam: 0,
    staleTime: 1000 * 10,
    queryKey: ["fetch subadmins"],
    queryFn: async () => {
      const response = await axios.get(`/superadmin/fetch-subadmins`);

      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data || lastPage.data.length < LIMIT) return undefined;
      return allPages.length * LIMIT;
    },
    refetchOnWindowFocus: false,
    ...options,
  });
};
