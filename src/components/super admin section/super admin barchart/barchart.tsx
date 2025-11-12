import { ChartContainer } from "@/components/ui/chart";
import { type FC, useState } from "react";
import { cn } from "@/lib/utils";
import { Flex } from "@/components/ui/flex";
import { SuperAdminChartGuides } from "./chartguides";
import { Stack } from "@/components/ui/stack";
import { type BoxProps } from "@/components/ui/box";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { SuperAdminCalendarPopOver } from "./calendarpopover";
import { DiamondIcon } from "./diamondicon";
import { useFetchAllData } from "@/hooks/useFetchAllData";
import { processChartData } from "@/utils/chartDataProcessor";

export const SuperAdminBarChartComponent: FC<BoxProps> = ({
  className,
  ...props
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const { data: allDataResponse, isLoading, error } = useFetchAllData();

  // Process the data for the selected year
  const chartData = allDataResponse?.data
    ? processChartData(
        allDataResponse.data.organizations,
        allDataResponse.data.projects,
        [], // Empty invoices array since we removed it from getAllData
        selectedYear
      )
    : [];

  const CustomDiamondDot = (props: any) => {
    const { cx, cy } = props;
    if (typeof cx !== "number" || typeof cy !== "number") return null;
    return (
      <g transform={`translate(${cx - 6}, ${cy - 8})`}>
        <DiamondIcon size={16} />
      </g>
    );
  };

  const HoverCustomDiamondDot = (props: any) => {
    const { cx, cy } = props;
    if (typeof cx !== "number" || typeof cy !== "number") return null;
    return (
      <g transform={`translate(${cx - 6}, ${cy - 8})`}>
        <DiamondIcon size={17} />
      </g>
    );
  };

  return (
    <ComponentWrapper className={cn("p-4", className)} {...props}>
      <Stack className="gap-5">
        <Flex className="max-lg:flex-col items-center justify-between">
          <Flex className="justify-between max-md:justify-start max-lg:w-full">
            <img src="/dashboard/stat.svg" alt="stat" className="size-5" />
            <h1 className="text-lg font-medium">
              Project Overview ({selectedYear})
            </h1>
          </Flex>

          <Flex className="gap-4">
            <SuperAdminChartGuides className="gap-4 pt-1 max-md:mr-auto" />
            <SuperAdminCalendarPopOver
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </Flex>
        </Flex>
      </Stack>

      <ChartContainer className="mt-5 w-full h-[21.8rem] " config={{}}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">
              Failed to load chart data: {error.message}
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">
              No data available for the selected year
            </div>
          </div>
        ) : (
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
            />

            <YAxis
              axisLine={true}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickCount={7}
              label={{
                value: "No. of companies",
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
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #cccccc",
                backgroundColor: "#ffffff",
                padding: "10px",
                fontSize: "12px",
                fontWeight: "500",
                color: "#666666",
                textTransform: "capitalize",
                textShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              }}
            />
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea4864" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ea4864" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="projectsCreated"
              fill="url(#areaGradient)"
              stroke="#ea4864"
              dot={<CustomDiamondDot />}
              activeDot={<HoverCustomDiamondDot />}
              fillOpacity={1}
              strokeWidth={0}
            />

            <Bar dataKey="companies" barSize={30} fill="#3f53b5" />
          </ComposedChart>
        )}
      </ChartContainer>
    </ComponentWrapper>
  );
};
