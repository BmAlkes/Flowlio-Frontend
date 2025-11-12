import React from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatHour,
  platformColors,
  CustomEvent,
  daysShort,
} from "./calendarUtils";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";

interface WeekViewProps {
  weekDates: Date[];
  weekEvents: CustomEvent[];
  hours: number[];
  hoveredEventId: string | null;
  hoveredGridTime: {
    hour: number;
    minute: number;
    y: number;
    visible: boolean;
  };
  gridContainerRef: React.RefObject<HTMLDivElement>;
  setHoveredEventId: (id: string | null) => void;
  setHoveredGridTime: (time: any) => void;
  setSelectedEvent: (event: CustomEvent | null) => void;
  setPopupPosition: (position: { top: number; left: number } | null) => void;
  setEditEvent: (event: CustomEvent | null) => void;
  editEventModalProps: {
    onOpenChange: (open: boolean) => void;
  };
  hidePopupTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const WeekView: React.FC<WeekViewProps> = ({
  weekDates,
  weekEvents,
  hours,
  hoveredEventId,
  //   hoveredGridTime,
  gridContainerRef,
  setHoveredEventId,
  setHoveredGridTime,
  setSelectedEvent,
  setPopupPosition,
  setEditEvent,
  editEventModalProps,
  hidePopupTimeout,
}) => {
  return (
    <>
      {/* Date Row */}
      <Box className="grid grid-cols-[80px_repeat(7,1fr)] bg-[#F8FAFC] border-b border-[#E5E7EB] mt-6">
        <Box></Box>
        {weekDates.map((d, i) => (
          <Center
            key={i}
            className={cn(
              "gap-1 text-center text-sm font-normal text-[#323334] rounded-lg w-17 h-8 m-auto mb-3",
              d.toDateString() === new Date().toDateString() &&
                "text-white bg-[#1797B9]",
              d.getDay() === 0 && "bg-[#FFE5E5] text-[#D32F2F]"
            )}
            style={{
              padding: "12px 0 8px 0",
            }}
          >
            <Box>{daysShort[d.getDay()]}</Box>
            <Box>{d.getDate()}</Box>
          </Center>
        ))}
      </Box>

      {/* Time grid */}
      <Box
        className="grid grid-cols-[80px_repeat(7,1fr)] ml-2 rounded-lg"
        style={{ position: "relative" }}
        ref={gridContainerRef}
      >
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <Box className="text-center p-0 bg-white font-normal text-[#888] text-sm flex items-start justify-center">
              {formatHour(hour)}
            </Box>
            {weekDates.map((_, dayIdx) => {
              const event = weekEvents.find(
                (e: any) =>
                  e.day === dayIdx && hour >= e.startHour && hour < e.endHour
              );
              const isEventStart = event && event.startHour === hour;
              const eventId = event
                ? `${event.date}-${event.startHour}`
                : undefined;

              return (
                <Box
                  className="text-center p-0 border border-gray-200 min-h-[79px] min-w-[86px] relative bg-white"
                  key={dayIdx}
                  style={{
                    border: "0.5px solid #eee",
                    cursor: event ? "pointer" : "default",
                  }}
                  onMouseMove={(e) => {
                    const gridRect =
                      gridContainerRef.current?.getBoundingClientRect();
                    const cellRect = e.currentTarget.getBoundingClientRect();
                    const relativeY = e.clientY - cellRect.top;
                    const minute = Math.floor(
                      (relativeY / cellRect.height) * 60
                    );
                    let y = 0;
                    if (gridRect) {
                      y = e.clientY - gridRect.top;
                    }
                    setHoveredGridTime({
                      hour,
                      minute,
                      y,
                      visible: true,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredEventId(null);
                    setHoveredGridTime((prev: any) => ({
                      ...prev,
                      visible: false,
                    }));
                    hidePopupTimeout.current = setTimeout(() => {
                      setSelectedEvent(null);
                      setPopupPosition(null);
                    }, 100);
                  }}
                  onMouseEnter={() => {
                    if (eventId) setHoveredEventId(eventId);
                    if (hidePopupTimeout.current) {
                      clearTimeout(hidePopupTimeout.current);
                      hidePopupTimeout.current = null;
                    }
                  }}
                >
                  {event && isEventStart && (
                    <Flex
                      className={cn(
                        "absolute top-0.5 left-0.5 gap-0 bottom-0.5 right-0.5 rounded-md items-start flex-col z-[2] p-2 cursor-pointer border border-[#b2ebf2] transition-all duration-300"
                      )}
                      style={{
                        height: `${
                          (event.endHour - event.startHour) * 80 - 10
                        }px`,
                        background:
                          platformColors[
                            (event.platform as keyof typeof platformColors) ||
                              "none"
                          ].bg,
                        color:
                          platformColors[
                            (event.platform as keyof typeof platformColors) ||
                              "none"
                          ].text,
                        boxShadow:
                          hoveredEventId === eventId
                            ? "0 4px 16px rgba(23,151,185,0.12)"
                            : undefined,
                      }}
                      onMouseEnter={() => {
                        setSelectedEvent(event);
                        if (hidePopupTimeout.current) {
                          clearTimeout(hidePopupTimeout.current);
                          hidePopupTimeout.current = null;
                        }
                      }}
                      onMouseMove={(e) => {
                        const gridRect =
                          gridContainerRef.current?.getBoundingClientRect();
                        if (gridRect) {
                          setPopupPosition({
                            top: e.clientY - gridRect.top + 10,
                            left: e.clientX - gridRect.left + 10,
                          });
                        } else {
                          setPopupPosition({
                            top: e.clientY + 10,
                            left: e.clientX + 10,
                          });
                        }
                      }}
                    >
                      {/* Platform icon */}
                      <Flex className="items-start text-start gap-0 w-full flex-col">
                        {event.platform === "google_meet" ? (
                          <img
                            src={GoogleMeetIcon}
                            alt="Google Meet"
                            className="size-5"
                          />
                        ) : event.platform === "whatsapp" ? (
                          <img
                            src={WhatsappIcon}
                            alt="WhatsApp"
                            className="size-5"
                          />
                        ) : (
                          <img
                            src={OutlookIcon}
                            alt="Outlook"
                            className="size-5"
                          />
                        )}

                        {/* Event title */}
                        <Box className="text-sm font-medium w-full capitalize">
                          {event.title.length > 7
                            ? event.title.slice(0, 7) + "..."
                            : event.title}
                        </Box>
                      </Flex>

                      {/* Event time */}
                      <span className={cn("text-xs text-black/80")}>
                        {formatHour(event.startHour)} -{" "}
                        {formatHour(event.endHour)}
                      </span>

                      {/* Edit icon on hover */}
                      {hoveredEventId === eventId && (
                        <Button
                          className="absolute top-0 right-0 bg-transparent border-none rounded-full p-4 cursor-pointer z-30"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditEvent(event);
                            editEventModalProps.onOpenChange(true);
                          }}
                          title="Edit"
                        >
                          <Pencil />
                        </Button>
                      )}
                    </Flex>
                  )}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </>
  );
};
