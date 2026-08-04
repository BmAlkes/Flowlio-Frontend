import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

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
  return useQuery<ApiResponse<ProjectMilestone[]>>({
    queryKey: ["project-milestones", projectId],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<ProjectMilestone[]>>(
        `/projects/${projectId}/milestones`,
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
      data: { status?: MilestoneStatus; title?: string; dueDate?: string };
    }) => {
      const response = await axios.patch<ApiResponse<ProjectMilestone>>(
        `/projects/${projectId}/milestones/${milestoneId}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-milestones", variables.projectId],
      });
    },
  });
};
