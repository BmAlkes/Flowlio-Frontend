import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";

export interface ProjectRiskAlert {
  id: string;
  projectId: string;
  projectName: string;
  projectNumber: string;
  riskScore: number;
  delayRisk: number;
  budgetRisk: number;
  reasons: string[];
  createdAt: string;
}

interface RiskAlertsResponse {
  success: boolean;
  message: string;
  data: ProjectRiskAlert[];
}

export const useProjectRiskAlerts = (projectId?: string) => {
  return useQuery({
    queryKey: ["project-risk-alerts", projectId],
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
