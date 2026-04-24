import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Center } from "@/components/ui/center";
import { Plus, ChevronDown } from "lucide-react";
import { CustomEvent } from "./calendarUtils";
import { GoogleCalendarIntegration } from "./GoogleCalendarIntegration";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";
import WhatsAppCheckBoxIcon from "/dashboard/whatsappcheckbox.svg";
import EducationCheckBoxIcon from "/dashboard/educationcheckbox.svg";
import PersolCheckBoxIcon from "/dashboard/personalicon.svg";
import CheckBox from "/dashboard/checkbox.svg";

interface CalendarSidebarProps {
  onNewEvent: () => void;
  miniCalRange: { from?: Date };
  setMiniCalRange: (range: { from?: Date }) => void;
  allMeetings: CustomEvent[];
  navigateToMeetingWeek: (meeting: CustomEvent) => void;
}

const MyCalendars = [
  { name: "Meeting", image: WhatsAppCheckBoxIcon },
  { name: "Education", image: EducationCheckBoxIcon },
  { name: "Personal", image: PersolCheckBoxIcon },
];

const platformsImages = [
  { name: "Google Meet", image: GoogleMeetIcon, checkbox: CheckBox },
  { name: "WhatsApp", image: WhatsappIcon, checkbox: CheckBox },
  { name: "Outlook", image: OutlookIcon, checkbox: CheckBox },
];

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  onNewEvent,
  miniCalRange,
  setMiniCalRange,
  allMeetings,
  navigateToMeetingWeek,
}) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === "es" ? es : enUS;
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "google_meet":
        return GoogleMeetIcon;
      case "whatsapp":
        return WhatsappIcon;
      case "outlook":
        return OutlookIcon;
      default:
        return GoogleMeetIcon;
    }
  };
  const [showMyCalendars, setShowMyCalendars] = useState(true);
  const [showPlatforms, setShowPlatforms] = useState(true);

  return (
    <Flex className="w-[290px] bg-card flex-col gap-6 items-start h-[127rem]">
      {/* Mini Calendar */}
      <Stack className="w-full p-3">
        <Button
          className="w-full bg-[#1797B9] hover:bg-[#1797B9]/80 hover:text-white text-white rounded-full h-11 cursor-pointer"
          size="lg"
          onClick={onNewEvent}
        >
          {t("calendar.newEvent")} <Plus className="size-5 text-white" />
        </Button>
        <Calendar
          className="w-full p-0 overflow-hidden mt-4"
          mode="single"
          selected={miniCalRange.from}
          classNameforCustomCalendar="bg-[#1797B9] text-white size-6"
          onSelect={(date) => setMiniCalRange({ from: date })}
        />
      </Stack>

      {/* Google Calendar Integration */}
      <GoogleCalendarIntegration />

      {/* My Calendars */}
      <Stack className="w-full p-3">
        <Flex className="items-center justify-between">
          <span className="font-semibold">{t("calendar.myCalendars")}</span>
          <Flex className="items-center gap-2">
            <Plus className="size-4 cursor-pointer text-muted-foreground" />
            <ChevronDown
              className={`size-4 cursor-pointer text-muted-foreground transition-transform duration-300 ${
                showMyCalendars ? "rotate-180" : ""
              }`}
              onClick={() => setShowMyCalendars(!showMyCalendars)}
            />
          </Flex>
        </Flex>
        <Flex className="flex-col items-start gap-2">
          {showMyCalendars
            ? MyCalendars.map((calendar, index) => (
                <Center key={index} className="gap-4 cursor-pointer">
                  <img
                    src={calendar.image}
                    alt={calendar.name}
                    className="size-4"
                  />
                  <span className="text-sm font-normal">
                    {t(`calendar.${calendar.name.toLowerCase()}`)}
                  </span>
                </Center>
              ))
            : null}
        </Flex>
      </Stack>

      {/* Platforms */}
      <Stack className="w-full p-3">
        <Flex className="items-center justify-between">
          <Box className="font-semibold mb-4">{t("calendar.platforms")}</Box>
          <Flex className="items-center">
            <Plus className="size-4 cursor-pointer text-muted-foreground" />
            <ChevronDown
              className={`size-4 cursor-pointer text-muted-foreground transition-transform duration-300 ${
                showPlatforms ? "rotate-180" : ""
              }`}
              onClick={() => setShowPlatforms(!showPlatforms)}
            />
          </Flex>
        </Flex>
        <Flex className="flex-col gap-4 items-start">
          {showPlatforms
            ? platformsImages.map((platform, index) => (
                <Center key={index} className="gap-4 cursor-pointer">
                  <img
                    src={platform.checkbox}
                    alt="CheckBox"
                    className="size-4"
                  />
                  <img
                    src={platform.image}
                    alt={platform.name}
                    className="size-4"
                  />
                </Center>
              ))
            : null}
        </Flex>
      </Stack>

      {/* All Events */}
      <Stack className="w-full p-3">
        <Flex className="items-center justify-between">
          <Box className="font-semibold mb-4">{t("calendar.allEvents")}</Box>
          <Flex className="items-center">
            <ChevronDown className="size-4 cursor-pointer text-muted-foreground" />
          </Flex>
        </Flex>
        <Flex className="flex-col gap-2 items-start max-h-80 overflow-y-auto">
          {allMeetings.length > 0 ? (
            allMeetings.map((meeting: any, index: number) => (
              <Center
                key={meeting.id || index}
                className="gap-3 cursor-pointer hover:bg-muted/50 p-1 rounded-md w-full transition-colors justify-between"
                onClick={() => navigateToMeetingWeek(meeting)}
              >
                <Flex>
                  <img
                    src={getPlatformIcon(meeting.platform)}
                    alt={meeting.platform}
                    className="size-4"
                  />
                  <span className="text-sm font-medium truncate w-full">
                    {meeting.title}
                  </span>
                </Flex>
                <Flex className="items-center min-w-0">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(meeting.date), "MMM d", {
                      locale: currentLocale,
                    })}
                  </span>
                </Flex>
              </Center>
            ))
          ) : (
            <Box className="text-sm text-muted-foreground italic">
              {t("calendar.noMeetings")}
            </Box>
          )}
        </Flex>
      </Stack>
    </Flex>
  );
};
