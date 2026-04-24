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
import { useFetchFinancialOverview } from "@/hooks/useFetchFinancialOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportFinancialCSV, exportFinancialPDF } from "@/utils/reportExport";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const FinancialOverview: React.FC = () => {
  const { data, isLoading, error } = useFetchFinancialOverview();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[400px] text-red-500">
        Error loading financial data. Please try again later.
      </div>
    );
  }

  const { totalRevenue, totalExpenses, netProfit, timeline, categoryBreakdown, projectPerformance } = data;

  const revenueNum = Number(totalRevenue) || 0;
  const netProfitNum = Number(netProfit) || 0;
  const profitMargin = revenueNum > 0 ? (netProfitNum / revenueNum) * 100 : 0;

  const cards = [
    {
      title: "Total Revenue",
      value: `$${(Number(totalRevenue) || 0).toLocaleString()}`,
      icon: <DollarSign className="text-blue-500" />,
      description: "Based on paid invoices",
    },
    {
      title: "Total Expenses",
      value: `$${(Number(totalExpenses) || 0).toLocaleString()}`,
      icon: <TrendingDown className="text-red-500" />,
      description: "Total project expenses logged",
    },
    {
      title: "Net Profit",
      value: `$${(Number(netProfit) || 0).toLocaleString()}`,
      icon: netProfit >= 0 ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />,
      description: "Revenue minus Expenses",
    },
    {
      title: "Profit Margin",
      value: `${profitMargin.toFixed(1)}%`,
      icon: <PieChartIcon className="text-purple-500" />,
      description: "Net Profit vs Revenue",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => exportFinancialCSV(data)}
        >
          <FileDown className="w-4 h-4" />
          Export CSV
        </Button>
        <Button
          size="sm"
          className="flex items-center gap-2"
          onClick={() => exportFinancialPDF(data)}
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Category Breakdown */}
        <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Expense Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="category"
                  label={({ category, amount }) => `${category}: $${amount}`}
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance */}
      <Card className="border border-border shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Budget vs Actual (Top Projects)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {projectPerformance.map((project) => {
                const budgetNum = Number(project.budget) || 0;
                const spentNum = Number(project.spent) || 0;
                const percentage = budgetNum > 0 ? (spentNum / budgetNum) * 100 : 0;
                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-muted-foreground">
                        ${spentNum.toLocaleString()} / ${budgetNum.toLocaleString()} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                    </div>
                  </div>
                );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
