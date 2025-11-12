import React from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { cn } from "@/lib/utils";
import { formatHour, CustomEvent, daysShort } from "./calendarUtils";

interface MonthViewProps {
  currentDate: Date;
  monthEvents: CustomEvent[];
  setSelectedEvent: (event: CustomEvent | null) => void;
  setPopupPosition: (position: { top: number; left: number } | null) => void;
  gridContainerRef: React.RefObject<HTMLDivElement>;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  monthEvents,
  setSelectedEvent,
  setPopupPosition,
  gridContainerRef,
}) => {
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(
      <Box
        key={`empty-${i}`}
        className="min-h-[120px] border border-gray-200 bg-gray-50"
      ></Box>
    );
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dayEvents = monthEvents.filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day;
    });

    calendarDays.push(
      <Box
        key={day}
        className={cn(
          "min-h-[120px] border border-gray-200 bg-white p-2 relative",
          currentDay.toDateString() === new Date().toDateString() &&
            "bg-blue-50"
        )}
      >
        <Box
          className={cn(
            "text-sm font-medium mb-1",
            currentDay.toDateString() === new Date().toDateString() &&
              "text-blue-600"
          )}
        >
          {day}
        </Box>
        <Flex className="flex-col gap-1">
          {dayEvents.slice(0, 3).map((event: any, idx: number) => (
            <Box
              key={idx}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate cursor-pointer hover:bg-blue-200"
              onClick={(e) => {
                setSelectedEvent(event);
                // Smart positioning to avoid popup going off-screen
                const gridRect =
                  gridContainerRef.current?.getBoundingClientRect();
                const popupWidth = 300; // Approximate popup width
                const popupHeight = 200; // Approximate popup height

                if (gridRect) {
                  const relativeX = e.clientX - gridRect.left;
                  const relativeY = e.clientY - gridRect.top;
                  const gridWidth = gridRect.width;
                  const gridHeight = gridRect.height;

                  // Calculate smart positioning
                  let left = relativeX + 10;
                  let top = relativeY + 10;

                  // Check if popup would go off the right edge
                  if (left + popupWidth > gridWidth) {
                    // Position popup to the left of the click point
                    left = relativeX - popupWidth - 10;
                  }

                  // Check if popup would go off the bottom edge
                  if (top + popupHeight > gridHeight) {
                    // Position popup above the click point
                    top = relativeY - popupHeight - 10;
                  }

                  // Final safety checks to ensure popup stays within bounds
                  if (left < 0) {
                    left = Math.max(10, gridWidth - popupWidth - 10);
                  }

                  if (top < 0) {
                    top = Math.max(10, gridHeight - popupHeight - 10);
                  }

                  setPopupPosition({ top, left });
                } else {
                  // Fallback positioning - always position to the left for safety
                  setPopupPosition({
                    top: e.clientY + 10,
                    left: e.clientX - popupWidth - 200,
                  });
                }
              }}
            >
              {formatHour(event.startHour)} {event.title}
            </Box>
          ))}
          {dayEvents.length > 3 && (
            <Box className="text-xs text-gray-500">
              +{dayEvents.length - 3} more
            </Box>
          )}
        </Flex>
      </Box>
    );
  }

  return (
    <>
      {/* Date Row */}
      <Box className="grid grid-cols-7 bg-[#F8FAFC] border-b border-[#E5E7EB] mt-6">
        {daysShort.map((day) => (
          <Center
            key={day}
            className="text-center text-sm font-semibold text-[#323334] py-3"
          >
            {day}
          </Center>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box className="grid grid-cols-7 ml-2 rounded-lg">{calendarDays}</Box>
    </>
  );
};
