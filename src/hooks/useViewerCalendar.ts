import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

// ==================== VIEWER CALENDAR HOOKS ====================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startHour: number;
  endHour: number;
  calendarType: "education" | "personal" | "meeting";
  platform?: "google_meet" | "whatsapp" | "outlook" | "zoom" | "none";
  meetLink?: string;
  whatsappNumber?: string;
  outlookEvent?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  date: string;
  startHour: number;
  endHour: number;
  calendarType: "education" | "personal" | "meeting" | "work";
  platform?: "google_meet" | "whatsapp" | "outlook" | "zoom" | "none";
  meetLink?: string;
  whatsappNumber?: string;
  outlookEvent?: string;
}

interface UpdateCalendarEventRequest {
  id: string;
  data: CreateCalendarEventRequest;
}

interface FetchCalendarEventsParams {
  startDate?: string;
  endDate?: string;
}

// Fetch calendar events for viewer
export const useFetchViewerCalendarEvents = (
  params?: FetchCalendarEventsParams
) => {
  return useQuery<ApiResponse<CalendarEvent[]>>({
    queryKey: ["viewer-calendar-events", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);

      const response = await axios.get<ApiResponse<CalendarEvent[]>>(
        `/viewer/calendar-events?${queryParams.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Create calendar event for viewer
export const useCreateViewerCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CalendarEvent>,
    Error,
    CreateCalendarEventRequest
  >({
    mutationFn: async (data) => {
      const response = await axios.post<ApiResponse<CalendarEvent>>(
        "/viewer/calendar-events",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch calendar events
      queryClient.invalidateQueries({ queryKey: ["viewer-calendar-events"] });
    },
  });
};

// Update calendar event for viewer
export const useUpdateViewerCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<CalendarEvent>,
    Error,
    UpdateCalendarEventRequest
  >({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put<ApiResponse<CalendarEvent>>(
        `/viewer/calendar-events/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch calendar events
      queryClient.invalidateQueries({ queryKey: ["viewer-calendar-events"] });
    },
  });
};

// Delete calendar event for viewer
export const useDeleteViewerCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async (id) => {
      const response = await axios.delete<ApiResponse<void>>(
        `/viewer/calendar-events/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch calendar events
      queryClient.invalidateQueries({ queryKey: ["viewer-calendar-events"] });
    },
  });
};
