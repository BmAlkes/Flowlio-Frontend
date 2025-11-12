import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Types
export interface GenerateOTPResponse {
  success: boolean;
  message: string;
  data: {
    expiresIn: number;
  };
}

export interface VerifyOTPRequest {
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export interface Toggle2FARequest {
  enabled: boolean;
}

export interface Toggle2FAResponse {
  success: boolean;
  message: string;
  data: {
    twoFactorEnabled: boolean;
  };
}

export interface TwoFAStatusResponse {
  success: boolean;
  message: string;
  data: {
    twoFactorEnabled: boolean;
  };
}

// Generate OTP for 2FA
export const useGenerateOTP = () => {
  return useMutation<GenerateOTPResponse, Error>({
    mutationFn: async () => {
      const response = await axios.post(
        "/api/twofa/generate-otp",
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onError: (error: any) => {
      console.error("Failed to generate OTP:", error);
      throw new Error(
        error.response?.data?.message || "Failed to generate OTP"
      );
    },
  });
};

// Verify OTP for 2FA
export const useVerifyOTP = () => {
  return useMutation<VerifyOTPResponse, Error, VerifyOTPRequest>({
    mutationFn: async (data: VerifyOTPRequest) => {
      const response = await axios.post("/api/twofa/verify-otp", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onError: (error: any) => {
      console.error("Failed to verify OTP:", error);
      throw new Error(error.response?.data?.message || "Failed to verify OTP");
    },
  });
};

// Toggle 2FA on/off
export const useToggle2FA = () => {
  const queryClient = useQueryClient();

  return useMutation<Toggle2FAResponse, Error, Toggle2FARequest>({
    mutationFn: async (data: Toggle2FARequest) => {
      const response = await axios.post("/api/twofa/toggle", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user profile query to refresh 2FA status
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      console.error("Failed to toggle 2FA:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update 2FA settings"
      );
    },
  });
};

// Get 2FA status
export const useTwoFAStatus = () => {
  return useQuery<TwoFAStatusResponse, Error>({
    queryKey: ["twoFAStatus"],
    queryFn: async () => {
      const response = await axios.get("/api/twofa/status", {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
