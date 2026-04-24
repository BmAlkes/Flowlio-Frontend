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
  Cell,
} from "recharts";
import { useFetchTeamProductivity } from "@/hooks/useFetchTeamProductivity";
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
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { exportProductivityCSV, exportProductivityPDF } from "@/utils/reportExport";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const TeamProductivity: React.FC = () => {
  const { data: productivityData, isLoading, error } = useFetchTeamProductivity();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !productivityData?.data) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        Error loading team productivity data.
      </div>
    );
  }

  const teamData = productivityData.data;

  // Prepare data for the tasks chart
  const tasksChartData = teamData.map((member) => ({
    name: member.userName.split(" ")[0], // First name
    Completed: member.completedTasks,
    "In Progress": member.inProgressTasks,
    Pending: member.pendingTasks,
  }));

  // Prepare data for the time tracking chart
  const timeChartData = teamData.map((member) => ({
    name: member.userName.split(" ")[0],
    "Hours Logged": Number((member.totalMinutes / 60).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => exportProductivityCSV(teamData)}
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </Button>
        <Button
          size="sm"
          className="flex items-center gap-2"
          onClick={() => exportProductivityPDF(teamData)}
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion by Member */}
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Task Status by Member
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }}
                />
                <Legend />
                <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="In Progress" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Logged by Member */}
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Hours Logged by Member
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                   contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }}
                   formatter={(value: number) => [`${value} hrs`, 'Hours Logged']}
                />
                <Bar dataKey="Hours Logged" radius={[4, 4, 0, 0]}>
                  {timeChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Team Table */}
      <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Team Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead className="text-center">Total Tasks</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">In Progress</TableHead>
                  <TableHead className="text-center">Completion %</TableHead>
                  <TableHead className="text-right">Hours Logged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No team members or data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  teamData.map((member) => {
                    const completionRate = member.totalTasks > 0 
                      ? Math.round((member.completedTasks / member.totalTasks) * 100) 
                      : 0;
                    
                    return (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.userImage || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {member.userName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{member.totalTasks}</TableCell>
                        <TableCell className="text-center text-green-600 font-medium">{member.completedTasks}</TableCell>
                        <TableCell className="text-center text-blue-600">{member.inProgressTasks}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span>{completionRate}%</span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full" 
                                style={{ width: `${completionRate}%` }} 
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(member.totalMinutes / 60).toFixed(1)} hrs
                        </TableCell>
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
