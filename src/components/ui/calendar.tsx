import type { DayPickerProps } from "react-day-picker";
import { DayPicker, useDayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { format } from "date-fns";
import { type FC } from "react";
import { Flex } from "./flex";
import "../../calendar.css";
import { cn } from "@/lib/utils";

export type CalendarProps = {
  classNameforCustomCalendar?: string;
} & DayPickerProps;

// Nav props now only receives the injected classNameforCustomCalendar
const Nav = ({
  onNextClick,
  onPreviousClick,
  classNameforCustomCalendar,
}: {
  onNextClick?: () => void;
  onPreviousClick?: () => void;
  classNameforCustomCalendar?: string;
}) => {
  const { months } = useDayPicker();
  const year = format(months[0].date, "yyyy");
  const month = format(months[0].date, "LLLL");

  return (
    <Flex className="justify-center gap-6 w-full mb-5">
      <Button
        variant="outline"
        onClick={onPreviousClick}
        size="icon"
        className={cn("size-8", classNameforCustomCalendar)}
      >
        <ChevronLeft />
      </Button>
      <p className="space-x-1">
        <span>{month}</span>
        <span className="text-gray-400 text-xs">{year}</span>
      </p>
      <Button
        variant="outline"
        onClick={onNextClick}
        size="icon"
        className={cn("size-8", classNameforCustomCalendar)}
      >
        <ChevronRight />
      </Button>
    </Flex>
  );
};

const Calendar: FC<CalendarProps> = ({
  classNameforCustomCalendar,
  ...props
}) => {
  // Wrapper to inject the custom class into Nav
  const NavWithClass = (navProps: any) => (
    <Nav
      {...navProps}
      classNameforCustomCalendar={classNameforCustomCalendar}
    />
  );

  return (
    <DayPicker
      showOutsideDays
      components={{ Nav: NavWithClass }}
      classNames={{
        outside: "text-primary/30",
        selected: "text-sm bg-[#1797B9] rounded-lg text-white",
        day: "text-sm",
      }}
      {...props}
    />
  );
};

export { Calendar };
