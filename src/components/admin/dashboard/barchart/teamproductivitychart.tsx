import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend
} from "recharts";
import { type FC } from "react";
import { cn } from "@/lib/utils";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Box, type BoxProps } from "@/components/ui/box";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { useFetchTeamProductivity } from "@/hooks/useFetchTeamProductivity";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartSkeleton, ErrorState } from "@/components/skeletons";

export const TeamProductivityChart: FC<BoxProps> = ({ className, ...props }) => {
  const { data: productivityResponse, isLoading, error } = useFetchTeamProductivity();

  const chartData = productivityResponse?.data || [];

  const chartConfig = {
    totalMinutes: {
      label: "Total Minutes",
      color: "#3f53b5",
    },
    totalTasks: {
      label: "Total Tasks",
      color: "#5b21b6",
    },
    completedTasks: {
      label: "Completed Tasks",
      color: "#22c55e",
    },
    inProgressTasks: {
      label: "In Progress",
      color: "#3b82f6",
    },
    pendingTasks: {
      label: "Pending Tasks",
      color: "#eab308",
    },
  };

  if (isLoading) {
    return (
      <ComponentWrapper className={cn("p-4", className)} {...props}>
        <Flex className="gap-2 mb-4">
            <img src="/dashboard/stat.svg" alt="stat" className="size-5 dark:invert" />
          <h1 className="text-lg font-medium">Team Productivity</h1>
        </Flex>
        <ChartSkeleton height={300} className="shadow-none border-0 p-0" />
      </ComponentWrapper>
    );
  }

  if (error) {
    return (
      <ComponentWrapper className={cn("p-4", className)} {...props}>
        <ErrorState
          title="Failed to load productivity data"
          message={error.message}
        />
      </ComponentWrapper>
    );
  }

  if (chartData.length === 0) {
    return (
      <ComponentWrapper className={cn("p-4", className)} {...props}>
        <h1 className="text-lg font-medium mb-4">Team Productivity</h1>
        <Box className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No productivity data available</p>
        </Box>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper className={cn("p-4", className)} {...props}>
      <Stack className="gap-5 mb-6">
        <Flex className="items-center justify-between">
          <Flex className="gap-2">
              <img src="/dashboard/stat.svg" alt="stat" className="size-5 dark:invert" />
            <h1 className="text-lg font-medium">Team Productivity</h1>
          </Flex>
          <p className="text-xs text-muted-foreground italic">Comparing hours & task completion</p>
        </Flex>
      </Stack>

      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="userName" 
            type="category" 
            tick={{ fontSize: 12, fontWeight: 500 }} 
            width={100}
            axisLine={false}
            tickLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: "20px", fontSize: "12px" }}
          />
          <Bar 
            dataKey="totalMinutes" 
            name="Total Minutes" 
            fill="#3f53b5" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          />
          <Bar 
            dataKey="totalTasks" 
            name="Total Tasks" 
            fill="#5b21b6" 
            radius={[0, 4, 4, 0]} 
            barSize={16}
          />
          <Bar 
            dataKey="completedTasks" 
            name="Completed Tasks" 
            fill="#22c55e" 
            radius={[0, 4, 4, 0]} 
            barSize={12}
          />
          <Bar 
            dataKey="inProgressTasks" 
            name="In Progress" 
            fill="#3b82f6" 
            radius={[0, 4, 4, 0]} 
            barSize={12}
          />
          <Bar 
            dataKey="pendingTasks" 
            name="Pending Tasks" 
            fill="#eab308" 
            radius={[0, 4, 4, 0]} 
            barSize={12}
          />
        </BarChart>
      </ChartContainer>
    </ComponentWrapper>
  );
};
