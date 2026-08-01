import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { CalendarIcon } from "@/components/customeIcons";

export const ViewerCalendarPopOver: React.FC<{
  label?: string;
  selected?: DateRange;
  onChange?: (range: DateRange) => void;
  onApply?: (range: DateRange) => void;
  onReset?: () => void;
}> = ({
  label = "Monthly",
  selected: controlled,
  onChange,
  onApply,
  onReset,
}) => {
  // Local, always-editable selection driving the calendar UI. Seeded from the
  // applied `controlled` range whenever it changes externally (e.g. Reset),
  // but every date pick updates this directly — it must never be shadowed by
  // `controlled`, or the calendar freezes on the first applied range and
  // future picks stop showing (the bug this replaced).
  const [selected, setSelectedState] = useState<DateRange>(
    controlled || { from: addDays(new Date(), -2), to: addDays(new Date(), 2) }
  );

  useEffect(() => {
    if (controlled) setSelectedState(controlled);
  }, [controlled]);

  const setSelected = (r: DateRange) => {
    setSelectedState(r);
    if (onChange) onChange(r);
  };
  const canApply = !!(selected?.from && selected?.to);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border border-border max-md:ms-auto"
        >
          <CalendarIcon className="fill-[#1797B9]" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="max-w-full">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={(r) => r && setSelected(r)}
        />
        <Flex className="mt-3 justify-center gap-2 bg-muted px-3 py-1 rounded-sm text-sm font-medium text-primary">
          <span className="text-muted-foreground">
            {selected?.from ? format(selected.from, "dd LLL") : "--"}
          </span>
          <span className="text-accent-foreground">/</span>
          <span className="text-muted-foreground">
            {selected?.to ? format(selected.to, "dd LLL") : "--"}
          </span>
        </Flex>
        <Flex>
          <Button
            className="flex-1 mt-5"
            variant="outline"
            onClick={() => {
              setSelectedState({ from: undefined, to: undefined });
              if (onReset) onReset();
            }}
          >
            Reset
          </Button>
          <Button
            className="flex-1 mt-5 cursor-pointer"
            disabled={!canApply}
            onClick={() => {
              if (!canApply) return;
              if (onApply) onApply(selected);
            }}
          >
            Apply Filter
          </Button>
        </Flex>
      </PopoverContent>
    </Popover>
  );
};
