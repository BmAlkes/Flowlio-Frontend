// Shared types and utilities for custom calendar components

export type CalendarEvent = {
  id?: string; // Optional for new events, required for existing events
  title: string;
  description?: string;
  date: string; // ISO date string
  day?: number; // Calculated field for UI
  startHour: number;
  endHour: number;
  weekStart?: string; // Calculated field for UI
  calendarType: "work" | "education" | "personal" | "meeting";
  platform?: "google_meet" | "whatsapp" | "outlook" | "zoom" | "none";
  meetLink?: string;
  whatsappNumber?: string;
  outlookEvent?: string;
  organizationId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Alias for backward compatibility
export type CustomEvent = CalendarEvent;

export const initialEvents: CalendarEvent[] = [];

export function formatHour(hour: number) {
  // Handle hours 1-24 (Google Calendar format)
  if (hour >= 1 && hour <= 12) {
    return `${hour} AM`;
  } else if (hour >= 13 && hour <= 24) {
    const displayHour = hour - 12;
    return `${displayHour} PM`;
  }
  // Fallback for any edge cases
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h} ${ampm}`;
}

export const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getStartOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getWeekDates(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export const platformColors = {
  google_meet: { bg: "#E6F4D6", text: "#92AB74" },
  whatsapp: { bg: "#E8EBFF", text: "#6D7EF3" },
  outlook: { bg: "#FFF4EB", text: "#F39F5A" },
  zoom: { bg: "#E6F4D6", text: "#92AB74" },
  none: { bg: "#f0f0f0", text: "#323334" },
};
