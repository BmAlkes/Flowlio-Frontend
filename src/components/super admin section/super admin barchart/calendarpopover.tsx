import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { format, startOfYear, endOfYear } from "date-fns";
import { useState } from "react";
import { CalendarIcon } from "@/components/customeIcons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SuperAdminCalendarPopOverProps {
  selectedYear?: number;
  onYearChange?: (year: number) => void;
}

export const SuperAdminCalendarPopOver = ({
  selectedYear = new Date().getFullYear(), // This will be 2024
  onYearChange,
}: SuperAdminCalendarPopOverProps) => {
  const [selected, onSelect] = useState<DateRange>({
    from: startOfYear(new Date(selectedYear, 0, 1)),
    to: endOfYear(new Date(selectedYear, 11, 31)),
  });

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    onYearChange?.(yearNum);

    // Update the date range to match the selected year
    onSelect({
      from: startOfYear(new Date(yearNum, 0, 1)),
      to: endOfYear(new Date(yearNum, 11, 31)),
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border border-gray-100 max-md:ml-auto"
        >
          <CalendarIcon className="fill-[#1797B9]" />
          {selectedYear}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="max-w-full w-78">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Year
            </label>
            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="range"
            selected={selected}
            onSelect={(r) => r && onSelect(r)}
            defaultMonth={selected.from}
          />

          <Flex className="mt-3 justify-center gap-2 bg-muted px-3 py-1 rounded-sm text-sm font-medium text-primary">
            <span className="text-muted-foreground">
              {format(selected.from!, "dd LLL yyyy")}
            </span>
            <span className="text-accent-foreground">/</span>
            <span className="text-muted-foreground">
              {format(selected.to!, "dd LLL yyyy")}
            </span>
          </Flex>

          <Flex>
            <Button
              className="flex-1 mt-5"
              variant="outline"
              onClick={() => {
                const currentYear = new Date().getFullYear();
                onYearChange?.(currentYear);
                onSelect({
                  from: startOfYear(new Date(currentYear, 0, 1)),
                  to: endOfYear(new Date(currentYear, 11, 31)),
                });
              }}
            >
              Reset
            </Button>
            <Button className="flex-1 mt-5">Apply Filter</Button>
          </Flex>
        </div>
      </PopoverContent>
    </Popover>
  );
};
