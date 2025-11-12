import React from "react";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Flex } from "../ui/flex";

interface CalendarHeaderProps {
  viewMode: "day" | "week" | "month";
  currentWeek: Date;
  weekDates: Date[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: "day" | "week" | "month") => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  currentWeek,
  weekDates,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}) => {
  return (
    <Flex className="items-center justify-between px-6 pt-6 pb-2">
      {/* Navigation */}
      <Flex className="items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onPrev}
          className="cursor-pointer"
        >
          <ChevronLeft />
        </Button>

        <Box className="text-lg font-semibold">
          {viewMode === "day"
            ? currentWeek.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : viewMode === "week"
            ? `${weekDates[0].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - ${weekDates[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`
            : currentWeek.toLocaleDateString("default", {
                month: "long",
                year: "numeric",
              })}
        </Box>

        <Button
          size="icon"
          variant="ghost"
          onClick={onNext}
          className="cursor-pointer"
        >
          <ChevronRight />
        </Button>
      </Flex>

      {/* Date Range Title */}
      <Button
        variant="ghost"
        size="icon"
        className="bg-white w-24 h-9 border cursor-pointer"
        onClick={onToday}
      >
        Today
      </Button>

      {/* View Mode Toggle */}
      <Flex className="gap-0 bg-[#F2F3F7] p-1 rounded-lg">
        {["day", "week", "month"].map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode as "day" | "week" | "month")}
            className={`px-6 py-1.5 rounded-lg font-normal transition-colors duration-150
            ${
              viewMode === mode
                ? "bg-white text-[#1797B9] font-semibold"
                : "bg-transparent text-[#323334]/80 hover:text-[#1797B9] hover:bg-white"
            }
          `}
            style={{
              outline: "none",
              border: "none",
              cursor: "pointer",
            }}
            type="button"
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </Flex>
    </Flex>
  );
};
