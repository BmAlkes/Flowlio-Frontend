import React from "react";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Flex } from "../ui/flex";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

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
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === "es" ? es : enUS;

  const formatDate = (date: Date, formatStr: string) => {
    return format(date, formatStr, { locale: currentLocale });
  };
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
            ? formatDate(currentWeek, "EEEE, MMMM d, yyyy")
            : viewMode === "week"
            ? `${formatDate(weekDates[0], "MMM d")} - ${formatDate(
                weekDates[6],
                "MMM d, yyyy"
              )}`
            : formatDate(currentWeek, "MMMM yyyy")}
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
        className="bg-card w-24 h-9 border cursor-pointer"
        onClick={onToday}
      >
        {t("calendar.today")}
      </Button>

      {/* View Mode Toggle */}
      <Flex className="gap-0 bg-secondary p-1 rounded-lg">
        {["day", "week", "month"].map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode as "day" | "week" | "month")}
            className={`px-6 py-1.5 rounded-lg font-normal transition-colors duration-150
            ${
              viewMode === mode
                ? "bg-background text-primary font-semibold shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-primary hover:bg-card"
            }
          `}
            style={{
              outline: "none",
              border: "none",
              cursor: "pointer",
            }}
            type="button"
          >
            {t(`calendar.${mode}`)}
          </button>
        ))}
      </Flex>
    </Flex>
  );
};
