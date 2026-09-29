import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";
import { useDataScope } from "./useDataScope";

export type MilestoneStatus = "pending" | "in_progress" | "completed";

export interface ProjectMilestone {
  id: string;
  projectId: string;
  organizationId: string;
  title: string;
  status: MilestoneStatus;
  position: number;
  completedAt: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useFetchProjectMilestones = (projectId?: string) => {
  const scope = useDataScope();
  return useQuery<ApiResponse<ProjectMilestone[]>>({
    queryKey: ["project-milestones", projectId, scope],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<ProjectMilestone[]>>(
        `/projects/${encodeURIComponent(projectId!)}/milestones`,
      );
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      data,
    }: {
      projectId: string;
      milestoneId: string;
      data: { status?: MilestoneStatus; title?: string; dueDate?: string | null };
    }) => {
      const response = await axios.patch<ApiResponse<ProjectMilestone>>(
        `/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}`,
        data,
      );
      return response.data;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ["project-milestones", variables.projectId]}),
        ...["delivery-reviews", "client-pending", "attention", "onboarding"].map(key => queryClient.invalidateQueries({queryKey: [key]})),
      ]);
    },
  });
};
