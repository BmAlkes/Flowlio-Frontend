import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useFetchTeamProductivity, type ReportPeriod } from "@/hooks/useReports";
import { ReportControls } from "./ReportControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, ChevronUp, ChevronDown, Users } from "lucide-react";
import { exportProductivityCSV, exportProductivityPDF } from "@/utils/reportExport";

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

type SortKey = "name" | "tasks" | "completion" | "hours";
type SortDir = "asc" | "desc";

const TeamProductivity: React.FC<Props> = ({ period, onPeriodChange }) => {
  const { data: productivityData, isLoading, error, refetch, isFetching } = useFetchTeamProductivity(period);
  const [sortKey, setSortKey] = useState<SortKey>("completion");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-[300px] w-full" />
      <Skeleton className="h-[280px] w-full" />
    </div>
  );

  if (error || !productivityData?.data) return (
    <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground">
      <AlertTriangle className="h-8 w-8 text-rose-400" />
      <p className="text-sm">Could not load team data. Try refreshing.</p>
    </div>
  );

  const teamData = productivityData.data;

  // Sort
  const sorted = [...teamData].sort((a, b) => {
    let va = 0, vb = 0;
    if (sortKey === "name") return sortDir === "asc" ? a.userName.localeCompare(b.userName) : b.userName.localeCompare(a.userName);
    if (sortKey === "tasks") { va = a.totalTasks; vb = b.totalTasks; }
    if (sortKey === "hours") { va = a.totalMinutes; vb = b.totalMinutes; }
    if (sortKey === "completion") {
      va = a.totalTasks > 0 ? a.completedTasks / a.totalTasks : 0;
      vb = b.totalTasks > 0 ? b.completedTasks / b.totalTasks : 0;
    }
    return sortDir === "asc" ? va - vb : vb - va;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="opacity-20 ml-1">↕</span>;
    return sortDir === "asc"
      ? <ChevronUp className="inline h-3 w-3 ml-0.5" />
      : <ChevronDown className="inline h-3 w-3 ml-0.5" />;
  };

  // Single stacked bar chart (tasks) + hours in same chart
  const chartData = sorted.map((m) => ({
    name: m.userName.split(" ")[0],
    Completed: m.completedTasks,
    "In Progress": m.inProgressTasks,
    Pending: m.pendingTasks,
    Hours: Number((m.totalMinutes / 60).toFixed(1)),
  }));

  const totals = productivityData.totals;

  return (
    <div className="space-y-5">
      <ReportControls
        period={period}
        onPeriodChange={onPeriodChange}
        updatedAt={productivityData.updatedAt}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onExportCSV={() => exportProductivityCSV(teamData)}
        onExportPDF={() => exportProductivityPDF(teamData)}
      />

      {/* Totals bar */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Members", value: totals.totalMembers },
            { label: "Total Tasks", value: totals.totalTasks },
            { label: "Completed", value: totals.totalCompletedTasks },
            { label: "Avg Completion", value: `${(totals.avgCompletionRate ?? 0).toFixed(0)}%` },
          ].map((s) => (
            <Card key={s.label} className="border border-border bg-card">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold mt-0.5">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chart */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Task Status by Member</CardTitle>
        </CardHeader>
        <CardContent>
          {teamData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 gap-2 text-muted-foreground">
              <Users className="h-10 w-10 opacity-20" />
              <p className="text-sm">No team data for this period.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, teamData.length * 44)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={72} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Completed"   stackId="s" fill="#10b981" />
                <Bar dataKey="In Progress" stackId="s" fill="#3b82f6" />
                <Bar dataKey="Pending"     stackId="s" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sortable table */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    Member <SortIcon k="name" />
                  </TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort("tasks")}>
                    Tasks <SortIcon k="tasks" />
                  </TableHead>
                  <TableHead className="text-center">Done / Active / Pending</TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort("completion")}>
                    Completion <SortIcon k="completion" />
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort("hours")}>
                    Hours <SortIcon k="hours" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No data for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((m) => {
                    const rate = m.totalTasks > 0 ? Math.round((m.completedTasks / m.totalTasks) * 100) : 0;
                    const rateColor = rate >= 80 ? "text-green-600" : rate < 50 ? "text-rose-600" : "text-amber-600";
                    const barColor = rate >= 80 ? "bg-green-500" : rate < 50 ? "bg-rose-500" : "bg-amber-400";
                    const hours = (m.totalMinutes / 60).toFixed(1);
                    return (
                      <TableRow key={m.userId}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={m.userImage || ""} />
                              <AvatarFallback className="text-[10px] bg-muted">{m.userName.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{m.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{m.totalTasks}</TableCell>
                        <TableCell className="text-center text-sm">
                          <span className="text-green-600 font-medium">{m.completedTasks}</span>
                          <span className="text-muted-foreground mx-1">/</span>
                          <span className="text-blue-600">{m.inProgressTasks}</span>
                          <span className="text-muted-foreground mx-1">/</span>
                          <span className="text-muted-foreground">{m.pendingTasks}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-sm font-semibold ${rateColor}`}>{rate}%</span>
                            <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${rate}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">{hours}h</TableCell>
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

export default TeamProductivity;
