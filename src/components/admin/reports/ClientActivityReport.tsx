import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useFetchClientActivity, type ReportPeriod } from "@/hooks/useReports";
import { ReportControls, TrendBadge } from "./ReportControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Briefcase, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportClientActivityCSV, exportClientActivityPDF } from "@/utils/reportExport";
import { useNavigate } from "react-router";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  color: "hsl(var(--foreground))",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#94a3b8"];

const STATUS_DOT: Record<string, string> = {
  Active: "bg-green-600", Onboarding: "bg-blue-500", "On Hold": "bg-amber-500",
  Inactive: "bg-gray-400", Completed: "bg-emerald-600", Churned: "bg-rose-500",
  "New Lead": "bg-blue-400", "Contract Signed": "bg-emerald-500",
  "Project In Progress": "bg-indigo-500", Lost: "bg-rose-400",
};

const fmtTime = (item: { timeTracked?: { hours: number; minutes: number; totalMinutes: number } | null; hoursTracked?: number }) => {
  const tt = item.timeTracked;
  if (tt?.totalMinutes) {
    if (tt.hours > 0) return `${tt.hours}h ${tt.minutes}m`;
    if (tt.minutes > 0) return `${tt.minutes}m`;
  }
  const h = Math.floor(item.hoursTracked ?? 0);
  const m = Math.round(((item.hoursTracked ?? 0) - h) * 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "—";
};

interface Props {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
}

const ClientActivityReport: React.FC<Props> = ({ period, onPeriodChange }) => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = useFetchClientActivity(period);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      <Skeleton className="h-[320px] w-full" />
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground">
      <AlertTriangle className="h-8 w-8 text-rose-400" />
      <p className="text-sm">Could not load client data. Try refreshing.</p>
    </div>
  );

  const { clientStats, projectStatusSummary, totals, comparison } = data;

  const totalClients  = totals?.totalClients  ?? clientStats.length;
  const totalProjects = totals?.totalProjects  ?? clientStats.reduce((s, c) => s + c.projects.total, 0);
  const grandMin = clientStats.reduce((s, c) => s + (c.timeTracked?.totalMinutes ?? (c.hoursTracked ?? 0) * 60), 0);
  const grandH = Math.floor(grandMin / 60);
  const grandM = Math.round(grandMin % 60);
  const timeLabel = grandH > 0 ? `${grandH}h ${grandM}m` : `${grandM}m`;

  const chartClients = showAll ? clientStats : clientStats.slice(0, 10);

  const chartData = chartClients.map((c) => ({
    name: c.client.name.split(" ")[0],
    Active: c.projects.active,
    Completed: c.projects.completed,
    Delayed: c.projects.delayed,
    Pending: c.projects.pending,
  }));

  return (
    <div className="space-y-5">
      <ReportControls
        period={period}
        onPeriodChange={onPeriodChange}
        updatedAt={data.updatedAt}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExportCSV={() => exportClientActivityCSV(data)}
        onExportPDF={() => exportClientActivityPDF(data)}
      />

      {/* KPI summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Clients", value: totalClients, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Total Projects", value: totalProjects, icon: Briefcase, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Time Tracked", value: timeLabel, icon: Clock, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((s) => (
          <Card key={s.label} className="border border-border bg-card">
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
              {s.label === "Total Clients" && <TrendBadge change={comparison?.clientChange ?? null} />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Projects per client bar */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Projects per Client</CardTitle>
            {clientStats.length > 10 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAll(!showAll)}>
                {showAll ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show all ({clientStats.length})</>}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No project data for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, chartClients.length * 36)}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={68} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Active"    stackId="s" fill="#3b82f6" />
                  <Bar dataKey="Completed" stackId="s" fill="#10b981" />
                  <Bar dataKey="Delayed"   stackId="s" fill="#ef4444" />
                  <Bar dataKey="Pending"   stackId="s" fill="#f59e0b" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Project status donut */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {projectStatusSummary.length === 0 ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No status data.</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={230}>
                  <PieChart>
                    <Pie data={projectStatusSummary} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="status">
                      {projectStatusSummary.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {projectStatusSummary.map((s, i) => (
                    <div key={s.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground capitalize truncate max-w-[80px]">{s.status}</span>
                      </div>
                      <span className="font-semibold tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client table — simplified */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead className="text-center">Tasks</TableHead>
                  <TableHead className="text-end">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No clients for this period.</TableCell>
                  </TableRow>
                ) : (
                  clientStats.map((item) => {
                    const dot = STATUS_DOT[item.client.status] ?? "bg-gray-400";
                    const taskPct = item.tasks.total > 0 ? Math.round((item.tasks.completed / item.tasks.total) * 100) : 0;
                    return (
                      <TableRow
                        key={item.client.id}
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => navigate("/dashboard/client-management")}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={item.client.image || ""} />
                              <AvatarFallback className="text-xs bg-muted">{item.client.name.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm leading-none">{item.client.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.client.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            <span className="text-xs">{item.client.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs space-x-1">
                            <span className="text-blue-600 font-medium">{item.projects.active}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-green-600 font-medium">{item.projects.completed}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-rose-500 font-medium">{item.projects.delayed}</span>
                          </div>
                          <p className="text-xs text-muted-foreground/90 mt-0.5">active · done · late</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs tabular-nums">{item.tasks.completed}/{item.tasks.total}</span>
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${taskPct}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-end text-sm font-medium">{fmtTime(item as any)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientActivityReport;
