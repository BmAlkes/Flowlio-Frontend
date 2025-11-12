import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface PaymentLink {
  id: string;
  organizationId: string;
  clientId: string;
  projectId: string;
  createdBy: string;
  description: string;
  project: string;
  submittedby: string;
  clientname: string;
  amount: string;
  paymentLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPaymentLinksResponse {
  success: boolean;
  message: string;
  data: PaymentLink[];
}

interface FetchPaymentLinksParams {
  clientId?: string;
  projectId?: string;
  status?: string;
}

const fetchPaymentLinks = async ({
  clientId,
  projectId,
  status,
}: FetchPaymentLinksParams): Promise<GetPaymentLinksResponse> => {
  const params = new URLSearchParams();

  if (clientId) {
    params.append("clientId", clientId);
  }

  if (projectId) {
    params.append("projectId", projectId);
  }

  if (status) {
    params.append("status", status);
  }

  const response = await axios.get<GetPaymentLinksResponse>(
    `/payment-links${params.toString() ? `?${params.toString()}` : ""}`
  );
  return response.data;
};

export const useFetchPaymentLinks = (
  params: FetchPaymentLinksParams = {}
) => {
  return useQuery({
    queryKey: ["payment-links", params],
    queryFn: () => fetchPaymentLinks(params),
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Hook for fetching a single payment link by ID
export const useFetchPaymentLinkById = (paymentLinkId: string) => {
  return useQuery({
    queryKey: ["payment-link", paymentLinkId],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        message: string;
        data: PaymentLink;
      }>(`/payment-links/${paymentLinkId}`);
      return response.data;
    },
    enabled: !!paymentLinkId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 2, // Retry failed requests 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
};
