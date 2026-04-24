import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface FinancialOverviewData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  timeline: {
    month: string;
    revenue: number;
    expenses: number;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
  }[];
  projectPerformance: {
    id: string;
    name: string;
    budget: string | number;
    spent: number;
  }[];
}

const fetchFinancialOverview = async (): Promise<FinancialOverviewData> => {
  const response = await axios.get("/reports/financial-overview");
  return response.data.data;
};

export const useFetchFinancialOverview = () => {
  return useQuery({
    queryKey: ["financial-overview"],
    queryFn: fetchFinancialOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
