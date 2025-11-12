import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  date?: string; // ISO date string
  startHour?: number;
  endHour?: number;
  calendarType?: "work" | "education" | "personal" | "meeting";
  platform?: "google_meet" | "whatsapp" | "outlook" | "zoom" | "none";
  meetLink?: string;
  whatsappNumber?: string;
  outlookEvent?: string;
}

export interface UpdateCalendarEventResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description?: string;
    date: string;
    startHour: number;
    endHour: number;
    calendarType: "education" | "personal" | "meeting";
    platform: "google_meet" | "whatsapp" | "outlook" | "zoom" | "none";
    meetLink?: string;
    whatsappNumber?: string;
    outlookEvent?: string;
    organizationId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCalendarEventRequest;
    }): Promise<UpdateCalendarEventResponse> => {
      try {
        const response = await axios.put(`/calendar-events/${id}`, data);

        return response.data;
      } catch (error) {
        console.error("❌ PUT request failed:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          status: (error as any)?.response?.status,
          statusText: (error as any)?.response?.statusText,
          data: (error as any)?.response?.data,
          url: (error as any)?.config?.url,
          method: (error as any)?.config?.method,
        });
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch calendar events
      queryClient.invalidateQueries({ queryKey: ["calendar  -events"] });
      // Invalidate activities so the updated calendar event shows up
      queryClient.invalidateQueries({ queryKey: ["organization-activities"] });

      toast.success("Calendar event updated successfully!");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update calendar event";
      toast.error(errorMessage);
    },
  });
};
