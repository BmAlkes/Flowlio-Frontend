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
import { useState } from "react";
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
  const [uncontrolled, setUncontrolled] = useState<DateRange>({
    from: addDays(new Date(), -2),
    to: addDays(new Date(), 2),
  });
  const selected = controlled || uncontrolled;
  const setSelected = (r: DateRange) => {
    if (onChange) onChange(r);
    else setUncontrolled(r);
  };
  const canApply = !!(selected?.from && selected?.to);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border border-gray-100 max-md:ml-auto"
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
              if (!controlled)
                setUncontrolled({ from: undefined, to: undefined });
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
