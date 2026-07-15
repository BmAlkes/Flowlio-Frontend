import React from "react";
import { cn } from "@/lib/utils";
import { formatHour, CustomEvent, getDaysShort, platformColors } from "./calendarUtils";
import { useTranslation } from "react-i18next";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";

interface MonthViewProps {
  currentDate: Date;
  monthEvents: CustomEvent[];
  setSelectedEvent: (event: CustomEvent | null) => void;
  setPopupPosition: (position: { top: number; left: number } | null) => void;
  gridContainerRef: React.RefObject<HTMLDivElement>;
}

function PlatformIcon({ platform }: { platform?: string }) {
  if (platform === "google_meet") return <img src={GoogleMeetIcon} alt="" className="size-3 shrink-0" />;
  if (platform === "whatsapp") return <img src={WhatsappIcon} alt="" className="size-3 shrink-0" />;
  if (platform === "outlook") return <img src={OutlookIcon} alt="" className="size-3 shrink-0" />;
  return null;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  monthEvents,
  setSelectedEvent,
  setPopupPosition,
  gridContainerRef,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const daysShort = getDaysShort(currentLanguage);

  const today = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: React.ReactNode[] = [];

  // Empty cells before first day
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="min-h-[110px] bg-muted/20 border-b border-e border-border/40" />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isToday = cellDate.toDateString() === today.toDateString();
    const isSunday = cellDate.getDay() === 0;

    const dayEvents = monthEvents.filter((e: any) => {
      const ed = new Date(e.date);
      return ed.getDate() === day;
    });

    calendarDays.push(
      <div
        key={day}
        className={cn(
          "min-h-[110px] border-b border-e border-border/40 p-1.5 relative",
          isToday
            ? "bg-blue-50/30 dark:bg-blue-950/10"
            : isSunday || cellDate.getDay() === 6
            ? "bg-muted/30 dark:bg-muted/10"
            : "bg-card"
        )}
      >
        {/* Day number */}
        <div className="flex justify-end mb-1">
          <span
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold select-none",
              isToday
                ? "bg-[#1797B9] text-white shadow-sm"
                : isSunday
                ? "text-muted-foreground/90"
                : "text-foreground"
            )}
          >
            {day}
          </span>
        </div>

        {/* Events */}
        <div className="flex flex-col gap-0.5">
          {dayEvents.slice(0, 3).map((event: any, idx: number) => {
            const colors = platformColors[(event.platform as keyof typeof platformColors) ?? "none"];
            return (
              <button
                key={idx}
                className="flex items-center gap-1 w-full text-start px-1.5 py-0.5 rounded text-xs font-medium truncate border-s-2 transition-opacity hover:opacity-80"
                style={{
                  background: colors.bg,
                  color: colors.text,
                  borderInlineStartColor: colors.text,
                }}
                title={`${formatHour(event.startHour, currentLanguage)} ${event.title}`}
                onClick={(e) => {
                  setSelectedEvent(event);
                  const gridRect = gridContainerRef.current?.getBoundingClientRect();
                  if (gridRect) {
                    const popupWidth = 300;
                    const popupHeight = 200;
                    let left = e.clientX - gridRect.left + 10;
                    let top = e.clientY - gridRect.top + 10;
                    if (left + popupWidth > gridRect.width) left = e.clientX - gridRect.left - popupWidth - 10;
                    if (top + popupHeight > gridRect.height) top = e.clientY - gridRect.top - popupHeight - 10;
                    if (left < 0) left = 10;
                    if (top < 0) top = 10;
                    setPopupPosition({ top, left });
                  } else {
                    setPopupPosition({ top: e.clientY + 10, left: e.clientX - 310 });
                  }
                }}
              >
                <PlatformIcon platform={event.platform} />
                <span className="truncate flex-1">{event.title}</span>
                <span className="shrink-0 opacity-90 hidden sm:inline">{formatHour(event.startHour, currentLanguage)}</span>
              </button>
            );
          })}
          {dayEvents.length > 3 && (
            <span className="text-xs text-muted-foreground px-1.5">
              +{dayEvents.length - 3} {t("calendar.more")}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Day header row */}
      <div className="grid grid-cols-7 border-b border-border bg-background">
        {daysShort.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center py-2 text-xs uppercase tracking-widest font-medium select-none",
              i === 0 ? "text-muted-foreground/90" : "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 border-t border-s border-border/40"
        ref={gridContainerRef}
      >
        {calendarDays}
      </div>
    </>
  );
};
