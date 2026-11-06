import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { CalendarArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { addDays, format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CalendarPopOverProps {
  onDateRangeChange?: (dateRange: { from: Date; to: Date } | null) => void;
  initialDateRange?: { from: Date; to: Date };
  // Shown on the button instead of the dates, e.g. when no period is applied
  label?: string;
}

export const CalendarPopOver = ({
  onDateRangeChange,
  initialDateRange,
  label,
}: CalendarPopOverProps) => {
  const { i18n } = useTranslation();
  const [selected, onSelect] = useState<DateRange>(
    initialDateRange || {
      from: addDays(new Date(), -30), // Default to last 30 days
      to: new Date(),
    }
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilter = () => {
    if (selected.from && selected.to) {
      onDateRangeChange?.({
        from: selected.from,
        to: selected.to,
      });
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultRange = {
      from: addDays(new Date(), -30),
      to: new Date(),
    };
    onSelect(defaultRange);
    onDateRangeChange?.(defaultRange);
    setIsOpen(false);
  };

  const getDateRangeText = () => {
    if (label) return label;
    if (selected.from && selected.to) {
      const day = (date: Date) => date.toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
      return `${day(selected.from)} – ${day(selected.to)}`;
    }
    return "Select Range";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border border-border max-md:ms-auto"
        >
          <CalendarArrowDown className="text-[#1797B9]" />
          {getDateRangeText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="max-w-full">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={(r) => r && onSelect(r)}
        />
        <Flex className="mt-3 justify-center gap-2 bg-muted px-3 py-1 rounded-sm text-sm font-medium text-primary">
          <span className="text-muted-foreground">
            {selected.from ? format(selected.from, "dd LLL") : "Start"}
          </span>
          <span className="text-accent-foreground">/</span>
          <span className="text-muted-foreground">
            {selected.to ? format(selected.to, "dd LLL") : "End"}
          </span>
        </Flex>
        <Flex>
          <Button
            className="flex-1 mt-5"
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            className="flex-1 mt-5"
            onClick={handleApplyFilter}
            disabled={!selected.from || !selected.to}
          >
            Apply Filter
          </Button>
        </Flex>
      </PopoverContent>
    </Popover>
  );
};
