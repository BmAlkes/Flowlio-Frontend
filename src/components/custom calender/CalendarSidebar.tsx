import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Plus, ChevronDown, Check } from "lucide-react";
import { CustomEvent } from "./calendarUtils";
import { GoogleCalendarIntegration } from "./GoogleCalendarIntegration";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";

const ALL_CALENDAR_TYPES = new Set(["meeting", "education", "personal"]);
const ALL_PLATFORMS = new Set(["google_meet", "whatsapp", "outlook"]);

interface CalendarSidebarProps {
  onNewEvent: () => void;
  miniCalRange: { from?: Date };
  setMiniCalRange: (range: { from?: Date }) => void;
  allMeetings: CustomEvent[];
  navigateToMeetingWeek: (meeting: CustomEvent) => void;
  activeCalendarTypes?: Set<string>;
  activePlatforms?: Set<string>;
  onToggleCalendarType?: (type: string) => void;
  onTogglePlatform?: (platform: string) => void;
}

const CALENDAR_TYPES = [
  { id: "meeting", labelKey: "calendar.meeting", color: "#5B60FE" },
  { id: "education", labelKey: "calendar.education", color: "#FFA632" },
  { id: "personal", labelKey: "calendar.personal", color: "#4DCDC9" },
];

const PLATFORMS = [
  { id: "google_meet", name: "Google Meet", image: GoogleMeetIcon, color: "#92AB74" },
  { id: "whatsapp", name: "WhatsApp", image: WhatsappIcon, color: "#6D7EF3" },
  { id: "outlook", name: "Outlook", image: OutlookIcon, color: "#F39F5A" },
];

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  onNewEvent,
  miniCalRange,
  setMiniCalRange,
  allMeetings,
  navigateToMeetingWeek,
  activeCalendarTypes = ALL_CALENDAR_TYPES,
  activePlatforms = ALL_PLATFORMS,
  onToggleCalendarType,
  onTogglePlatform,
}) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === "es" ? es : enUS;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "google_meet": return GoogleMeetIcon;
      case "whatsapp": return WhatsappIcon;
      case "outlook": return OutlookIcon;
      default: return GoogleMeetIcon;
    }
  };

  const [showMyCalendars, setShowMyCalendars] = useState(true);
  const [showPlatforms, setShowPlatforms] = useState(true);

  return (
    <Flex className="w-[300px] shrink-0 bg-card flex-col gap-1 items-start border-r border-border h-full">
      {/* Mini Calendar */}
      <Stack className="w-full px-3 pt-4 pb-2">
        <Button
          className="w-full bg-[#1797B9] hover:bg-[#1797B9]/80 hover:text-white text-white rounded-full h-9 cursor-pointer text-sm"
          onClick={onNewEvent}
        >
          <Plus className="size-4 text-white" />
          {t("calendar.newEvent")}
        </Button>
        <div className="rdp-sidebar w-full mt-3">
          <Calendar
            className="w-full p-0"
            mode="single"
            selected={miniCalRange.from}
            classNameforCustomCalendar="bg-[#1797B9] text-white size-6"
            onSelect={(date) => setMiniCalRange({ from: date })}
          />
        </div>
      </Stack>

      <div className="w-full h-px bg-border" />

      {/* Google Calendar Integration */}
      <div className="w-full px-1">
        <GoogleCalendarIntegration />
      </div>

      <div className="w-full h-px bg-border" />

      {/* My Calendars */}
      <Stack className="w-full px-3 py-3 gap-2">
        <Flex className="items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("calendar.myCalendars")}
          </span>
          <Flex className="items-center gap-1">
            <button
              onClick={onNewEvent}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="New event"
            >
              <Plus className="size-3.5" />
            </button>
            <button
              onClick={() => setShowMyCalendars(!showMyCalendars)}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${showMyCalendars ? "rotate-180" : ""}`}
              />
            </button>
          </Flex>
        </Flex>

        {showMyCalendars && (
          <Flex className="flex-col gap-0.5">
            {CALENDAR_TYPES.map((cal) => {
              const isActive = activeCalendarTypes.has(cal.id);
              return (
                <button
                  key={cal.id}
                  onClick={() => onToggleCalendarType?.(cal.id)}
                  className={`flex items-center gap-2.5 w-full px-1.5 py-1.5 rounded-md transition-all text-left hover:bg-muted/60 ${
                    isActive ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-sm shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: cal.color }}
                  >
                    {isActive && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-sm text-foreground">
                    {t(cal.labelKey)}
                  </span>
                </button>
              );
            })}
          </Flex>
        )}
      </Stack>

      <div className="w-full h-px bg-border" />

      {/* Platforms */}
      <Stack className="w-full px-3 py-3 gap-2">
        <Flex className="items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("calendar.platforms")}
          </span>
          <button
            onClick={() => setShowPlatforms(!showPlatforms)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground"
          >
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${showPlatforms ? "rotate-180" : ""}`}
            />
          </button>
        </Flex>

        {showPlatforms && (
          <Flex className="flex-col gap-0.5">
            {PLATFORMS.map((platform) => {
              const isActive = activePlatforms.has(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => onTogglePlatform?.(platform.id)}
                  className={`flex items-center gap-2.5 w-full px-1.5 py-1.5 rounded-md transition-all text-left hover:bg-muted/60 ${
                    isActive ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-sm shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: platform.color }}
                  >
                    {isActive && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                  </span>
                  <img src={platform.image} alt={platform.name} className="size-3.5 shrink-0" />
                  <span className="text-sm text-foreground">{platform.name}</span>
                </button>
              );
            })}
          </Flex>
        )}
      </Stack>

      <div className="w-full h-px bg-border" />

      {/* All Events */}
      <Stack className="w-full px-3 py-3 gap-2 flex-1 min-h-0">
        <Flex className="items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("calendar.allEvents")}
          </span>
        </Flex>

        <Flex className="flex-col gap-1 overflow-y-auto max-h-60">
          {allMeetings.length > 0 ? (
            allMeetings.map((meeting: any, index: number) => (
              <button
                key={meeting.id || index}
                className="flex items-center gap-2 w-full px-1.5 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-left"
                onClick={() => navigateToMeetingWeek(meeting)}
              >
                <img
                  src={getPlatformIcon(meeting.platform)}
                  alt={meeting.platform}
                  className="size-3.5 shrink-0"
                />
                <span className="text-sm text-foreground truncate flex-1">
                  {meeting.title}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(meeting.date), "MMM d", { locale: currentLocale })}
                </span>
              </button>
            ))
          ) : (
            <Box className="text-xs text-muted-foreground italic px-1.5">
              {t("calendar.noMeetings")}
            </Box>
          )}
        </Flex>
      </Stack>
    </Flex>
  );
};
