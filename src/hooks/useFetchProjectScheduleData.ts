import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ProjectScheduleData {
  project: string;
  Completed: number;
  "In-Progress": number;
  Delayed: number;
  totalTasks: number; // Add totalTasks to track empty projects
  hasNoTasks?: boolean; // Flag to indicate if project has no tasks
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
    staleTime: 30 * 1000, // 30 seconds - shorter stale time for more frequent updates
    refetchOnWindowFocus: true, // Refetch when user returns to the tab/window
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds for real-time updates
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

  return filteredProjects.map((project) => {
    const hasNoTasks =
      project.totalTasks === 0 ||
      (project.completedTasks === 0 &&
        project.inProgressTasks === 0 &&
        project.delayedTasks === 0);

    return {
      project:
        project.name.length > 12
          ? `${project.name.substring(0, 12)}...`
          : project.name,
      // If no tasks, set all to 0 and show "No Tasks" bar
      Completed: hasNoTasks ? 0 : project.completedTasks,
      "In-Progress": hasNoTasks ? 0 : project.inProgressTasks,
      Delayed: hasNoTasks ? 0 : project.delayedTasks,
      totalTasks: project.totalTasks,
      hasNoTasks: hasNoTasks,
      // For projects with no tasks, show a gray bar with value 0.8 for better visibility
      // This ensures the bar is clearly visible and noticeable in the chart
      "No Tasks": hasNoTasks ? 10 : 0,
    };
  });
};
