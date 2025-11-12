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

interface CalendarPopOverProps {
  onDateRangeChange?: (dateRange: { from: Date; to: Date } | null) => void;
  initialDateRange?: { from: Date; to: Date };
}

export const CalendarPopOver = ({
  onDateRangeChange,
  initialDateRange,
}: CalendarPopOverProps) => {
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
    if (selected.from && selected.to) {
      const fromStr = format(selected.from, "MMM dd");
      const toStr = format(selected.to, "MMM dd");
      return `${fromStr} - ${toStr}`;
    }
    return "Select Range";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border border-gray-100 max-md:ml-auto"
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
