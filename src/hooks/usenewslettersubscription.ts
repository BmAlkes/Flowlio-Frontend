import { useMutation } from "@tanstack/react-query";
import { axios, type ApiResponse } from "@/configs/axios.config";
import { toast } from "sonner";

interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    subscribed: boolean;
  };
}

export const useNewsletterSubscription = () => {
  return useMutation<
    ApiResponse<NewsletterSubscriptionResponse>,
    Error,
    { email: string }
  >({
    mutationFn: async ({ email }) => {
      const response = await axios.post("/newsletter/subscribe", { email });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.success) {
        toast.success(data.message || "Successfully subscribed to newsletter!");
      } else {
        toast.error(data.message || "Failed to subscribe");
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to subscribe to newsletter";
      toast.error(errorMessage);
    },
  });
};
