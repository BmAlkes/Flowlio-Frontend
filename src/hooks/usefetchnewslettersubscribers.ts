import { useQuery } from "@tanstack/react-query";
import { axios, type ApiResponse } from "@/configs/axios.config";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscribersResponse {
  subscribers: NewsletterSubscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NewsletterStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
  monthlyStats: {
    month: string;
    count: number;
  }[];
}

export const useFetchNewsletterSubscribers = (
  page: number = 1,
  limit: number = 50,
  search?: string,
  subscribed?: string
) => {
  return useQuery<ApiResponse<NewsletterSubscribersResponse>>({
    queryKey: ["newsletter-subscribers", page, limit, search, subscribed],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (subscribed !== undefined) params.append("subscribed", subscribed);

      const response = await axios.get(
        `/superadmin/newsletter/subscribers?${params.toString()}`
      );
      return response.data;
    },
  });
};

export const useFetchNewsletterStats = () => {
  return useQuery<ApiResponse<NewsletterStats>>({
    queryKey: ["newsletter-stats"],
    queryFn: async () => {
      const response = await axios.get(`/superadmin/newsletter/stats`);
      return response.data;
    },
  });
};

