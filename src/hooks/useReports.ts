import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

// ─── Shared types ────────────────────────────────────────────────────────────

export type ReportPeriod = "7d" | "30d" | "90d" | "ytd" | "all";

export interface PeriodRange {
  from: string;
  to: string;
}

export interface ReportComparison {
  previousRevenue: number;
  previousExpenses: number;
  previousProfit: number;
  revenueChange: number | null;
  expensesChange: number | null;
  profitChange: number | null;
}

function buildParams(period?: ReportPeriod, from?: string, to?: string): string {
  const p = new URLSearchParams();
  if (period) p.set("period", period);
  if (from) p.set("from", from);
  if (to) p.set("to", to);
  return p.toString();
}

// ─── Financial Overview (enhanced) ───────────────────────────────────────────

export interface FinancialOverviewData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  granularity?: "daily" | "weekly" | "monthly";
  timeline: { month?: string; date?: string; revenue: number; expenses: number }[];
  categoryBreakdown: { category: string; amount: number }[];
  projectPerformance: { id: string; name: string; budget: string | number; spent: number }[];
  period?: PeriodRange;
  comparison?: ReportComparison;
  totals?: { avgMargin: number | null };
  updatedAt?: string;
}

export const useFetchFinancialOverview = (period?: ReportPeriod, from?: string, to?: string) =>
  useQuery<FinancialOverviewData>({
    queryKey: ["financial-overview", period, from, to],
    queryFn: async () => {
      const qs = buildParams(period, from, to);
      const res = await axios.get(`/reports/financial-overview${qs ? `?${qs}` : ""}`);
      return res.data?.data ?? res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

// ─── Team Productivity (enhanced) ────────────────────────────────────────────

export interface TeamProductivityItem {
  userId: string;
  userName: string;
  userImage: string | null;
  totalMinutes: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  previousCompletedTasks?: number;
  completionChange?: number | null;
  workload?: {
    minutesLogged: number;
    capacityMinutes: number;
    utilizationPct: number;
  };
}

export interface TeamProductivityResponse {
  data: TeamProductivityItem[];
  period?: PeriodRange;
  totals?: {
    totalMembers: number;
    totalTasks: number;
    totalCompletedTasks: number;
    totalMinutes: number;
    avgCompletionRate: number;
  };
  updatedAt?: string;
}

export const useFetchTeamProductivity = (period?: ReportPeriod, from?: string, to?: string) =>
  useQuery<TeamProductivityResponse>({
    queryKey: ["team-productivity", period, from, to],
    queryFn: async () => {
      const qs = buildParams(period, from, to);
      const res = await axios.get(`/organizations/stats/team-productivity${qs ? `?${qs}` : ""}`);
      const d = res.data?.data ?? res.data;
      if (Array.isArray(d)) return { data: d };
      return d;
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

// ─── Client Activity (enhanced) ──────────────────────────────────────────────

export interface ClientActivityItem {
  client: { id: string; name: string; email: string; status: string; industry: string | null; image: string | null };
  projects: { active: number; completed: number; delayed: number; pending: number; total: number };
  tasks: { total: number; completed: number };
  timeTracked?: { totalMinutes: number; hours: number; minutes: number };
  hoursTracked: number;
  activityScore: number;
  previousActiveProjects?: number;
  activityChange?: number | null;
}

export interface ClientActivityReport {
  clientStats: ClientActivityItem[];
  statusDistribution: { status: string; count: number }[];
  projectStatusSummary: { status: string; count: number }[];
  period?: PeriodRange;
  comparison?: {
    newClientsThisPeriod: number;
    newClientsPreviousPeriod: number;
    clientChange: number | null;
  };
  totals?: {
    totalClients: number;
    totalProjects: number;
    totalHoursTracked: number;
    avgActivityScore: number;
  };
  updatedAt?: string;
}

export const useFetchClientActivity = (period?: ReportPeriod, from?: string, to?: string) =>
  useQuery<ClientActivityReport>({
    queryKey: ["client-activity-report", period, from, to],
    queryFn: async () => {
      const qs = buildParams(period, from, to);
      const res = await axios.get(`/reports/client-activity${qs ? `?${qs}` : ""}`);
      return res.data?.data ?? res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

// ─── Drill-down endpoints ────────────────────────────────────────────────────

export interface MemberTasksDrilldown {
  member: { id: string; name: string; email: string; image?: string };
  tasks: { id: string; title: string; status: string; projectName: string; estimatedHours?: number; actualHours?: number; createdAt: string; completedAt?: string }[];
  summary: { totalTasks: number; completed: number; inProgress: number; overdue: number; totalHoursLogged: number; avgCompletionTime?: number };
}

export const useMemberTasks = (userId: string, period?: ReportPeriod) =>
  useQuery<MemberTasksDrilldown>({
    queryKey: ["report-member-tasks", userId, period],
    queryFn: async () => {
      const qs = buildParams(period);
      const res = await axios.get(`/reports/member/${userId}/tasks${qs ? `?${qs}` : ""}`);
      return res.data?.data ?? res.data;
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });

export interface ClientProjectsDrilldown {
  client: { id: string; name: string; email: string; status: string };
  projects: { id: string; name: string; status: string; budget?: number; spent?: number; tasksTotal: number; tasksCompleted: number; startDate?: string; endDate?: string; hoursLogged?: number }[];
  summary: { totalProjects: number; active: number; completed: number; delayed: number; totalBudget: number; totalSpent: number; totalHours: number };
}

export const useClientProjects = (clientId: string, period?: ReportPeriod) =>
  useQuery<ClientProjectsDrilldown>({
    queryKey: ["report-client-projects", clientId, period],
    queryFn: async () => {
      const qs = buildParams(period);
      const res = await axios.get(`/reports/client/${clientId}/projects${qs ? `?${qs}` : ""}`);
      return res.data?.data ?? res.data;
    },
    enabled: !!clientId,
    staleTime: 60 * 1000,
  });
