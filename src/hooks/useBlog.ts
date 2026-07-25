import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export type BlogPostStatus = "draft" | "published" | "archived";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  status: BlogPostStatus;
  author?: string | { name: string; image?: string };
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  views?: number;
  readingTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaMarkup?: Record<string, any> | string;
  faq?: BlogFaqItem[];
}

export const getAuthorName = (author?: BlogPost["author"]): string =>
  typeof author === "string" ? author : author?.name || "Flowlio Team";

export const getAuthorImage = (author?: BlogPost["author"]): string | undefined =>
  typeof author === "object" ? author?.image : undefined;

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  categories?: string[];
  mostViewed?: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BlogPostResponse {
  success: boolean;
  data: BlogPost;
  relatedPosts?: BlogPost[];
}

interface UseBlogPostsParams {
  category?: string;
  page?: number;
  limit?: number;
}

export const useBlogPosts = (params: UseBlogPostsParams = {}) => {
  return useQuery<BlogListResponse>({
    queryKey: ["blog-posts", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.append("category", params.category);
      searchParams.append("page", String(params.page ?? 1));
      searchParams.append("limit", String(params.limit ?? 9));
      const response = await axios.get(`/blog/posts?${searchParams.toString()}`);
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useBlogPost = (slug: string | undefined) => {
  return useQuery<BlogPostResponse>({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const response = await axios.get(`/blog/posts/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
