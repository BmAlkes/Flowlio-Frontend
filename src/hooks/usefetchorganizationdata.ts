import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface OrganizationClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationClientsResponse {
  success: boolean;
  message: string;
  data: OrganizationClient[];
}

export interface OrganizationUsersResponse {
  success: boolean;
  message: string;
  data: OrganizationUser[];
}

// Hook to fetch organization clients
export const useFetchOrganizationClients = () => {
  return useQuery({
    queryKey: ["organization-clients"],
    queryFn: async (): Promise<OrganizationClientsResponse> => {
      const response = await axios.get<OrganizationClientsResponse>(
        "/projects/clients/organization"
      );
      return response.data;
    },
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Hook to fetch organization users
export const useFetchOrganizationUsers = () => {
  return useQuery({
    queryKey: ["organization-users"],
    queryFn: async (): Promise<OrganizationUsersResponse> => {
      const response = await axios.get<OrganizationUsersResponse>(
        "/projects/users/organization"
      );
      return response.data;
    },
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};
