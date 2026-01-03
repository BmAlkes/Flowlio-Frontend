import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

export const useFetchAllOrganizations = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<any[]>, ErrorWithMessage>({
    retryDelay: 5000,
    staleTime: 1000 * 30, // 30 seconds - balance between freshness and performance
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds to catch renewals
    queryKey: ["fetch all organizations"],
    queryFn: async () => {
      const response = await axios.get(`/organizations/all-organizations`);
      return response.data;
    },
    ...options,
  });
};
