import { useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { EventModal } from "./calendareventmodal";
import { useGeneralModalDisclosure } from "../common/generalmodal";
import { getStartOfWeek, getWeekDates, CustomEvent } from "./calendarUtils";
import {
  useFetchCalendarEvents,
  CalendarEvent,
} from "@/hooks/usefetchcalendarevents";
import { useCreateCalendarEvent } from "@/hooks/usecreatecalendarevent";
import { useUpdateCalendarEvent } from "@/hooks/useupdatecalendarevent";
import { useDeleteCalendarEvent } from "@/hooks/usedeletecalendarevent";
import { EventDetailsPopup } from "./eventdetailspopup";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarSidebar } from "./CalendarSidebar";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { useTimezone } from "@/hooks/useTimezone";

const hours = Array.from({ length: 24 }, (_, i) => i + 1); // 1-24 (24 hours) to match Google Calendar

export const CustomCalendarHeader = () => {
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));

  // Timezone hook - automatically detects and updates user timezone
  useTimezone();

  // API hooks
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  // Calculate date range for the current week
  const startOfWeek = getStartOfWeek(currentWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Fetch events for the current week
  const { data: eventsResponse } = useFetchCalendarEvents({
    startDate: startOfWeek.toISOString(),
    endDate: endOfWeek.toISOString(),
  });

  const apiEvents = eventsResponse?.data || [];

  // Transform API events to UI format
  const events = apiEvents.map((event: CalendarEvent) => {
    // Parse the date string and create a proper Date object
    const eventDate = new Date(event.date);

    // Get the start of the week for this event date
    const weekStart = getStartOfWeek(eventDate);

    // Convert to ISO string for comparison
    const weekStartISO = weekStart.toISOString();

    return {
      ...event,
      day: eventDate.getDay(),
      weekStart: weekStartISO,
      calendarType:
        event.calendarType === "work" ? "education" : event.calendarType,
    };
  });
  const [miniCalRange, setMiniCalRange] = useState<{ from?: Date }>({});
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<CustomEvent | null>(null);

  // Floating time indicator state
  const [hoveredGridTime, setHoveredGridTime] = useState<{
    hour: number;
    minute: number;
    y: number;
    visible: boolean;
  }>({ hour: 0, minute: 0, y: 0, visible: false });

  // Add a ref to store the timeout for hiding the popup
  const hidePopupTimeout = useRef<NodeJS.Timeout | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Separate modal props for new and edit modals
  const newEventModalProps = useGeneralModalDisclosure();
  const editEventModalProps = useGeneralModalDisclosure();
  const weekDates = getWeekDates(currentWeek);

  // Navigation handlers
  const goToToday = () => {
    if (viewMode === "day") {
      setCurrentWeek(new Date());
    } else {
      setCurrentWeek(getStartOfWeek(new Date()));
    }
  };

  const goToPrev = () => {
    const prev = new Date(currentWeek);
    if (viewMode === "day") {
      prev.setDate(prev.getDate() - 1);
    } else if (viewMode === "week") {
      prev.setDate(prev.getDate() - 7);
    } else if (viewMode === "month") {
      prev.setMonth(prev.getMonth() - 1);
    }
    setCurrentWeek(prev);
  };

  const goToNext = () => {
    const next = new Date(currentWeek);
    if (viewMode === "day") {
      next.setDate(next.getDate() + 1);
    } else if (viewMode === "week") {
      next.setDate(next.getDate() + 7);
    } else if (viewMode === "month") {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentWeek(next);
  };
  // Filter events based on view mode
  const weekKey = getStartOfWeek(currentWeek).toISOString();
  const weekEvents = events.filter((e: any) => e.weekStart === weekKey);

  // Day view events
  const dayEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    const currentDate = new Date(currentWeek);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  // Month view events
  const monthEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    const currentDate = new Date(currentWeek);
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Get all meetings (events with platform other than "none")
  const allMeetings = events.filter((event: any) => event.platform !== "none");

  // Function to navigate to a meeting's week
  const navigateToMeetingWeek = (meeting: any) => {
    const meetingDate = new Date(meeting.date);
    setCurrentWeek(getStartOfWeek(meetingDate));
  };

  return (
    <>
      <Box className="mt-6 rounded-lg border border-gray-200">
        <Flex className="rounded-lg items-start overflow-hidden max-md:overflow-x-scroll gap-0">
          {/* Sidebar */}
          <CalendarSidebar
            onNewEvent={() => {
              setEditEvent(null);
              newEventModalProps.onOpenChange(true);
            }}
            miniCalRange={miniCalRange}
            setMiniCalRange={setMiniCalRange}
            allMeetings={allMeetings}
            navigateToMeetingWeek={navigateToMeetingWeek}
          />

          {/* Main Calendar Area */}
          <Box className="flex-1 bg-[#F8FAFC]" style={{ flex: 1 }}>
            {/* Calendar Header */}
            <CalendarHeader
              viewMode={viewMode}
              currentWeek={currentWeek}
              weekDates={weekDates}
              onPrev={goToPrev}
              onNext={goToNext}
              onToday={goToToday}
              onViewModeChange={setViewMode}
            />

            {/* Calendar Views */}
            {viewMode === "day" ? (
              <DayView
                currentDate={currentWeek}
                dayEvents={dayEvents}
                hours={hours}
                hoveredEventId={hoveredEventId}
                gridContainerRef={gridContainerRef}
                setHoveredEventId={setHoveredEventId}
                setHoveredGridTime={setHoveredGridTime}
                setSelectedEvent={setSelectedEvent}
                setPopupPosition={setPopupPosition}
                setEditEvent={setEditEvent}
                editEventModalProps={editEventModalProps}
                hidePopupTimeout={hidePopupTimeout}
              />
            ) : viewMode === "week" ? (
              <WeekView
                weekDates={weekDates}
                weekEvents={weekEvents}
                hours={hours}
                hoveredEventId={hoveredEventId}
                hoveredGridTime={hoveredGridTime}
                gridContainerRef={gridContainerRef}
                setHoveredEventId={setHoveredEventId}
                setHoveredGridTime={setHoveredGridTime}
                setSelectedEvent={setSelectedEvent}
                setPopupPosition={setPopupPosition}
                setEditEvent={setEditEvent}
                editEventModalProps={editEventModalProps}
                hidePopupTimeout={hidePopupTimeout}
              />
            ) : (
              <MonthView
                currentDate={currentWeek}
                monthEvents={monthEvents}
                setSelectedEvent={setSelectedEvent}
                setPopupPosition={setPopupPosition}
                gridContainerRef={gridContainerRef}
              />
            )}

            {/* Horizontal line indicator */}
            {hoveredGridTime.visible && viewMode !== "month" && (
              <Box
                className="absolute h-0.5 bg-[#90d7eb] z-[998] pointer-events-none"
                style={{
                  top: hoveredGridTime.y + 235,
                  left: +305, // Start after the time column
                  right: 10, // Extend to the end of the calendar
                }}
              />
            )}

            {/* Floating time indicator */}
            {hoveredGridTime.visible && viewMode !== "month" && (
              <Box
                className="absolute w-20 bg-[#1797B9] text-white p-2 rounded-sm font-normal text-sm z-[999] shadow-md text-right pointer-events-none"
                style={{
                  top: hoveredGridTime.y + 218, // Center vertically with the line
                  left: +305, // Align with the left edge
                }}
              >
                {`${hoveredGridTime.hour
                  .toString()
                  .padStart(2, "0")}:${hoveredGridTime.minute
                  .toString()
                  .padStart(2, "0")}`}
              </Box>
            )}
          </Box>
        </Flex>
      </Box>

      {/* New Event Modal */}
      <EventModal
        modalProps={newEventModalProps}
        onSave={(newEvent: CustomEvent) => {
          createEventMutation.mutate({
            title: newEvent.title,
            description: newEvent.description,
            date: newEvent.date,
            startHour: newEvent.startHour,
            endHour: newEvent.endHour,
            calendarType: newEvent.calendarType as
              | "education"
              | "personal"
              | "meeting",
            platform:
              newEvent.platform === "google_meet"
                ? "google_meet"
                : (newEvent.platform as
                    | "google_meet"
                    | "whatsapp"
                    | "outlook"
                    | "none"),
            meetLink: newEvent.meetLink,
            whatsappNumber: newEvent.whatsappNumber,
            outlookEvent: newEvent.outlookEvent?.toString(),
          });
          newEventModalProps.onOpenChange(false);
        }}
        onClose={() => newEventModalProps.onOpenChange(false)}
      />

      {/* Event Details Popup */}
      {selectedEvent && popupPosition && (
        <EventDetailsPopup
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            setPopupPosition(null);
          }}
          onMouseEnter={() => {
            if (hidePopupTimeout.current) {
              clearTimeout(hidePopupTimeout.current);
              hidePopupTimeout.current = null;
            }
          }}
          onMouseLeave={() => {
            hidePopupTimeout.current = setTimeout(() => {
              setSelectedEvent(null);
              setPopupPosition(null);
            }, 100);
          }}
          position={popupPosition}
          onDelete={() => {
            if (selectedEvent?.id) {
              deleteEventMutation.mutate(selectedEvent.id);
              setSelectedEvent(null);
              setPopupPosition(null);
            }
          }}
        />
      )}

      {/* Edit Event Modal */}
      <EventModal
        modalProps={editEventModalProps}
        eventToEdit={editEvent}
        onSave={(updatedEvent: CustomEvent) => {
          if (editEvent?.id) {
            updateEventMutation.mutate({
              id: editEvent.id,
              data: {
                title: updatedEvent.title,
                description: updatedEvent.description,
                date: updatedEvent.date,
                startHour: updatedEvent.startHour,
                endHour: updatedEvent.endHour,
                calendarType: updatedEvent.calendarType as
                  | "education"
                  | "personal"
                  | "meeting",
                platform:
                  updatedEvent.platform === "google_meet"
                    ? "google_meet"
                    : (updatedEvent.platform as
                        | "google_meet"
                        | "whatsapp"
                        | "outlook"
                        | "none"),
                meetLink: updatedEvent.meetLink,
                whatsappNumber: updatedEvent.whatsappNumber,
                outlookEvent: updatedEvent.outlookEvent?.toString(),
              },
            });
          } else {
            console.error("❌ No event ID found, cannot update event");
          }
          setEditEvent(null);
          editEventModalProps.onOpenChange(false);
        }}
        onClose={() => {
          setEditEvent(null);
          editEventModalProps.onOpenChange(false);
        }}
      />
    </>
  );
};
