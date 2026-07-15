import { ChartContainer } from "@/components/ui/chart";
import { type FC } from "react";
import { cn } from "@/lib/utils";
import { Flex } from "@/components/ui/flex";
import { Box, type BoxProps } from "@/components/ui/box";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { ViewerCalendarPopOver } from "./viewercalendarpopover";
import type { DateRange } from "react-day-picker";
import { ViewerChartGuides } from "./viewerchartguides";
import { BarChart2 } from "lucide-react";

const defaultChartData = [
  { month: "Jan", Mon: 5, Tue: 4, Wed: 4, Thurs: 3, Fri: 5, Sat: 4 },
  { month: "Feb", Mon: 7, Tue: 23, Wed: 5, Thurs: 4, Fri: 6, Sat: 6 },
  { month: "Mar", Mon: 2, Tue: 1, Wed: 2, Thurs: 1, Fri: 3, Sat: 2 },
  { month: "Apr", Mon: 12, Tue: 5, Wed: 6, Thurs: 4, Fri: 8, Sat: 6 },
  { month: "May", Mon: 8, Tue: 4, Wed: 5, Thurs: 3, Fri: 7, Sat: 5 },
  { month: "Jun", Mon: 9, Tue: 4, Wed: 5, Thurs: 3, Fri: 7, Sat: 4 },
  { month: "Jul", Mon: 4, Tue: 2, Wed: 3, Thurs: 2, Fri: 4, Sat: 2 },
  { month: "Aug", Mon: 12, Tue: 5, Wed: 6, Thurs: 4, Fri: 8, Sat: 6 },
  { month: "Sept", Mon: 7, Tue: 2, Wed: 3, Thurs: 2, Fri: 4, Sat: 3 },
  { month: "Oct", Mon: 10, Tue: 4, Wed: 5, Thurs: 3, Fri: 7, Sat: 6 },
  { month: "Nov", Mon: 3, Tue: 1, Wed: 2, Thurs: 1, Fri: 2, Sat: 12 },
  { month: "Dec", Mon: 6, Tue: 2, Wed: 3, Thurs: 2, Fri: 4, Sat: 3 },
];

// Add average (total) to each month
type ChartDatum = {
  month: string;
  Mon: number;
  Tue: number;
  Wed: number;
  Thurs: number;
  Fri: number;
  Sat: number;
  total?: number;
};

defaultChartData.forEach((d: ChartDatum) => {
  d.total = d.Mon + d.Tue + d.Wed + d.Thurs + d.Fri + d.Sat;
});

const dayColors = {
  Mon: "#3F51B5", // Blue
  Tue: "#E91E63", // Pink
  Wed: "#FFCC00", // Yellow
  Thurs: "#1B7C1F", // Green
  Fri: "#C43193", // Magenta
  Sat: "#2FBBE0", // Cyan
};

const dayLabels = [
  { key: "Mon", label: "Mon", color: dayColors.Mon },
  { key: "Tue", label: "Tue", color: dayColors.Tue },
  { key: "Wed", label: "Wed", color: dayColors.Wed },
  { key: "Thurs", label: "Thurs", color: dayColors.Thurs },
  { key: "Fri", label: "Fri", color: dayColors.Fri },
  { key: "Sat", label: "Sat", color: dayColors.Sat },
];
const monthFullNames: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sept: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

const dayFullNames: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thurs: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};
export type ViewerChartPoint = {
  month: string;
  Mon: number;
  Tue: number;
  Wed: number;
  Thurs: number;
  Fri: number;
  Sat: number;
  total?: number;
};

import { useTranslation } from "react-i18next";

export const ViewerBarChartComponent: FC<
  BoxProps & {
    data?: ViewerChartPoint[];
    dateRange?: DateRange;
    onApplyDateRange?: (range: DateRange) => void;
    onResetDateRange?: () => void;
    isLoading?: boolean;
  }
> = ({
  className,
  data,
  dateRange,
  onApplyDateRange,
  onResetDateRange,
  isLoading = false,
  ...props
}) => {
  const { t } = useTranslation();

  // Detect whether incoming data has any non-zero activity
  const hasActivity =
    data &&
    data.length > 0 &&
    data.some(
      (d) => d.Mon + d.Tue + d.Wed + d.Thurs + d.Fri + d.Sat > 0
    );

  const chartData = (
    hasActivity
      ? data!.map((d) => ({
          ...d,
          total: d.total ?? d.Mon + d.Tue + d.Wed + d.Thurs + d.Fri + d.Sat,
        }))
      : defaultChartData
  ) as ChartDatum[];

  // Header section reused in all render branches
  const header = (
    <Flex className="max-lg:flex-col items-center justify-between">
      <Flex className="justify-between max-md:justify-start max-lg:w-full">
        <img src="/dashboard/stat.svg" alt="stat" className="size-5" />
        <h1 className="text-lg font-medium">{t("viewerChart.performance")}</h1>
      </Flex>
      <Flex className="gap-4">
        <ViewerChartGuides className="gap-4 pt-1 max-md:me-auto" />
      </Flex>
      <ViewerCalendarPopOver
        selected={dateRange}
        onApply={(r) => onApplyDateRange && onApplyDateRange(r)}
        onReset={() => onResetDateRange && onResetDateRange()}
      />
    </Flex>
  );



  // Loading state
  if (isLoading) {
    return (
      <ComponentWrapper className={cn("p-4", className)} {...props}>
        {header}
        <Flex className="items-center justify-center h-[21.8rem]">
          <Box className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">
              {t("viewerChart.loading", {
                defaultValue: "Loading performance data...",
              })}
            </p>
          </Box>
        </Flex>
      </ComponentWrapper>
    );
  }

  // Empty state — no activity yet
  if (!hasActivity) {
    return (
      <ComponentWrapper className={cn("p-4", className)} {...props}>
        {header}
        <Flex className="flex-col items-center justify-center h-[21.8rem] gap-4">
          <BarChart2
            className="w-12 h-12 text-muted-foreground/40"
            strokeWidth={1.5}
          />
          <Box className="text-center">
            <p className="text-base font-medium text-muted-foreground">
              {t("viewerChart.noData", { defaultValue: "No activity yet" })}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {t("viewerChart.noDataDesc", {
                defaultValue:
                  "Start tracking time on tasks to see your performance here.",
              })}
            </p>
          </Box>
        </Flex>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper className={cn("p-4", className)} {...props}>
      {header}

      <ChartContainer className="mt-5 w-full h-[21.8rem] " config={{}}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            vertical={true}
            horizontal={true}
            stroke="#cccccc"
            strokeWidth={1}
            strokeDasharray="none"
            opacity={0.6}
          />
          <XAxis
            dataKey="month"
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
            padding={{ left: 15, right: 15 }}
            tickFormatter={(value) => t(`viewerChart.months.${value}`)}
          />
          <YAxis
            axisLine={true}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickCount={7}
            label={{
              value: t("viewerChart.task"),
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: {
                textAnchor: "middle",
                fontSize: 14,
                fontWeight: 300,
                color: "#666666",
              },
            }}
          />
          <Tooltip
            content={({ label, payload }) => {
              if (!payload || !payload.length) return null;
              const fullMonthKey =
                monthFullNames[label] === "May"
                  ? "MayFull"
                  : monthFullNames[label] || label;
              const fullMonth = t(`viewerChart.months.${fullMonthKey}`);

              return (
                <Box className="rounded-lg border border-border bg-card p-2 text-[14px] font-normal text-muted-foreground capitalize shadow-sm w-[140px] text-shadow-sm font-outfit">
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    {fullMonth}
                  </div>
                  {payload
                    .filter(
                      (entry) =>
                        dayFullNames[entry.name as keyof typeof dayFullNames]
                    )
                    .map((entry, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#000", fontWeight: 400 }}>
                          {t(
                            `viewerChart.days.${
                              dayFullNames[
                                entry.name as keyof typeof dayFullNames
                              ]
                            }`
                          )}
                        </span>
                        <span style={{ color: entry.color, fontWeight: 500 }}>
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  {payload.some((entry) => entry.name === "total") && (
                    <div
                      style={{
                        borderTop: "1px solid #eee",
                        marginTop: 6,
                        paddingTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      {t("viewerChart.total")}:{" "}
                      <span style={{ color: "#2FBBE0" }}>
                        {payload.find((entry) => entry.name === "total")?.value}
                      </span>
                    </div>
                  )}
                </Box>
              );
            }}
          />
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2FBBE0" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2FBBE0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="total"
            fill="url(#areaGradient)"
            stroke="#2FBBE0"
            fillOpacity={1}
            dot={false}
            activeDot={false}
            strokeWidth={0}
          />
          {/* Stacked Bars for each day */}
          {dayLabels.map((day, i) => (
            <Bar
              key={day.key}
              dataKey={day.key}
              stackId="a"
              barSize={35}
              fill={day.color}
              radius={i === 5 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </ComposedChart>
      </ChartContainer>
    </ComponentWrapper>
  );
};

