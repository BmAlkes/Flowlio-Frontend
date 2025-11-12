import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ProjectScheduleData {
  project: string;
  Completed: number;
  "In-Progress": number;
  Delayed: number;
}

export interface ProjectWithTaskCounts {
  id: string;
  name: string;
  projectNumber: string;
  status: "pending" | "ongoing" | "completed";
  createdAt: string; // Added for frontend filtering
  completedTasks: number;
  inProgressTasks: number;
  delayedTasks: number;
  totalTasks: number;
}

export const useFetchProjectScheduleData = () => {
  return useQuery<ApiResponse<ProjectWithTaskCounts[]>>({
    queryKey: ["project-schedule-data"],
    queryFn: async () => {
      const url = "/projects/schedule-data";

      const response = await axios.get<ApiResponse<ProjectWithTaskCounts[]>>(
        url
      );

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Transform the API data to chart format with optional date filtering
export const transformToChartData = (
  projects: ProjectWithTaskCounts[],
  dateRange?: { from: Date; to: Date }
): ProjectScheduleData[] => {
  let filteredProjects = projects;

  // Apply frontend date filtering if date range is provided
  if (dateRange) {
    const fromDate = dateRange.from;
    const toDate = dateRange.to;

    filteredProjects = projects.filter((project) => {
      const projectDate = new Date(project.createdAt);
      return projectDate >= fromDate && projectDate <= toDate;
    });

    console.log(
      `📅 Filtered ${filteredProjects.length} projects from ${projects.length} total projects`
    );
    console.log(
      `📅 Date range: ${fromDate.toISOString()} to ${toDate.toISOString()}`
    );
  }

  return filteredProjects.map((project) => ({
    project:
      project.name.length > 12
        ? `${project.name.substring(0, 12)}...`
        : project.name,
    Completed: project.completedTasks,
    "In-Progress": project.inProgressTasks,
    Delayed: project.delayedTasks,
  }));
};
