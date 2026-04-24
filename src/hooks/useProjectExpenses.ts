import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface ProjectExpense {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExpensesResponse {
  success: boolean;
  message: string;
  data: ProjectExpense[];
}

export interface CreateExpenseRequest {
  projectId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface ExpenseSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  expenseCount: number;
}

// Fetch all expenses for a project
export const useFetchProjectExpenses = (projectId: string) => {
  return useQuery({
    queryKey: ["project-expenses", projectId],
    queryFn: async (): Promise<ProjectExpensesResponse> => {
      const response = await axios.get(`/projects/${projectId}/expenses`);
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
  });
};

// Create a new expense
export const useCreateProjectExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseRequest) => {
      const response = await axios.post(
        `/projects/${data.projectId}/expenses`,
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-expenses", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      toast.success("Expense added successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to add expense";
      toast.error(errorMessage);
    },
  });
};

// Delete an expense
export const useDeleteProjectExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      expenseId,
    }: {
      projectId: string;
      expenseId: string;
    }) => {
      const response = await axios.delete(
        `/projects/${projectId}/expenses/${expenseId}`
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-expenses", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      toast.success("Expense deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete expense";
      toast.error(errorMessage);
    },
  });
};
