import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  startHour: number;
  endHour: number;
  calendarType: "work" | "education" | "personal";
  platform: "google_meet" | "whatsapp" | "outlook" | "none";
  meetLink?: string;
  whatsappNumber?: string;
  outlookEvent?: string;
  organizationId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetCalendarEventsResponse {
  success: boolean;
  message: string;
  data: CalendarEvent[];
}

interface FetchCalendarEventsParams {
  startDate?: string;
  endDate?: string;
  calendarType?: string;
}

const fetchCalendarEvents = async ({
  startDate,
  endDate,
  calendarType,
}: FetchCalendarEventsParams): Promise<GetCalendarEventsResponse> => {
  const params = new URLSearchParams();

  if (startDate) {
    params.append("startDate", startDate);
  }

  if (endDate) {
    params.append("endDate", endDate);
  }

  if (calendarType) {
    params.append("calendarType", calendarType);
  }

  const response = await axios.get<GetCalendarEventsResponse>(
    `/calendar-events${params.toString() ? `?${params.toString()}` : ""}`
  );
  return response.data;
};

export const useFetchCalendarEvents = (
  params: FetchCalendarEventsParams = {}
) => {
  return useQuery({
    queryKey: ["calendar-events", params],
    queryFn: () => fetchCalendarEvents(params),
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // No garbage collection delay
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Hook for fetching a single calendar event by ID
export const useFetchCalendarEventById = (eventId: string) => {
  return useQuery({
    queryKey: ["calendar-event", eventId],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        message: string;
        data: CalendarEvent;
      }>(`/calendar-events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 2, // Retry failed requests 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
};
