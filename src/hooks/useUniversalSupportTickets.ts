import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { toast } from "sonner";

// Types
export interface UniversalSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  category?: string;
  submittedby: string;
  submittedbyName?: string;
  submittedbyRole?: string;
  client: string;
  assignedto: string;
  createdon: string;
  updatedAt: string;
  assignedToOrganization?: string;
  assignedToUser?: string;
  organizationId: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  submittedBy?: {
    id: string;
    name: string;
    email: string;
  };
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  assignedOrganization?: {
    id: string;
    name: string;
  };
  clientOrganization?: {
    id: string;
    name: string;
  };
}

export interface CreateUniversalSupportTicketRequest {
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  client?: string;
  assignedTo?: string;
  assignedToOrganization?: string; // Organization ID
  assignedToUser?: string; // Specific user ID within organization
}

export interface UpdateUniversalSupportTicketRequest {
  subject?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "open" | "in_progress" | "resolved" | "closed";
  category?: string;
  assignedToOrganization?: string;
  assignedToUser?: string;
  resolution?: string;
}

export interface AssignmentOptions {
  organizations: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    organization?: {
      id: string;
      name: string;
    };
  }>;
}

// Universal Support Ticket Hooks
export const useUniversalSupportTickets = (filters?: {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<
    ApiResponse<{ tickets: UniversalSupportTicket[]; pagination: any }>,
    ErrorWithMessage
  >({
    queryKey: ["universal-support-tickets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await axios.get<
        ApiResponse<{ tickets: UniversalSupportTicket[]; pagination: any }>
      >(`/support-tickets?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateUniversalSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UniversalSupportTicket>,
    ErrorWithMessage,
    CreateUniversalSupportTicketRequest
  >({
    mutationFn: async (data) => {
      const response = await axios.post<ApiResponse<UniversalSupportTicket>>(
        "/support-tickets",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["universal-support-tickets"],
      });
      toast.success("Support ticket created successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create support ticket"
      );
    },
  });
};

export const useUpdateUniversalSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UniversalSupportTicket>,
    ErrorWithMessage,
    { id: string; data: UpdateUniversalSupportTicketRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put<ApiResponse<UniversalSupportTicket>>(
        `/support-tickets/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["universal-support-tickets"],
      });
      toast.success("Support ticket updated successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update support ticket"
      );
    },
  });
};

export const useDeleteUniversalSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, ErrorWithMessage, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await axios.delete<ApiResponse<void>>(
        `/support-tickets/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["universal-support-tickets"],
      });
      toast.success("Support ticket deleted successfully universel");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete support ticket"
      );
    },
  });
};

export const useAssignmentOptions = () => {
  return useQuery<ApiResponse<AssignmentOptions>, ErrorWithMessage>({
    queryKey: ["assignment-options"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<AssignmentOptions>>(
        "/support-tickets/assignment-options"
      );
      console.log("Assignment options response:", response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Utility functions
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "text-red-600 bg-red-100";
    case "high":
      return "text-red-600 bg-red-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "text-blue-600 bg-blue-100";
    case "in_progress":
      return "text-yellow-600 bg-yellow-100";
    case "resolved":
      return "text-green-600 bg-green-100";
    case "closed":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const formatTicketDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
