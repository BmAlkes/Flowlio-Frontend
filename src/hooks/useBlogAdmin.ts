import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";
import { BlogFaqItem, BlogPost, BlogPostStatus } from "./useBlog";

export interface BlogAdminStats {
  totalPosts?: number;
  totalViews?: number;
  byStatus?: Partial<Record<BlogPostStatus, number>>;
  topPosts?: Array<{
    id: string;
    title: string;
    slug: string;
    views?: number;
    publishedAt?: string;
  }>;
}

export const useBlogAdminStats = () => {
  return useQuery<{ success: boolean; data: BlogAdminStats }>({
    queryKey: ["blog-admin-stats"],
    queryFn: async () => {
      const response = await axios.get("/blog/admin/stats");
      return response.data;
    },
  });
};

interface UseBlogAdminPostsParams {
  status?: BlogPostStatus | "all";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogAdminPostsResponse {
  success: boolean;
  data: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

export const useBlogAdminPosts = (params: UseBlogAdminPostsParams = {}) => {
  return useQuery<BlogAdminPostsResponse>({
    queryKey: ["blog-admin-posts", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status && params.status !== "all") searchParams.append("status", params.status);
      if (params.category) searchParams.append("category", params.category);
      if (params.search) searchParams.append("search", params.search);
      searchParams.append("page", String(params.page ?? 1));
      searchParams.append("limit", String(params.limit ?? 20));
      const response = await axios.get(`/blog/admin/posts?${searchParams.toString()}`);
      return response.data;
    },
  });
};

export const useBlogAdminPost = (id: string | undefined) => {
  return useQuery<{ success: boolean; data: BlogPost }>({
    queryKey: ["blog-admin-post", id],
    queryFn: async () => {
      const response = await axios.get(`/blog/admin/posts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export interface BlogPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  status: BlogPostStatus;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaMarkup?: string;
  faq?: BlogFaqItem[];
}

const invalidateBlogLists = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["blog-admin-posts"] });
  queryClient.invalidateQueries({ queryKey: ["blog-admin-stats"] });
  queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BlogPostPayload) => {
      const response = await axios.post("/blog/admin/posts", payload);
      return response.data;
    },
    onSuccess: () => {
      invalidateBlogLists(queryClient);
      toast.success("Post saved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save post");
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: BlogPostPayload }) => {
      const response = await axios.put(`/blog/admin/posts/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      invalidateBlogLists(queryClient);
      queryClient.invalidateQueries({ queryKey: ["blog-admin-post", variables.id] });
      toast.success("Post updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/blog/admin/posts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidateBlogLists(queryClient);
      toast.success("Post deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });
};

export interface BlogPostAnalytics {
  totalViews?: number;
  viewsByDay?: Array<{ date: string; views: number }>;
  topReferrers?: Array<{ referrer: string; count?: number }>;
}

export const useBlogPostAnalytics = (id: string | undefined, days: number) => {
  return useQuery<{ success: boolean; data: BlogPostAnalytics }>({
    queryKey: ["blog-post-analytics", id, days],
    queryFn: async () => {
      const response = await axios.get(`/blog/admin/posts/${id}/analytics?days=${days}`);
      return response.data;
    },
    enabled: !!id,
  });
};
