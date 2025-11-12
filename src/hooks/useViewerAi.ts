import { useQuery, useMutation } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { ApiResponse } from "@/configs/axios.config";

// ==================== AI ASSISTANT HOOKS ====================

interface AiSuggestionRequest {
  prompt: string;
  context?: string;
}

interface AiSuggestionResponse {
  suggestions: string[];
}

interface AiInsightResponse {
  insights: string[];
  summary: string;
}

interface AiConversationRequest {
  message: string;
  files?: File[];
}

interface AiConversationResponse {
  response: string;
  suggestions?: string[];
}

interface AiImageRequest {
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024";
}

interface AiImageResponse {
  imageUrl: string;
  revisedPrompt?: string;
}

// Generate AI-powered event suggestions
export const useGenerateEventSuggestions = () => {
  return useMutation<
    ApiResponse<AiSuggestionResponse>,
    Error,
    AiSuggestionRequest
  >({
    mutationFn: async (data) => {
      const response = await axios.post<ApiResponse<AiSuggestionResponse>>(
        "/viewer/ai/suggestions",
        data
      );
      return response.data;
    },
  });
};

// Generate event categories
export const useGenerateEventCategories = () => {
  return useMutation<
    ApiResponse<AiSuggestionResponse>,
    Error,
    AiSuggestionRequest
  >({
    mutationFn: async (data) => {
      const response = await axios.post<ApiResponse<AiSuggestionResponse>>(
        "/viewer/ai/categories",
        data
      );
      return response.data;
    },
  });
};

// Enhance event description
export const useEnhanceEventDescription = () => {
  return useMutation<
    ApiResponse<{ enhancedDescription: string }>,
    Error,
    AiSuggestionRequest
  >({
    mutationFn: async (data) => {
      const response = await axios.post<
        ApiResponse<{ enhancedDescription: string }>
      >("/viewer/ai/enhance-description", data);
      return response.data;
    },
  });
};

// Get AI-powered calendar insights
export const useGetCalendarInsights = () => {
  return useQuery<ApiResponse<AiInsightResponse>>({
    queryKey: ["viewer-calendar-insights"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<AiInsightResponse>>(
        "/viewer/ai/insights"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Advanced AI conversation
export const useAiConversation = () => {
  return useMutation<
    ApiResponse<AiConversationResponse>,
    Error,
    AiConversationRequest
  >({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("message", data.message);

      if (data.files) {
        data.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await axios.post<ApiResponse<AiConversationResponse>>(
        "/viewer/ai/conversation",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
  });
};

// Generate images using DALL-E
export const useGenerateImage = () => {
  return useMutation<ApiResponse<AiImageResponse>, Error, AiImageRequest>({
    mutationFn: async (data) => {
      const response = await axios.post<ApiResponse<AiImageResponse>>(
        "/viewer/ai/generate-image",
        data
      );
      return response.data;
    },
  });
};

// Test OpenAI service connection
export const useTestOpenAI = () => {
  return useQuery<ApiResponse<{ status: string; message: string }>>({
    queryKey: ["viewer-openai-test"],
    queryFn: async () => {
      const response = await axios.get<
        ApiResponse<{ status: string; message: string }>
      >("/viewer/ai/test");
      return response.data;
    },
    enabled: false, // Only run when explicitly called
  });
};
