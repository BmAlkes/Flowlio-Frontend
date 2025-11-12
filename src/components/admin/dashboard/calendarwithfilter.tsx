import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Calendar } from "@/components/ui/calendar";
import type { BoxProps } from "@/components/ui/box";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { addDays, format } from "date-fns";
import { useState, type FC } from "react";

export const CalendarWithFilter: FC<BoxProps> = ({ className, ...props }) => {
  const [selected, onSelect] = useState<DateRange>({
    from: addDays(new Date(), -2),
    to: addDays(new Date(), 2),
  });

  return (
    <ComponentWrapper className={className} {...props}>
      <Calendar
        mode="range"
        selected={selected}
        onSelect={(r) => r && onSelect(r)}
      />
      <Flex className="mt-3 justify-center gap-2 bg-muted px-3 py-1 rounded-sm text-sm font-medium text-primary">
        <span className="text-muted-foreground">
          {format(selected.from!, "dd LLL")}
        </span>
        <span className="text-accent-foreground">/</span>
        <span className="text-muted-foreground">
          {format(selected.to!, "dd LLL")}
        </span>
      </Flex>
      <Flex>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onSelect({ from: new Date(), to: new Date() })}
                className="flex-1 mt-5 cursor-pointer"
                variant="outline"
              >
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent className="mb-2">
              <p>Reset Dates</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="flex-1 mt-5">Apply</Button>
            </TooltipTrigger>
            <TooltipContent className="mb-2">
              <p>Apply Selected Dates</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Flex>
    </ComponentWrapper>
  );
};
