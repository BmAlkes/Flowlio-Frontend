import { differenceInCalendarDays } from "date-fns";
import type { Lead } from "@/hooks/useLeads";

// Shared look of the Leads screens: soft (50%) fills, full-strength text so labels stay readable.
// Orange is reserved for overdue follow-ups.

export const SALES_STAGES = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Contract Signed"] as const;
export const CLOSED_STAGES = ["Project In Progress", "Completed", "Inactive", "Lost"] as const;
export const LEAD_STAGES = [...SALES_STAGES, ...CLOSED_STAGES];

type Tone = { dot: string; pill: string; bar: string; tint: string };
const tone = (dot: string, pill: string, bar: string, tint: string): Tone => ({ dot, pill, bar, tint });
export const STAGE_TONE: Record<string, Tone> = {
  "New Lead": tone("bg-blue-500", "bg-blue-100/50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300", "bg-blue-500/50", "bg-blue-500/[0.04]"),
  "Contacted": tone("bg-violet-500", "bg-violet-100/50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300", "bg-violet-500/50", "bg-violet-500/[0.04]"),
  "Qualified": tone("bg-yellow-500", "bg-yellow-100/50 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300", "bg-yellow-500/50", "bg-yellow-500/[0.04]"),
  "Proposal Sent": tone("bg-amber-500", "bg-amber-100/50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300", "bg-amber-500/50", "bg-amber-500/[0.04]"),
  "Contract Signed": tone("bg-emerald-500", "bg-emerald-100/50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300", "bg-emerald-500/50", "bg-emerald-500/[0.04]"),
  "Project In Progress": tone("bg-indigo-500", "bg-indigo-100/50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300", "bg-indigo-500/50", "bg-indigo-500/[0.04]"),
  "Completed": tone("bg-green-500", "bg-green-100/50 text-green-800 dark:bg-green-500/15 dark:text-green-300", "bg-green-500/50", "bg-green-500/[0.04]"),
  "Inactive": tone("bg-slate-400", "bg-slate-100/50 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300", "bg-slate-400/50", "bg-slate-400/[0.04]"),
  "Lost": tone("bg-rose-500", "bg-rose-100/50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300", "bg-rose-500/50", "bg-rose-500/[0.04]"),
};
export const stageTone = (stage: string) => STAGE_TONE[stage] ?? STAGE_TONE.Inactive;

export const TEMPERATURES = ["Hot", "Warm", "Cold", "Lost"] as const;
export type Temperature = typeof TEMPERATURES[number];
export const TEMP_TONE: Record<Temperature, { dot: string; pill: string }> = {
  Hot: { dot: "bg-rose-500", pill: "bg-rose-100/50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300" },
  Warm: { dot: "bg-amber-500", pill: "bg-amber-100/50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  Cold: { dot: "bg-blue-500", pill: "bg-blue-100/50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300" },
  Lost: { dot: "bg-slate-400", pill: "bg-slate-100/50 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300" },
};
export const leadTemperature = (lead: Pick<Lead, "temperature" | "leadTemperature">): Temperature | null =>
  (lead.temperature ?? lead.leadTemperature ?? null) as Temperature | null;

const AVATARS = [
  "bg-violet-100/50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-amber-100/50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-emerald-100/50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-sky-100/50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  "bg-rose-100/50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  "bg-indigo-100/50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  "bg-teal-100/50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
];
// The same lead always gets the same color.
export const avatarTone = (id: string) => AVATARS[[...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATARS.length];
export const initialsOf = (name?: string | null) =>
  (name ?? "?").trim().split(/\s+/).map(part => part[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

export const OVERDUE_PILL = "bg-orange-100/50 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300";

export type FollowUp = { state: "overdue" | "today" | "upcoming"; days: number; date: Date } | null;
export function followUpOf(lead: Pick<Lead, "followUpAt">, now = new Date()): FollowUp {
  if (!lead.followUpAt) return null;
  const date = new Date(lead.followUpAt);
  if (Number.isNaN(date.getTime())) return null;
  const days = differenceInCalendarDays(date, now);
  // Same rule as before the redesign: a follow-up time that has passed is overdue.
  return { state: date.getTime() < now.getTime() ? "overdue" : days === 0 ? "today" : "upcoming", days, date };
}

// Contact links. Placeholder addresses from imports are not real contacts.
export const realEmail = (email?: string | null) => (email && !email.includes("@noemail.invalid") ? email : null);
export const phoneDigits = (phone?: string | null) => (phone ?? "").replace(/\D/g, "");
export const contactLinks = (lead: Pick<Lead, "email" | "phone">) => {
  const email = realEmail(lead.email), digits = phoneDigits(lead.phone);
  return {
    email: email ? `mailto:${email}` : null,
    call: digits.length >= 6 ? `tel:+${digits}` : null,
    whatsapp: digits.length >= 8 ? `https://wa.me/${digits}` : null,
  };
};

export type LeadStatFilter = "overdue" | "uncontacted" | "hot" | null;
export const matchesStat = (lead: Lead, stat: LeadStatFilter, now = new Date()) =>
  stat === null ? true
  : stat === "overdue" ? followUpOf(lead, now)?.state === "overdue"
  : stat === "uncontacted" ? lead.status === "New Lead" && !lead.lastInteractionAt
  : leadTemperature(lead) === "Hot";

export const isOpenLead = (lead: Pick<Lead, "status">) => !(CLOSED_STAGES as readonly string[]).includes(lead.status);
