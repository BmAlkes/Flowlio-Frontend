import React, { useEffect, useState } from "react";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatHour,
  platformColors,
  CustomEvent,
  getDaysShort,
} from "./calendarUtils";
import { useTranslation } from "react-i18next";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";

const ROW_HEIGHT = 56; // px per hour slot

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

function PlatformIcon({ platform }: { platform?: string }) {
  if (platform === "google_meet")
    return <img src={GoogleMeetIcon} alt="Google Meet" className="size-3.5 shrink-0" />;
  if (platform === "whatsapp")
    return <img src={WhatsappIcon} alt="WhatsApp" className="size-3.5 shrink-0" />;
  if (platform === "outlook")
    return <img src={OutlookIcon} alt="Outlook" className="size-3.5 shrink-0" />;
  return null;
}

export const WeekView: React.FC<WeekViewProps> = ({
  weekDates,
  weekEvents,
  hours,
  hoveredEventId,
  gridContainerRef,
  setHoveredEventId,
  setHoveredGridTime,
  setSelectedEvent,
  setPopupPosition,
  setEditEvent,
  editEventModalProps,
  hidePopupTimeout,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const daysShort = getDaysShort(currentLanguage);

  const today = new Date();
  const todayDayIdx = weekDates.findIndex(
    (d) => d.toDateString() === today.toDateString()
  );

  // Current time indicator state
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // top offset from grid top: (minutes from midnight - 60) * (ROW_HEIGHT/60)
  // hours[0] = 1, so hour=1 is at top=0
  const nowTopPx = ((nowMinutes - 60) / 60) * ROW_HEIGHT;
  const showNowLine = todayDayIdx !== -1 && nowMinutes >= 60;

  return (
    <>
      {/* Day header row */}
      <div className="grid border-b border-border bg-background" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
        <div /> {/* time gutter */}
        {weekDates.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          const isSunday = d.getDay() === 0;
          return (
            <div key={i} className="flex flex-col items-center py-2 gap-0.5 select-none">
              <span className={cn(
                "text-[10px] uppercase tracking-widest font-medium",
                isSunday ? "text-muted-foreground/50" : "text-muted-foreground"
              )}>
                {daysShort[d.getDay()]}
              </span>
              <span className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors",
                isToday
                  ? "bg-[#1797B9] text-white shadow-sm"
                  : isSunday
                  ? "text-muted-foreground/50"
                  : "text-foreground hover:bg-muted"
              )}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div
        className="relative overflow-hidden"
        ref={gridContainerRef}
        style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
      >
        {/* Now line */}
        {showNowLine && (
          <div
            className="absolute z-20 pointer-events-none flex items-center"
            style={{ top: nowTopPx, left: 64, right: 0 }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
            <div className="flex-1 h-px bg-red-500 opacity-80" />
          </div>
        )}

        <div
          className="grid"
          style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
        >
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div
                className="flex items-start justify-end pr-3 pt-1 bg-background select-none"
                style={{ minHeight: ROW_HEIGHT }}
              >
                <span className="text-[10px] text-muted-foreground/60 font-medium tabular-nums">
                  {formatHour(hour, currentLanguage)}
                </span>
              </div>

              {/* Day columns */}
              {weekDates.map((_, dayIdx) => {
                const event = weekEvents.find(
                  (e: any) =>
                    e.day === dayIdx && hour >= e.startHour && hour < e.endHour
                );
                const isEventStart = event && event.startHour === hour;
                const eventId = event ? `${event.date}-${event.startHour}` : undefined;
                const isToday = dayIdx === todayDayIdx;

                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      "relative border-t border-border/40",
                      dayIdx > 0 && "border-l border-border/40",
                      isToday && "bg-blue-50/20 dark:bg-blue-950/10"
                    )}
                    style={{ minHeight: ROW_HEIGHT, cursor: event ? "pointer" : "default" }}
                    onMouseMove={(e) => {
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      const cellRect = e.currentTarget.getBoundingClientRect();
                      const relativeY = e.clientY - cellRect.top;
                      const minute = Math.floor((relativeY / cellRect.height) * 60);
                      const y = gridRect ? e.clientY - gridRect.top : 0;
                      setHoveredGridTime({ hour, minute, y, visible: true });
                    }}
                    onMouseLeave={() => {
                      setHoveredEventId(null);
                      setHoveredGridTime((prev: any) => ({ ...prev, visible: false }));
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
                      <div
                        className={cn(
                          "absolute inset-x-0.5 top-0.5 rounded-md z-10 p-1.5 cursor-pointer",
                          "border-l-[3px] transition-shadow duration-150",
                          hoveredEventId === eventId && "shadow-md"
                        )}
                        style={{
                          height: `${(event.endHour - event.startHour) * ROW_HEIGHT - 4}px`,
                          background: platformColors[(event.platform as keyof typeof platformColors) ?? "none"].bg,
                          borderLeftColor: platformColors[(event.platform as keyof typeof platformColors) ?? "none"].text,
                          color: platformColors[(event.platform as keyof typeof platformColors) ?? "none"].text,
                        }}
                        onMouseEnter={() => {
                          setSelectedEvent(event);
                          if (hidePopupTimeout.current) {
                            clearTimeout(hidePopupTimeout.current);
                            hidePopupTimeout.current = null;
                          }
                        }}
                        onMouseMove={(e) => {
                          const gridRect = gridContainerRef.current?.getBoundingClientRect();
                          setPopupPosition(
                            gridRect
                              ? { top: e.clientY - gridRect.top + 10, left: e.clientX - gridRect.left + 10 }
                              : { top: e.clientY + 10, left: e.clientX + 10 }
                          );
                        }}
                      >
                        <Flex className="items-center gap-1 mb-0.5">
                          <PlatformIcon platform={event.platform} />
                          <span className="text-xs font-semibold truncate leading-tight">
                            {event.title}
                          </span>
                        </Flex>
                        <span className="text-[10px] opacity-80 leading-tight">
                          {formatHour(event.startHour, currentLanguage)}–{formatHour(event.endHour, currentLanguage)}
                        </span>

                        {hoveredEventId === eventId && (
                          <Button
                            className="absolute top-0.5 right-0.5 w-5 h-5 p-0 bg-transparent border-none rounded"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditEvent(event);
                              editEventModalProps.onOpenChange(true);
                            }}
                            title={t("common.edit")}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
