import { useMutation } from "@tanstack/react-query";
import { axios, type ApiResponse } from "@/configs/axios.config";

export interface UnsubscribeNewsletterRequest {
  email: string;
}

export const useUnsubscribeNewsletter = () => {
  return useMutation<ApiResponse<void>, Error, UnsubscribeNewsletterRequest>({
    mutationFn: async (data) => {
      const response = await axios.post("/newsletter/unsubscribe", data);
      return response.data;
    },
  });
};
