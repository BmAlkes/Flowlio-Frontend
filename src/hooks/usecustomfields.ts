import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export type CustomFieldType = "text" | "number" | "date" | "select" | "boolean";

export interface CustomFieldDefinition {
  id: string;
  organizationId: string;
  entityType: string;
  name: string;
  type: CustomFieldType;
  options?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomFieldData {
  name: string;
  type: CustomFieldType;
  options?: string[];
  entityType?: string;
}

export interface UpdateCustomFieldData {
  id: string;
  name?: string;
  options?: string[];
}

// Fetch Custom Fields
export const useFetchCustomFields = (entityType: string = "project") => {
  return useQuery({
    queryKey: ["custom-fields", entityType],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        data: CustomFieldDefinition[];
      }>(`/custom-fields?entityType=${entityType}`);
      return response.data;
    },
  });
};

// Create Custom Field
export const useCreateCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCustomFieldData) => {
      const response = await axios.post<{
        success: boolean;
        data: CustomFieldDefinition;
      }>("/custom-fields", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["custom-fields", variables.entityType || "project"],
      });
    },
  });
};

// Update Custom Field
export const useUpdateCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCustomFieldData) => {
      const response = await axios.put<{
        success: boolean;
        data: CustomFieldDefinition;
      }>(`/custom-fields/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
    },
  });
};

// Delete Custom Field
export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete<{ success: boolean }>(
        `/custom-fields/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
    },
  });
};
