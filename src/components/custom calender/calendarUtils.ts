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

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

export function formatHour(hour: number, localeCode: string = "en-US") {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  const locale = localeCode === "es" ? es : enUS;
  return format(d, "h a", { locale });
}

export function getDaysShort(localeCode: string = "en-US") {
  const locale = localeCode === "es" ? es : enUS;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2021, 0, 3 + i); // Start from a Sunday
    return format(d, "EEE", { locale });
  });
}

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
