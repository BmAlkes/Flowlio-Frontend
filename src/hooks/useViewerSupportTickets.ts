import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";
import { toast } from "sonner";

// Types for Viewer Support Tickets
export interface ViewerSupportTicket {
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

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
  sender?: {
    image: string | null;
  };
}

export interface CreateViewerSupportTicketRequest {
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  client?: string;
  assignedToUser?: string; // Only specific user assignment allowed for viewers
}

export interface UpdateViewerSupportTicketRequest {
  subject?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "open" | "in_progress" | "resolved" | "closed";
  category?: string;
  assignedToUser?: string;
  resolution?: string;
}

// Viewer Support Ticket Hooks
export const useViewerSupportTickets = (filters?: {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery<
    ApiResponse<{ tickets: ViewerSupportTicket[]; pagination: any }>,
    ErrorWithMessage
  >({
    queryKey: ["viewer-support-tickets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await axios.get<
        ApiResponse<{ tickets: ViewerSupportTicket[]; pagination: any }>
      >(`/viewer/support-tickets?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateViewerSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ViewerSupportTicket>,
    ErrorWithMessage,
    CreateViewerSupportTicketRequest
  >({
    mutationFn: async (data) => {
      const response = await axios.post<ApiResponse<ViewerSupportTicket>>(
        "/viewer/support-tickets",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["viewer-support-tickets"],
      });
      toast.success("Viewer support ticket created successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to create viewer support ticket"
      );
    },
  });
};

export const useUpdateViewerSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ViewerSupportTicket>,
    ErrorWithMessage,
    { id: string; data: UpdateViewerSupportTicketRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put<ApiResponse<ViewerSupportTicket>>(
        `/viewer/support-tickets/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["viewer-support-tickets"],
      });
      toast.success("Viewer support ticket updated successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update viewer support ticket"
      );
    },
  });
};

export const useDeleteViewerSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, ErrorWithMessage, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await axios.delete<ApiResponse<void>>(
        `/viewer/support-tickets/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["viewer-support-tickets"],
      });
      toast.success("Viewer support ticket deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete viewer support ticket"
      );
    },
  });
};

export const useSupportTicketMessages = (ticketId: string) => {
  return useQuery<ApiResponse<SupportTicketMessage[]>, ErrorWithMessage>({
    queryKey: ["support-ticket-messages", ticketId],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<SupportTicketMessage[]>>(
        `/viewer/support-tickets/${ticketId}/messages`
      );
      return response.data;
    },
    enabled: !!ticketId,
    refetchInterval: 3000, // Poll every 3 seconds for real-time experience
  });
};

export const useCreateSupportTicketMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<SupportTicketMessage>,
    ErrorWithMessage,
    { ticketId: string; message: string }
  >({
    mutationFn: async ({ ticketId, message }) => {
      const response = await axios.post<ApiResponse<SupportTicketMessage>>(
        `/viewer/support-tickets/${ticketId}/messages`,
        { message }
      );
      return response.data;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({
        queryKey: ["support-ticket-messages", ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: ["viewer-support-tickets"],
      });
      toast.success("Reply sent successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to send reply"
      );
    },
  });
};

// Utility functions
export const getViewerPriorityColor = (priority: string) => {
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

export const getViewerStatusColor = (status: string) => {
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

export const formatViewerTicketDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
