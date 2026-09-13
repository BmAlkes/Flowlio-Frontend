import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";
import { canViewInternalProjectFinancials } from "@/utils/projectFinancialAccess";

export interface ProjectRiskAlert {
  id: string;
  projectId: string;
  projectName: string;
  projectNumber: string;
  riskScore: number;
  delayRisk: number;
  budgetRisk: number;
  reasons: string[];
  overdueTaskTitles: string[] | null;
  createdAt: string;
}

interface RiskAlertsResponse {
  success: boolean;
  message: string;
  data: ProjectRiskAlert[];
}

export const useProjectRiskAlerts = (projectId?: string) => {
  const { data } = useUser();
  return useQuery({
    queryKey: ["project-risk-alerts", data?.user.id, data?.user.organizationId, projectId],
    enabled: canViewInternalProjectFinancials(data?.user),
    queryFn: async (): Promise<RiskAlertsResponse> => {
      const response = await axios.get("/projects/risk-alerts", {
        params: projectId ? { projectId } : undefined,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDismissRiskAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/projects/risk-alerts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-risk-alerts"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to dismiss alert";
      toast.error(errorMessage);
    },
  });
};
