import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";

/** The first five types work on projects, clients and tasks; the rest are task-only. */
export const BASIC_FIELD_TYPES = ["text", "number", "date", "select", "boolean"] as const;
export const TASK_FIELD_TYPES = [...BASIC_FIELD_TYPES, "currency", "rating", "progress", "person", "url", "email", "phone"] as const;
export type CustomFieldType = (typeof TASK_FIELD_TYPES)[number];
export type CustomFieldEntity = "project" | "client" | "task";

export interface OptionWithColor {
  label: string;
  color: string;
}


export interface CustomFieldDefinition {
  id: string;
  organizationId: string;
  entityType: string;
  name: string;
  type: CustomFieldType;
  options?: OptionWithColor[];
  /** Task fields only: the project the field belongs to, or null for every project. */
  projectId?: string | null;
  position?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomFieldData {
  name: string;
  type: CustomFieldType;
  options?: OptionWithColor[];
  entityType?: string;
  projectId?: string | null;
}

export interface UpdateCustomFieldData {
  id: string;
  name?: string;
  options?: OptionWithColor[];
  position?: number;
}

// Fetch Custom Fields
export const useFetchCustomFields = (entityType: string = "project", options?: { enabled?: boolean }) => {
  const scope = useDataScope();
  return useQuery({
    queryKey: ["custom-fields", entityType, scope],
    enabled: options?.enabled ?? true,
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

/** Sets (or clears, with null) custom field values on one task. */
export const useSetTaskFieldValues = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, values }: { taskId: string; values: Record<string, unknown> }) => {
      const response = await axios.patch<{ success: boolean; data: { id: string; customFields: Record<string, unknown> } }>(
        `/tasks/${encodeURIComponent(taskId)}/custom-fields`, { values });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
