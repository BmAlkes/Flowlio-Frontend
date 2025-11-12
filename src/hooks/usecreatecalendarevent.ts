import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  date: string; // ISO date string
  startHour: number;
  endHour: number;
  calendarType: "work" | "education" | "personal" | "meeting";
  platform?: "google_meet" | "whatsapp" | "outlook" | "zoom" | "none";
  meetLink?: string;
  whatsappNumber?: string;
  outlookEvent?: string;
}

export interface CreateCalendarEventResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    description?: string;
    date: string;
    startHour: number;
    endHour: number;
    calendarType: "work" | "education" | "personal" | "meeting";
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

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateCalendarEventRequest
    ): Promise<CreateCalendarEventResponse> => {
      const response = await axios.post("/calendar-events", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Invalidate and refetch calendar events!", data);
      // Invalidate and refetch calendar events
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      // Invalidate activities so the new calendar event shows up
      queryClient.invalidateQueries({ queryKey: ["organization-activities"] });

      toast.success("Calendar event created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating calendar event:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create calendar event";
      toast.error(errorMessage);
    },
  });
};
