import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import type { ReportPeriod } from "@/hooks/useReports";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RevenueCategory = "service" | "product" | "retainer" | "consulting" | "other";
export type RevenueSource   = "manual" | "invoice" | "stripe" | "paypal" | "bank_transfer";

export interface RevenueEntry {
  id: string;
  date: string;
  amount: number;
  currency: string;
  category: RevenueCategory;
  source: RevenueSource;
  description?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueSummary {
  total: number;
  byCategory: { category: string; amount: number }[];
  bySource:   { source: string; amount: number }[];
  byMonth:    { month: string; amount: number }[];
}

export interface RevenueResponse {
  entries: RevenueEntry[];
  summary: RevenueSummary;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateRevenueData {
  date: string;
  amount: number;
  currency?: string;
  category: RevenueCategory;
  source: RevenueSource;
  description?: string;
  clientId?: string;
  projectId?: string;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function buildParams(filters: {
  period?: ReportPeriod;
  from?: string;
  to?: string;
  category?: string;
  source?: string;
  page?: number;
  limit?: number;
}): string {
  const p = new URLSearchParams();
  if (filters.period)   p.set("period", filters.period);
  if (filters.from)     p.set("from", filters.from);
  if (filters.to)       p.set("to", filters.to);
  if (filters.category) p.set("category", filters.category);
  if (filters.source)   p.set("source", filters.source);
  if (filters.page)     p.set("page", String(filters.page));
  if (filters.limit)    p.set("limit", String(filters.limit));
  return p.toString();
}

export const useRevenue = (filters: Parameters<typeof buildParams>[0] = {}) =>
  useQuery<RevenueResponse>({
    queryKey: ["revenue", filters],
    queryFn: async () => {
      const qs = buildParams(filters);
      const res = await axios.get(`/revenue${qs ? `?${qs}` : ""}`);
      return res.data?.data ?? res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

export const useCreateRevenue = () => {
  const qc = useQueryClient();
  return useMutation<RevenueEntry, Error, CreateRevenueData>({
    mutationFn: async (data) => {
      const res = await axios.post("/revenue", data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["revenue"] }),
  });
};

export const useUpdateRevenue = () => {
  const qc = useQueryClient();
  return useMutation<RevenueEntry, Error, { id: string } & Partial<CreateRevenueData>>({
    mutationFn: async ({ id, ...data }) => {
      const res = await axios.put(`/revenue/${id}`, data);
      return res.data?.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["revenue"] }),
  });
};

export const useDeleteRevenue = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await axios.delete(`/revenue/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["revenue"] }),
  });
};

// ─── Constants ───────────────────────────────────────────────────────────────

export const REVENUE_CATEGORIES: { value: RevenueCategory; label: string }[] = [
  { value: "service",     label: "Service"      },
  { value: "product",     label: "Product"      },
  { value: "retainer",    label: "Retainer"     },
  { value: "consulting",  label: "Consulting"   },
  { value: "other",       label: "Other"        },
];

export const REVENUE_SOURCES: { value: RevenueSource; label: string }[] = [
  { value: "manual",         label: "Manual entry"    },
  { value: "bank_transfer",  label: "Bank transfer"   },
  { value: "stripe",         label: "Stripe"          },
  { value: "paypal",         label: "PayPal"          },
  { value: "invoice",        label: "Invoice"         },
];

export const SOURCE_COLOR: Record<RevenueSource, string> = {
  invoice:       "bg-blue-100 text-blue-700",
  manual:        "bg-gray-100 text-gray-600",
  bank_transfer: "bg-green-100 text-green-700",
  stripe:        "bg-purple-100 text-purple-700",
  paypal:        "bg-indigo-100 text-indigo-700",
};

export const CATEGORY_COLOR: Record<RevenueCategory, string> = {
  service:    "#3b82f6",
  product:    "#10b981",
  retainer:   "#8b5cf6",
  consulting: "#f59e0b",
  other:      "#94a3b8",
};
