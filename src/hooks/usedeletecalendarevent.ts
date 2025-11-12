import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface DeleteCalendarEventResponse {
  success: boolean;
  message: string;
}

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<DeleteCalendarEventResponse> => {
      const response = await axios.delete(`/calendar-events/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Invalidate and refetch calendar events!", data);
      // Invalidate and refetch calendar events
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      // Invalidate activities so the deleted calendar event is removed
      queryClient.invalidateQueries({ queryKey: ["organization-activities"] });

      toast.success("Calendar event deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting calendar event:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete calendar event";
      toast.error(errorMessage);
    },
  });
};
