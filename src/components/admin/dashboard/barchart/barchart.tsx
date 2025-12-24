import { ChartContainer } from "@/components/ui/chart";
import { type FC } from "react";
import { cn } from "@/lib/utils";
import { Flex } from "@/components/ui/flex";
import { ChartGuides } from "./chartguides";
import { Stack } from "@/components/ui/stack";
import { CalendarPopOver } from "./calendarpopover";
import { Box, type BoxProps } from "@/components/ui/box";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import {
  useFetchProjectScheduleData,
  transformToChartData,
} from "@/hooks/useFetchProjectScheduleData";
import { useState } from "react";
import { addDays } from "date-fns";
import { useTranslation } from "react-i18next";

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
    // Check if this is a "No Tasks" project
    const hasNoTasks = payload.some(
      (entry: any) => entry.dataKey === "No Tasks" && entry.value > 0
    );

    return (
      <Box className="bg-white border border-gray-200 rounded-md p-2 shadow-md">
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        {hasNoTasks ? (
          <p style={{ color: "#9CA3AF", margin: 0 }}>No tasks in there</p>
        ) : (
          payload
            .filter((entry: any) => entry.dataKey !== "No Tasks")
            .map((entry: any, idx: any) => (
              <p key={idx} style={{ color: entry.color, margin: 0 }}>
                {entry.name}: {entry.value}
              </p>
            ))
        )}
      </Box>
    );
  }
  return null;
};

export const BarChartComponent: FC<BoxProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
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

  // Debug: Log projects with no tasks
  const projectsWithNoTasks = chartData.filter((d) => d.hasNoTasks);
  if (projectsWithNoTasks.length > 0) {
    console.log(
      `📊 Projects with no tasks: ${projectsWithNoTasks.length}`,
      projectsWithNoTasks.map((p) => ({
        project: p.project,
        "No Tasks": "No Tasks",
        totalTasks: p.totalTasks,
      }))
    );
  }

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
              <h1 className="text-lg font-medium">
                {t("charts.projectScheduleOverview")}
              </h1>
            </Flex>
            <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
            <CalendarPopOver
              onDateRangeChange={handleDateRangeChange}
              initialDateRange={dateRange || undefined}
            />
          </Flex>
        </Stack>
        <Box className="flex items-center justify-center h-[21.8rem]">
          <p className="text-gray-500">{t("dashboard.loadingProjectData")}</p>
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
              <h1 className="text-lg font-medium">
                {t("charts.projectScheduleOverview")}
              </h1>
            </Flex>
            <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
            <CalendarPopOver
              onDateRangeChange={handleDateRangeChange}
              initialDateRange={dateRange || undefined}
            />
          </Flex>
        </Stack>
        <Box className="flex items-center justify-center h-[21.8rem]">
          <p className="text-red-500">
            {t("dashboard.failedToLoadProjectData")}
          </p>
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
              <h1 className="text-lg font-medium">
                {t("charts.projectScheduleOverview")}
              </h1>
            </Flex>
            <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
            <CalendarPopOver
              onDateRangeChange={handleDateRangeChange}
              initialDateRange={dateRange || undefined}
            />
          </Flex>
        </Stack>
        <Box className="flex items-center justify-center h-[21.8rem]">
          <p className="text-gray-500">{t("dashboard.noProjectData")}</p>
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
            <h1 className="text-lg font-medium">
              {t("charts.projectScheduleOverview")}
            </h1>
          </Flex>

          <ChartGuides className="gap-4 pt-1 max-md:mr-auto" />
          <CalendarPopOver
            onDateRangeChange={handleDateRangeChange}
            initialDateRange={dateRange || undefined}
          />
        </Flex>
      </Stack>

      <Box className="absolute top-65 left-6 transform -translate-y-1/2 -rotate-90 origin-left text-sm max-sm:hidden font-light text-gray-600 max-md:top-80">
        {t("dashboard.taskLabel")}
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
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
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
            domain={[0, "auto"]}
            allowDataOverflow={false}
          />

          {/* Tooltip for bar hover info */}
          <Tooltip content={<CustomTooltip />} />

          {/* Bar for projects with no tasks - gray color (shown first so it's at bottom of stack) */}
          <Bar
            dataKey="No Tasks"
            fill="#9CA3AF"
            radius={[4, 4, 0, 0]}
            stackId="stack"
            minPointSize={5}
          >
            <LabelList
              dataKey="No Tasks"
              content={(props: any) => {
                const { x, y, width, value } = props;
                // Only show label if value > 0 (i.e., project has no tasks)
                if (value > 0) {
                  return (
                    <text
                      x={x + width / 2}
                      y={y - 5}
                      fill="#6B7280"
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={500}
                    >
                      No tasks
                    </text>
                  );
                }
                return null;
              }}
            />
          </Bar>

          {/* Regular task status bars */}
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
