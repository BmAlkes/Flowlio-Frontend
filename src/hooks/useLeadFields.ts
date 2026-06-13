import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export type LeadFieldType = "text" | "number" | "select" | "multiselect" | "date" | "boolean" | "url";

export interface LeadFieldDefinition {
  id: string;
  orgId: string;
  name: string;
  type: LeadFieldType;
  options: string[] | null;
  required: boolean;
  position: number;
  createdAt: string;
}

export interface CreateLeadFieldData {
  name: string;
  type: LeadFieldType;
  options?: string[];
  required?: boolean;
  position?: number;
}

export const useLeadFields = () => {
  return useQuery({
    queryKey: ["lead-fields"],
    queryFn: async () => {
      const response = await axios.get<{ fields: LeadFieldDefinition[] }>("/leads/fields");
      return response.data.fields;
    },
  });
};

export const useCreateLeadField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLeadFieldData) => {
      const response = await axios.post("/leads/fields", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-fields"] });
      toast.success("Field created");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create field");
    },
  });
};

export const useUpdateLeadField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fieldId, data }: { fieldId: string; data: Partial<CreateLeadFieldData> }) => {
      const response = await axios.patch(`/leads/fields/${fieldId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-fields"] });
      toast.success("Field updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update field");
    },
  });
};

export const useDeleteLeadField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fieldId: string) => {
      const response = await axios.delete(`/leads/fields/${fieldId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-fields"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Field deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete field");
    },
  });
};

export const useReorderLeadFields = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; position: number }[]) => {
      const response = await axios.put("/leads/fields/reorder", { fields: items });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-fields"] });
    },
  });
};

export const useLeadCustomValues = (leadId: string) => {
  return useQuery({
    queryKey: ["lead-custom-values", leadId],
    queryFn: async () => {
      const response = await axios.get<{ data: Record<string, any> }>(`/leads/${leadId}/fields`);
      return response.data.data ?? {};
    },
    enabled: !!leadId,
  });
};

export const useUpdateLeadCustomValues = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, values }: { leadId: string; values: Record<string, any> }) => {
      const response = await axios.patch(`/leads/${leadId}/fields`, values);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lead-custom-values", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Fields saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save fields");
    },
  });
};
