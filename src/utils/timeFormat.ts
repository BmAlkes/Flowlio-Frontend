/**
 * Formats decimal hours into a readable format like "1h" or "45h"
 * @param totalHours - Total hours as a decimal number (e.g., 1.5, 0.75)
 * @returns Formatted string like "1h" or "45h" (rounded to nearest hour)
 */
export const formatHours = (totalHours: number): string => {
  if (totalHours === 0) return "0h";

  // Round to nearest hour
  const roundedHours = Math.round(totalHours);
  return `${roundedHours}h`;
};

/**
 * Formats duration in minutes into a readable format with hours, minutes, and seconds
 * @param totalMinutes - Total duration in minutes (e.g., 90.5 minutes)
 * @returns Formatted string like "1h 30m 30s" or "45m 30s" or "30s"
 */
export const formatDuration = (totalMinutes: number): string => {
  if (totalMinutes === 0) return "0s";

  // Convert minutes to total seconds
  const totalSeconds = Math.round(totalMinutes * 60);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
};
