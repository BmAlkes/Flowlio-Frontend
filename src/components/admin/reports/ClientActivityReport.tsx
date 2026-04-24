import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useFetchClientActivity } from "@/hooks/useFetchClientActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Briefcase, Clock, FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportClientActivityCSV, exportClientActivityPDF } from "@/utils/reportExport";

const PROJECT_COLORS: Record<string, string> = {
  active: "#3b82f6",
  ongoing: "#3b82f6",
  completed: "#10b981",
  delayed: "#ef4444",
  pending: "#f59e0b",
  unknown: "#94a3b8",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  "New Lead": "bg-blue-100 text-blue-700",
  "In Negotiation": "bg-yellow-100 text-yellow-700",
  "Contract Signed": "bg-purple-100 text-purple-700",
  "Project In Progress": "bg-cyan-100 text-cyan-700",
  Completed: "bg-green-100 text-green-700",
  "Inactive Client": "bg-slate-100 text-slate-600",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#94a3b8"];

const ClientActivityReport: React.FC = () => {
  const { data, isLoading, error } = useFetchClientActivity();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] w-full" />
          <Skeleton className="h-[350px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        Error loading client activity data.
      </div>
    );
  }

  const { clientStats, projectStatusSummary } = data;

  // Summary stats
  const totalClients = clientStats.length;
  const totalProjects = clientStats.reduce((sum, c) => sum + c.projects.total, 0);
  const totalHours = clientStats.reduce((sum, c) => sum + c.hoursTracked, 0).toFixed(1);

  // Chart data for top 8 clients by projects
  const topClientChartData = clientStats.slice(0, 8).map((c) => ({
    name: c.client.name.split(" ")[0],
    Active: c.projects.active,
    Completed: c.projects.completed,
    Delayed: c.projects.delayed,
    Pending: c.projects.pending,
  }));

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => exportClientActivityCSV(data)}
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </Button>
        <Button
          size="sm"
          className="flex items-center gap-2"
          onClick={() => exportClientActivityPDF(data)}
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{totalClients}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Briefcase className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{totalProjects}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours Tracked</p>
              <p className="text-2xl font-bold">{totalHours} hrs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Distribution by Client */}
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Projects per Client
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {topClientChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No project data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClientChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={70}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      color: "#000",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Active" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Completed" stackId="a" fill="#10b981" />
                  <Bar dataKey="Delayed" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Overall Project Status Pie */}
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Overall Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {projectStatusSummary.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No project status data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusSummary}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                    labelLine={false}
                  >
                    {projectStatusSummary.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PROJECT_COLORS[entry.status] ?? PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      color: "#000",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Client Table */}
      <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Client Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Delayed</TableHead>
                  <TableHead className="text-center">Total Projects</TableHead>
                  <TableHead className="text-center">Tasks Done</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No client data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  clientStats.map((item) => (
                    <TableRow key={item.client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.client.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {item.client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium leading-none">{item.client.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.client.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_BADGE_COLORS[item.client.status] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.client.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-blue-600 font-medium">
                        {item.projects.active}
                      </TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {item.projects.completed}
                      </TableCell>
                      <TableCell className="text-center text-red-500 font-medium">
                        {item.projects.delayed}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {item.projects.total}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs text-muted-foreground">
                          {item.tasks.completed}/{item.tasks.total}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.hoursTracked} hrs
                      </TableCell>
                    </TableRow>
                  ))
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
