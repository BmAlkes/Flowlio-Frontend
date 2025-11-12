import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  cpfcnpj?: string;
  businessIndustry?: string;
  address?: string;
  status?: string;
  image?: string;
}

export interface UpdateClientResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    cpfcnpj?: string;
    businessIndustry?: string;
    address?: string;
    status: string;
    createdAt: string; // Added for new clients
    updatedAt: string;
  };
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: string;
      data: UpdateClientData;
    }): Promise<UpdateClientResponse> => {
      const response = await axios.put(`/clients/${clientId}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch clients data
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["organization-clients"] });
    },
    onError: (error: any) => {
      console.error("Error updating client:", error);
    },
  });
};
