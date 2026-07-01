import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useFetchFinancialOverview, type ReportPeriod } from "@/hooks/useReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, AlertTriangle } from "lucide-react";
import { exportFinancialCSV, exportFinancialPDF } from "@/utils/reportExport";
import { ReportControls, TrendBadge } from "./ReportControls";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];
const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  color: "hsl(var(--foreground))",
};

interface Props {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
}

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

const FinancialOverview: React.FC<Props> = ({ period, onPeriodChange }) => {
  const { data, isLoading, error, refetch, isFetching } = useFetchFinancialOverview(period);

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[320px] w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
      <Skeleton className="h-[240px] w-full" />
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground">
      <AlertTriangle className="h-8 w-8 text-rose-400" />
      <p className="text-sm">Could not load financial data. Try refreshing.</p>
    </div>
  );

  const {
    totalRevenue, totalExpenses, netProfit,
    timeline, categoryBreakdown, projectPerformance, comparison,
    granularity, totals,
  } = data;

  const revenue = Number(totalRevenue) || 0;
  const expenses = Number(totalExpenses) || 0;
  const profit = Number(netProfit) || 0;
  const margin = totals?.avgMargin != null ? totals.avgMargin : (revenue > 0 ? (profit / revenue) * 100 : 0);

  // Normalise timeline: backend now sends `date` instead of `month`
  const normalisedTimeline = timeline.map((t) => ({
    ...t,
    label: t.date ?? t.month ?? "",
  }));

  const kpis = [
    {
      label: "Revenue",
      value: `$${revenue.toLocaleString()}`,
      sub: "Paid invoices",
      icon: DollarSign,
      iconColor: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      change: comparison?.revenueChange,
    },
    {
      label: "Expenses",
      value: `$${expenses.toLocaleString()}`,
      sub: "Project costs",
      icon: TrendingDown,
      iconColor: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      change: comparison?.expensesChange,
    },
    {
      label: "Net Profit",
      value: `$${profit.toLocaleString()}`,
      sub: "Revenue − expenses",
      icon: profit >= 0 ? TrendingUp : TrendingDown,
      iconColor: profit >= 0 ? "text-green-600" : "text-rose-500",
      bg: profit >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-rose-50 dark:bg-rose-900/20",
      change: comparison?.profitChange,
    },
    {
      label: "Profit Margin",
      value: `${margin.toFixed(1)}%`,
      sub: "Net / Revenue",
      icon: PieChartIcon,
      iconColor: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      change: null,
    },
  ];

  const granularityLabel = granularity
    ? { daily: "Daily", weekly: "Weekly", monthly: "Monthly" }[granularity]
    : ({ "7d": "Daily", "30d": "Weekly", "90d": "Monthly", "ytd": "Monthly", "all": "Monthly" }[period] ?? "Monthly");

  const totalExpensePie = categoryBreakdown.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-5">
      <ReportControls
        period={period}
        onPeriodChange={onPeriodChange}
        updatedAt={data.updatedAt}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExportCSV={() => exportFinancialCSV(data)}
        onExportPDF={() => exportFinancialPDF(data)}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border border-border bg-card">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{k.label}</span>
                <div className={`p-1.5 rounded-lg ${k.bg}`}>
                  <k.icon className={`h-3.5 w-3.5 ${k.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{k.value}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs text-muted-foreground">{k.sub}</span>
                <TrendBadge change={k.change} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Expenses */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {granularityLabel} Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {normalisedTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground text-sm">
                No timeline data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={normalisedTimeline} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => fmt(v)} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} name="Revenue" maxBarSize={32} />
                  <Bar dataKey="expenses" fill="#f87171" radius={[4,4,0,0]} name="Expenses" maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expense breakdown donut */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground text-sm">
                <PieChartIcon className="h-10 w-10 opacity-20" />
                No expenses logged yet.
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={4}
                      dataKey="amount" nameKey="category"
                    >
                      {categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`$${v.toLocaleString()}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend with % */}
                <div className="flex-1 space-y-2">
                  {categoryBreakdown.map((c, i) => {
                    const pct = totalExpensePie > 0 ? ((c.amount / totalExpensePie) * 100).toFixed(1) : "0";
                    return (
                      <div key={c.category} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-muted-foreground capitalize truncate max-w-[90px]">{c.category}</span>
                        </div>
                        <span className="font-medium tabular-nums">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual */}
      {projectPerformance.length > 0 && (
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Budget vs Actual — Top Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectPerformance.map((proj) => {
                const budget = Number(proj.budget) || 0;
                const spent = Number(proj.spent) || 0;
                const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                const over = budget > 0 && spent > budget;
                const warn = pct >= 90;
                return (
                  <div key={proj.id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-1.5 font-medium truncate max-w-[55%]">
                        {warn && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                        <span className="truncate">{proj.name}</span>
                      </div>
                      <span className={`text-xs tabular-nums ${over ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
                        ${spent.toLocaleString()} / ${budget.toLocaleString()} ({Math.round(pct)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-400" : "bg-blue-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialOverview;
