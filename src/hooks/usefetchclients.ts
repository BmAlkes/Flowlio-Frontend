import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

interface Client {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  cpfcnpj?: string;
  businessIndustry?: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientsResponse {
  success: boolean;
  message: string;
  data: Client[];
  total: number;
}

interface FetchClientsParams {
  search?: string;
  status?: string;
  industry?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useFetchClients = (params: FetchClientsParams = {}) => {
  return useQuery<ClientsResponse>({
    queryKey: ["clients", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.search) searchParams.append("search", params.search);
      if (params.status) searchParams.append("status", params.status);
      if (params.industry) searchParams.append("industry", params.industry);
      if (params.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const response = await axios.get<ClientsResponse>(
        `/clients?${searchParams.toString()}`
      );
      return response.data;
    },
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

export const useFetchOrganizationClients = () => {
  return useQuery<ClientsResponse>({
    queryKey: ["organization-clients"],
    queryFn: async () => {
      try {
        const response = await axios.get<ClientsResponse>(`/clients`);
        return response.data;
      } catch (error) {
        console.error("❌ Error fetching clients:", error);
        throw error;
      }
    },
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 0,
    retryDelay: 0,
  });
};
