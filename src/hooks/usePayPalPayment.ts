import { useMutation } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

interface CreatePayPalOrderRequest {
  planId: string;
  amount: number;
  currency?: string;
}

interface CreatePayPalOrderResponse {
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  plan: {
    id: string;
    name: string;
    price: string | number;
    billingCycle: string;
  };
}

interface CapturePayPalOrderRequest {
  orderId: string;
  userId?: string;
  organizationName?: string;
  organizationWebsite?: string;
  organizationIndustry?: string;
  organizationSize?: string;
  planId?: string;
}

interface CapturePayPalOrderResponse {
  orderId: string;
  status: string;
  captureId: string;
  amount?: string;
  currency?: string;
  organization?: any;
  subscription?: any;
  plan?: any;
}

export const useCreatePayPalOrder = () => {
  return useMutation<
    ApiResponse<CreatePayPalOrderResponse>,
    ErrorWithMessage,
    CreatePayPalOrderRequest
  >({
    mutationFn: async (data: CreatePayPalOrderRequest) => {
      const response = await axios.post("/payments/paypal/create-order", data);
      return response.data;
    },
  });
};

export const useCapturePayPalOrder = () => {
  return useMutation<
    ApiResponse<CapturePayPalOrderResponse>,
    ErrorWithMessage,
    CapturePayPalOrderRequest
  >({
    mutationFn: async (data: CapturePayPalOrderRequest) => {
      const response = await axios.post("/payments/paypal/capture-order", data);
      return response.data;
    },
  });
};
