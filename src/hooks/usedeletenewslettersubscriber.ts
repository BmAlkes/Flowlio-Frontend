import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export const useDeleteNewsletterSubscriber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(
        `/superadmin/newsletter/subscribers/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Subscriber deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter-stats"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete subscriber";
      toast.error(errorMessage);
    },
  });
};

