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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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
      value: Number(((ongoing / total) * 100).toFixed(2)),
      icon: "/dashboard/prostat2.svg",
      color: "#FFE000",
    },
    {
      name: "Delayed",
      value: Number(((delayed / total) * 100).toFixed(2)),
      icon: "/dashboard/projstat3.svg",
      color: "#F50057",
    },
    {
      name: "Finished",
      value: Number(((finished / total) * 100).toFixed(2)),
      icon: "/dashboard/prostat1.svg",
      color: "#3f53b5",
    },
  ];

  return pieData;
};
