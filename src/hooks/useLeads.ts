import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface Lead {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  cpfcnpj?: string;
  businessIndustry?: string;
  address?: string;
  status: string;
  type: "lead" | "client";
  leadValue?: number;
  temperature?: "Hot" | "Warm" | "Cold" | "Lost" | null;
  leadTemperature?: "Hot" | "Warm" | "Cold" | "Lost" | null;
  lastInteractionAt?: string | null;
  followUpAt?: string | null;
  position: number;
  customFields?: Record<string, any>;
  socialMediaLinks?: string;
  webhookId?: string | null;
  webhookName?: string | null;
  assignedTo?: string | null;
  assignedAt?: string | null;
  assignedUser?: { id: string; name: string; email: string } | null;
  tags?: { id: string; name: string; color: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface FetchLeadsParams {
  search?: string;
  status?: string;
  temperature?: string;
  dateRange?: string;
  webhookId?: string;
  page?: number;
  limit?: number;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  cpfcnpj?: string;
  businessIndustry?: string;
  address?: string;
  leadValue?: number;
  customFields?: Record<string, any>;
  image?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  cpfcnpj?: string;
  businessIndustry?: string;
  address?: string;
  leadValue?: number;
  customFields?: Record<string, any>;
  image?: string;
}

export const useLeads = (params: FetchLeadsParams = {}) => {
  return useQuery<LeadsResponse>({
    queryKey: ["leads", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append("search", params.search);
      if (params.status) searchParams.append("status", params.status);
      if (params.temperature) searchParams.append("temperature", params.temperature);
      if (params.dateRange) searchParams.append("dateRange", params.dateRange);
      if (params.webhookId) searchParams.append("webhookId", params.webhookId);
      if (params.page) searchParams.append("page", String(params.page));
      if (params.limit) searchParams.append("limit", String(params.limit));

      const response = await axios.get<LeadsResponse>(`/leads?${searchParams.toString()}`);
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      const response = await axios.post("/leads", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create lead");
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeadData }) => {
      const response = await axios.patch(`/leads/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update lead");
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/leads/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete lead");
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/leads/${id}/convert`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Lead converted to client successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to convert lead");
    },
  });
};
