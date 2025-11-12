import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios, type ErrorWithMessage } from "@/configs/axios.config";

interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  cpfcnpj?: string;
  businessIndustry?: string;
  address?: string;
  status?: string;
  image?: string | null;
}

interface CreateClientResponse {
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
    createdAt: string;
  };
}

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateClientResponse, ErrorWithMessage, CreateClientData>({
    mutationFn: async (data: CreateClientData) => {
      const response = await axios.post<CreateClientResponse>(
        "/clients/create",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Client created successfully:", data);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-clients"],
      });

      // You can add more query invalidations here if needed
    },
    onError: (error) => {
      console.error("Error creating client:", error);
    },
  });
};
