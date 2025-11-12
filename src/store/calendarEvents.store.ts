import { create } from "zustand";
import { CalendarEvent } from "@/components/custom calender/calendarUtils";

interface CalendarEventsState {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (event: CalendarEvent) => void;
}

export const useCalendarEventsStore = create<CalendarEventsState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (updatedEvent) =>
    set((state) => ({
      events: state.events.map((ev) =>
        ev.date === updatedEvent.date && ev.startHour === updatedEvent.startHour
          ? updatedEvent
          : ev
      ),
    })),
  deleteEvent: (eventToDelete) =>
    set((state) => ({
      events: state.events.filter(
        (ev) =>
          !(
            ev.date === eventToDelete.date &&
            ev.startHour === eventToDelete.startHour
          )
      ),
    })),
}));
