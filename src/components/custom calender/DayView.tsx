import React, { useEffect, useState } from "react";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHour, platformColors, CustomEvent } from "./calendarUtils";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";

const ROW_HEIGHT = 56;

interface DayViewProps {
  currentDate: Date;
  dayEvents: CustomEvent[];
  hours: number[];
  hoveredEventId: string | null;
  gridContainerRef: React.RefObject<HTMLDivElement>;
  setHoveredEventId: (id: string | null) => void;
  setHoveredGridTime: (time: any) => void;
  setSelectedEvent: (event: CustomEvent | null) => void;
  setPopupPosition: (position: { top: number; left: number } | null) => void;
  setEditEvent: (event: CustomEvent | null) => void;
  editEventModalProps: { onOpenChange: (open: boolean) => void };
  hidePopupTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
}

function PlatformIcon({ platform }: { platform?: string }) {
  if (platform === "google_meet") return <img src={GoogleMeetIcon} alt="Google Meet" className="size-3.5 shrink-0" />;
  if (platform === "whatsapp") return <img src={WhatsappIcon} alt="WhatsApp" className="size-3.5 shrink-0" />;
  if (platform === "outlook") return <img src={OutlookIcon} alt="Outlook" className="size-3.5 shrink-0" />;
  return null;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  dayEvents,
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
  const currentLocale = currentLanguage === "es" ? es : enUS;

  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();
  const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

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

  const nowTopPx = ((nowMinutes - 60) / 60) * ROW_HEIGHT;
  const showNowLine = isToday && nowMinutes >= 60;

  return (
    <>
      {/* Day header */}
      <div className="grid border-b border-border bg-background" style={{ gridTemplateColumns: "64px 1fr" }}>
        <div />
        <div className="flex flex-col items-center py-2 gap-0.5 select-none">
          <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">
            {format(currentDate, "EEE", { locale: currentLocale })}
          </span>
          <span
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold",
              isToday
                ? "bg-[#1797B9] text-white shadow-sm"
                : isWeekend
                ? "text-muted-foreground/60"
                : "text-foreground"
            )}
          >
            {currentDate.getDate()}
          </span>
        </div>
      </div>

      {/* Time grid */}
      <div className="relative" ref={gridContainerRef}>
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

        <div className="grid" style={{ gridTemplateColumns: "64px 1fr" }}>
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

              {/* Day column */}
              <div
                className={cn(
                  "relative border-t border-l border-border/40",
                  isToday
                    ? "bg-blue-50/30 dark:bg-blue-950/10"
                    : isWeekend
                    ? "bg-muted/30 dark:bg-muted/10"
                    : "bg-card"
                )}
                style={{ minHeight: ROW_HEIGHT }}
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
              >
                {dayEvents
                  .filter((e) => hour >= e.startHour && hour < e.endHour)
                  .map((event, idx) => {
                    if (event.startHour !== hour) return null;
                    const eventId = `${event.date}-${event.startHour}-${idx}`;
                    const colors = platformColors[(event.platform as keyof typeof platformColors) ?? "none"];

                    return (
                      <div
                        key={eventId}
                        className={cn(
                          "absolute inset-x-0.5 top-0.5 rounded-md z-10 p-1.5 cursor-pointer border-l-[3px] transition-shadow duration-150",
                          hoveredEventId === eventId && "shadow-md"
                        )}
                        style={{
                          height: `${(event.endHour - event.startHour) * ROW_HEIGHT - 4}px`,
                          background: colors.bg,
                          borderLeftColor: colors.text,
                          color: colors.text,
                        }}
                        onMouseEnter={() => {
                          setHoveredEventId(eventId);
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
                          <span className="text-xs font-semibold truncate">{event.title}</span>
                        </Flex>
                        <span className="text-[10px] opacity-80">
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
                    );
                  })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
