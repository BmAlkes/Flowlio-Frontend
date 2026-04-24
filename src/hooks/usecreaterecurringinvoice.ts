import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

export interface CreateRecurringInvoiceData {
  templateName: string;
  clientId: string;
  amount: number;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
}

interface CreateRecurringInvoiceResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    templateName: string;
    clientname: string;
    amount: string;
    frequency: string;
    nextRunDate: string;
    status: string;
  };
}

const createRecurringInvoice = async (
  data: CreateRecurringInvoiceData
): Promise<CreateRecurringInvoiceResponse> => {
  try {
    const response = await axios.post("/invoices/recurring", data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating recurring invoice template:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create recurring invoice template"
    );
  }
};

export const useCreateRecurringInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecurringInvoice,
    onSuccess: () => {
      toast.success("Recurring invoice template created successfully!");
      queryClient.invalidateQueries({ queryKey: ["recurring-invoices"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create recurring template");
    },
  });
};

const updateRecurringTemplate = async ({ id, ...data }: { id: string; [key: string]: any }): Promise<any> => {
  const response = await axios.put(`/invoices/recurring/${id}`, data);
  return response.data;
};

export const useUpdateRecurringTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecurringTemplate,
    onSuccess: () => {
      toast.success("Recurring template updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["recurring-invoices"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update template");
    },
  });
};

const deleteRecurringTemplate = async (id: string): Promise<any> => {
  const response = await axios.delete(`/invoices/recurring/${id}`);
  return response.data;
};

export const useDeleteRecurringTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecurringTemplate,
    onSuccess: () => {
      toast.success("Recurring template deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["recurring-invoices"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete template");
    },
  });
};
