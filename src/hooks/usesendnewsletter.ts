import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios, type ApiResponse } from "@/configs/axios.config";

export interface SendNewsletterRequest {
  subject: string;
  content: string;
}

export interface SendNewsletterResponse {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    email: string;
    success: boolean;
    error?: string;
  }>;
}

export const useSendNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<SendNewsletterResponse>,
    Error,
    SendNewsletterRequest
  >({
    mutationFn: async (data) => {
      console.log("[Newsletter] Attempting to send newsletter:", {
        subject: data.subject,
        contentLength: data.content.length,
        timestamp: new Date().toISOString(),
      });

      try {
        const response = await axios.post("/superadmin/newsletter/send", data);
        console.log(
          "[Newsletter] Newsletter sent successfully:",
          response.data
        );
        return response.data;
      } catch (error: any) {
        console.error("[Newsletter] Error sending newsletter:", {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          config: {
            url: error?.config?.url,
            method: error?.config?.method,
            data: error?.config?.data,
          },
          fullError: error,
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("[Newsletter] Success callback:", data);
      // Optionally invalidate queries if needed
      queryClient.invalidateQueries({ queryKey: ["newsletter-stats"] });
    },
    onError: (error: any) => {
      console.error("[Newsletter] Mutation error:", {
        error,
        message: error?.message,
        response: error?.response?.data,
      });
    },
  });
};
