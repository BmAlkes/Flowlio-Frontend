import { useMutation } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";

export interface AITaskGenerationRequest {
  userInput: string;
}

export interface AITaskGenerationResponse {
  success: boolean;
  message: string;
  data: {
    title: string;
    description?: string;
    projectId?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    estimatedHours?: number;
    suggestions?: string[];
  };
}

export const useAITaskCreation = () => {
  return useMutation({
    mutationFn: async (
      data: AITaskGenerationRequest
    ): Promise<AITaskGenerationResponse> => {
      const response = await axios.post("/ai/generate-task", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("AI task generated successfully", data);
    },
    onError: (error: any) => {
      console.error("Error generating AI task:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to generate task from AI";
      toast.error(errorMessage);
    },
  });
};
