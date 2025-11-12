import { useQuery } from "@tanstack/react-query";
import {
  axios,
  type ApiResponse,
  type ErrorWithMessage,
} from "@/configs/axios.config";

export interface CompanyUser {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    emailVerified: boolean;
    createdAt: string;
  };
}

export interface CompanySubscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    price: number;
    description: string;
  };
}

export interface CompanyStats {
  totalEmployees: number;
  activeEmployees: number;
  totalRevenue: number;
  activeProjects: number;
}

export interface CompanyDetails {
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    logo?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  users: CompanyUser[];
  subscription: CompanySubscription | null;
  owner: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
  stats: CompanyStats;
}

export const useGetCompanyDetails = (organizationId: string) => {
  return useQuery<ApiResponse<CompanyDetails>, ErrorWithMessage>({
    queryKey: ["company-details", organizationId],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<CompanyDetails>>(
        `/superadmin/organizations/${organizationId}/details`
      );
      return response.data;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
