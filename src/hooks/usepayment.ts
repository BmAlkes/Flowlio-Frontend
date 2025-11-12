import { useMutation } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

interface PaymentRequest {
  planId: string;
  amount: number;
  currency: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  billingDetails: {
    name: string;
    email: string;
    organizationName: string;
  };
}

interface PaymentResponse {
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
}

export const usePayment = () => {
  return useMutation<
    ApiResponse<PaymentResponse>,
    ErrorWithMessage,
    PaymentRequest
  >({
    mutationFn: async (data: PaymentRequest) => {
      const response = await axios.post("/payments/process", data);
      return response.data;
    },
  });
};

// Hook for creating payment intent (for Stripe)
export const useCreatePaymentIntent = () => {
  return useMutation<
    ApiResponse<{ clientSecret: string; paymentIntentId: string }>,
    ErrorWithMessage,
    { planId: string; amount: number; currency: string }
  >({
    mutationFn: async (data) => {
      const response = await axios.post("/payments/create-intent", data);
      return response.data;
    },
  });
};
