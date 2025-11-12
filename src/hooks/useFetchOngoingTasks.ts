import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

export interface OngoingTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Project information
  projectId: string;
  projectName: string;
  projectNumber: string;
  projectProgress: number | null;
  // Client information
  clientId: string;
  clientName: string;
  clientImage: string | null;
  // Creator information
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorImage: string | null;
  // Assigned user information
  assignedToId: string | null;
  assignedToName: string | null;
  assignedToEmail: string | null;
  assignedToImage: string | null;
}

// Fetch ongoing tasks - includes tasks with status: todo, in_progress, delay, changes, updated
export const useFetchOngoingTasks = () => {
  return useQuery<ApiResponse<OngoingTask[]>>({
    queryKey: ["ongoing-tasks"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<OngoingTask[]>>(
        "/tasks/ongoing"
      );

      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Transform ongoing task data for the OngoingTaskCard component
export const transformOngoingTaskData = (task: OngoingTask) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Get assignees (assigned user + creator if different)
  const assignees = [];

  // Add assigned user if exists
  if (task.assignedToId && task.assignedToName) {
    assignees.push({
      src: task.assignedToImage || "",
      userName: task.assignedToName,
    });
  }

  // Add creator if different from assigned user
  if (task.creatorId !== task.assignedToId) {
    assignees.push({
      src: task.creatorImage || "",
      userName: task.creatorName,
    });
  }

  return {
    taskName: task.title,
    createdAt: formatDate(task.createdAt),
    createdBy: task.creatorName,
    assignees: assignees.slice(0, 3), // Limit to 3 assignees
    progress: task.projectProgress || 0,
    projectName: task.projectName,
    clientName: task.clientName,
  };
};
