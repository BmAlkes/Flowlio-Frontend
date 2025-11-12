import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

export const useFetchAllOrganizations = (options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<any[]>, ErrorWithMessage>({
    retryDelay: 5000,
    staleTime: 1000 * 10,
    queryKey: ["fetch all organizations"],
    queryFn: async () => {
      const response = await axios.get(`/organizations/all-organizations`);
      return response.data;
    },
    ...options,
  });
};
