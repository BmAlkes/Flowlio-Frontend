import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface ProjectStatusData {
  name: string;
  value: number;
  icon: string;
  color: string;
}

export interface ProjectStatusCounts {
  ongoing: number;
  delayed: number;
  finished: number;
  total: number;
  debug?: {
    allStatuses: string;
    statusCounts: Array<{ status: string; count: number }>;
    allProjects: Array<{ name: string; status: string }>;
  };
}

export const useFetchProjectStatusData = () => {
  return useQuery<ApiResponse<ProjectStatusCounts>>({
    queryKey: ["project-status-data"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<ProjectStatusCounts>>(
        "/projects/status-data"
      );

      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds - shorter stale time for more frequent updates
    refetchOnWindowFocus: true, // Refetch when user returns to the tab/window
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds for real-time updates
  });
};

// Transform the API data to pie chart format
export const transformToPieChartData = (
  statusCounts: ProjectStatusCounts
): ProjectStatusData[] => {
  const { ongoing, delayed, finished, total } = statusCounts;

  if (total === 0) {
    console.error("⚠️ No projects found, returning empty array");
    return [];
  }

  const pieData = [
    {
      name: "Ongoing",
      value: Number(ongoing),
      icon: "/dashboard/prostat2.svg",
      color: "#1797B9",
    },
    {
      name: "Delayed",
      value: Number(delayed),
      icon: "/dashboard/projstat3.svg",
      color: "#db8b49",
    },
    {
      name: "Finished",
      value: Number(finished),
      icon: "/dashboard/prostat1.svg",
      color: "#6eab96",
    },
  ];

  const remaining = Math.max(0, Number(total) - Number(ongoing) - Number(delayed) - Number(finished));
  return remaining ? [...pieData, { name: "Other", value: remaining, icon: "", color: "#aab9c2" }] : pieData;
};
