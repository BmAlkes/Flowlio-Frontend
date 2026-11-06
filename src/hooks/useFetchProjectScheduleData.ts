import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ProjectScheduleData {
  project: string;
  fullName: string;
  Completed: number;
  "In-Progress": number;
  Delayed: number;
  totalTasks: number;
}

export interface ProjectWithTaskCounts {
  id: string;
  name: string;
  projectNumber: string;
  status: "pending" | "ongoing" | "completed";
  createdAt: string;
  // Postgres counts can arrive as strings
  completedTasks: number | string;
  inProgressTasks: number | string;
  delayedTasks: number | string;
  totalTasks: number | string;
}

export type ScheduleRange = { from: Date; to: Date } | null;

// With a range the server keeps only projects with tasks in it, and counts only those tasks:
// open at some point in the period, or completed during it.
export const useFetchProjectScheduleData = (range: ScheduleRange = null) => {
  const params = range ? { from: range.from.toISOString(), to: range.to.toISOString() } : undefined;
  return useQuery<ApiResponse<ProjectWithTaskCounts[]>>({
    queryKey: ["project-schedule-data", params ?? "all"],
    queryFn: async ({ signal }) => (await axios.get<ApiResponse<ProjectWithTaskCounts[]>>("/projects/schedule-data", { params, signal })).data,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    placeholderData: previous => previous,
  });
};

export const transformToChartData = (projects: ProjectWithTaskCounts[]): ProjectScheduleData[] =>
  projects
    .map(project => ({
      project: project.name.length > 14 ? `${project.name.slice(0, 14)}…` : project.name,
      fullName: project.name,
      Completed: Number(project.completedTasks) || 0,
      "In-Progress": Number(project.inProgressTasks) || 0,
      Delayed: Number(project.delayedTasks) || 0,
      totalTasks: Number(project.totalTasks) || 0,
    }))
    .filter(row => row.totalTasks > 0);
