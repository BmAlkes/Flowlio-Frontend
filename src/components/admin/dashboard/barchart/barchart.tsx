import { ChartContainer } from "@/components/ui/chart";
import { type FC } from "react";
import { cn } from "@/lib/utils";
import { Flex } from "@/components/ui/flex";
import { ChartGuides } from "./chartguides";
import { Stack } from "@/components/ui/stack";
import { CalendarPopOver } from "./calendarpopover";
import { Box, type BoxProps } from "@/components/ui/box";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import {
  useFetchProjectScheduleData,
  transformToChartData,
} from "@/hooks/useFetchProjectScheduleData";
import { useState } from "react";
import { addDays } from "date-fns";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any;
  label?: any;
}) => {
  if (active && payload && payload.length) {
    return (
      <Box className="bg-white border border-gray-200 rounded-md p-2 shadow-md">
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any, idx: any) => (
          <p key={idx} style={{ color: entry.color, margin: 0 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </Box>
    );
  }
  return null;
};

export const BarChartComponent: FC<BoxProps> = ({ className, ...props }) => {
  // Initialize with default date range (last 30 days)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const {
    data: projectScheduleResponse,
    isLoading,
    error,
  } = useFetchProjectScheduleData();

  // Transform API data to chart format with frontend filtering
  const chartData = projectScheduleResponse?.data
    ? transformToChartData(projectScheduleResponse.data, dateRange || undefined)
    : [];

  const handleDateRangeChange = (
    newDateRange: { from: Date; to: Date } | null
  ) => {
    setDateRange(newDateRange);
  };

  // Show loading state
  if (isLoading) {
    return (
      <ComponentWrapper className={cn("p-4 relative", className)} {...props}>
        <Stack className="gap-5">
          <Flex className="max-lg:flex-col items-center justify-between">
            <Flex className="justify-between max-md:justify-start max-lg:w-full">
              <img src="/dashboard/stat.svg" alt="stat" className="size-5" />
              <h1 className="text-lg font-medium">Project Schedule Overview</h1>
            </Flex>
            <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
            <CalendarPopOver
              onDateRangeChange={handleDateRangeChange}
              initialDateRange={dateRange || undefined}
            />
          </Flex>
        </Stack>
        <Box className="flex items-center justify-center h-[21.8rem]">
          <p className="text-gray-500">Loading project data...</p>
        </Box>
      </ComponentWrapper>
    );
  }

  // Show error state
  if (error) {
    return (
      <ComponentWrapper className={cn("p-4 relative", className)} {...props}>
        <Stack className="gap-5">
          <Flex className="max-lg:flex-col items-center justify-between">
            <Flex className="justify-between max-md:justify-start max-lg:w-full">
              <img src="/dashboard/stat.svg" alt="stat" className="size-5" />
              <h1 className="text-lg font-medium">Project Schedule Overview</h1>
            </Flex>
            <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
            <CalendarPopOver
              onDateRangeChange={handleDateRangeChange}
              initialDateRange={dateRange || undefined}
            />
          </Flex>
        </Stack>
        <Box className="flex items-center justify-center h-[21.8rem]">
          <p className="text-red-500">Failed to load project data</p>
        </Box>
      </ComponentWrapper>
    );
  }

  // Show empty state
  if (chartData.length === 0) {
    return (
      <ComponentWrapper className={cn("p-4 relative", className)} {...props}>
        <Stack className="gap-5">
          <Flex className="max-lg:flex-col items-center justify-between">
            <Flex className="justify-between max-md:justify-start max-lg:w-full">
              <img src="/dashboard/stat.svg" alt="stat" className="size-5" />
              <h1 className="text-lg font-medium">Project Schedule Overview</h1>
            </Flex>
            <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
            <CalendarPopOver
              onDateRangeChange={handleDateRangeChange}
              initialDateRange={dateRange || undefined}
            />
          </Flex>
        </Stack>
        <Box className="flex items-center justify-center h-[21.8rem]">
          <p className="text-gray-500">No project data available</p>
        </Box>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper className={cn("p-4 relative", className)} {...props}>
      <Stack className="gap-5">
        <Flex className="max-lg:flex-col items-center justify-between">
          <Flex className="justify-between max-md:justify-start max-lg:w-full">
            <img src="/dashboard/stat.svg" alt="stat" className="size-5" />
            <h1 className="text-lg font-medium">Project Schedule Overview</h1>
          </Flex>

          <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
          <CalendarPopOver
            onDateRangeChange={handleDateRangeChange}
            initialDateRange={dateRange || undefined}
          />
        </Flex>
      </Stack>

      <Box className="absolute top-65 left-6 transform -translate-y-1/2 -rotate-90 origin-left text-sm max-sm:hidden font-light text-gray-600 max-md:top-80">
        Task
      </Box>

      <ChartContainer
        className="mt-5 w-full max-sm:-ml-6  h-[21.8rem] max-sm:h-[16rem] max-sm:overflow-x-scroll"
        config={{}}
      >
        <BarChart
          width={900}
          height={300}
          data={chartData}
          barGap={0}
          barCategoryGap="16%"
          className="max-sm:overflow-x-scroll"
        >
          <CartesianGrid
            vertical={true}
            horizontal={true}
            stroke="#cccccc"
            strokeWidth={1}
            strokeDasharray="none"
            opacity={1}
          />

          <XAxis
            dataKey="project"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            tick={{
              fontSize: 12,
              fontWeight: 500,
              fill: "#666666",
              transform: "translateX(-50%)",
              textAnchor: "middle",
            }}
            interval={0}
          />
          <YAxis
            axisLine={true}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickCount={7}
          />

          {/* Tooltip for bar hover info */}
          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="Completed"
            fill="#3f53b5"
            radius={[2, 2, 0, 0]}
            stackId="stack"
          />
          <Bar
            dataKey="Delayed"
            fill="#EF5350"
            radius={[2, 2, 0, 0]}
            stackId="stack"
          />
          <Bar
            dataKey="In-Progress"
            fill="#FFC107"
            radius={[4, 4, 0, 0]}
            stackId="stack"
          />
        </BarChart>
      </ChartContainer>
    </ComponentWrapper>
  );
};
