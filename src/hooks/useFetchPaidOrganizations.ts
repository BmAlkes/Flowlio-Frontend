import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

interface PaidOrganization {
  id: string;
  name: string;
  slug: string;
}

export const useGetPaidOrganizations = () => {
  return useQuery<PaidOrganization[], ErrorWithMessage>({
    queryKey: ["paid-organizations"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<any[]>>(
        `/organizations/all-organizations`
      );
      const orgs: any[] = response.data?.data ?? [];
      return orgs
        .filter(
          (org) =>
            org.subscriptionStatus === "active" &&
            org.subscriptionPlanId !== null
        )
        .map((org) => ({
          id: org.id as string,
          name: org.name as string,
          slug: org.slug as string,
        }));
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
