import { type BoxProps } from "@/components/ui/box";
import { cn } from "@/lib/utils";
import { useState, type FC } from "react";
import { useFetchOrganizationActivities, type OrganizationActivity } from "@/hooks/useFetchOrganizationActivities";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { ListSkeleton } from "@/components/skeletons";
import { ChevronDown } from "lucide-react";

type Group = { key: string; user: string; action: string; subjects: string[]; date: Date; items: OrganizationActivity[] };

// "Deleted client: A", "Deleted client: B" by the same person in a row become one line with both names.
export function groupActivities(activities: OrganizationActivity[]): Group[] {
  const groups: Group[] = [];
  for (const item of activities) {
    const split = item.activity.indexOf(": ");
    const action = split > 0 ? item.activity.slice(0, split) : item.activity;
    const subject = split > 0 ? item.activity.slice(split + 2) : "";
    const last = groups[groups.length - 1];
    if (last && split > 0 && last.subjects.length && last.user === item.user && last.action === action) { last.subjects.push(subject); last.items.push(item); continue; }
    groups.push({ key: item.id, user: item.user, action, subjects: subject ? [subject] : [], date: new Date(item.date), items: [item] });
  }
  return groups;
}

function ActivityGroup({ group }: { group: Group }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const many = group.subjects.length > 1;
  return <li className="border-t border-[var(--home-line)] py-3 first:border-t-0 first:pt-0">
    <p className="text-sm leading-snug"><strong className="font-semibold">{group.user}</strong> <span className="text-foreground/80">{group.action}{many ? ` · ${group.subjects.length}` : group.subjects[0] ? `: ${group.subjects[0]}` : ""}</span></p>
    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
      {formatDistanceToNow(group.date, { addSuffix: true })}
      {many && <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-0.5 font-medium text-[var(--home-brand-ink)] hover:underline">· {t(open ? "dashboard.home.hideItems" : "dashboard.home.showItems")}<ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} aria-hidden="true" /></button>}
    </p>
    {many && open && <ul className="mt-2 space-y-1 ps-3 text-xs text-muted-foreground">{group.subjects.map((subject, i) => <li key={group.items[i].id} className="truncate">{subject}</li>)}</ul>}
  </li>;
}

export const RecentActivities: FC<BoxProps> = ({ className }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useFetchOrganizationActivities();
  const groups = groupActivities(data?.data?.activities ?? []);
  return <section className={cn("home-panel p-5", className)} aria-labelledby="home-activity-title">
    <h2 id="home-activity-title" className="home-title mb-3">{t("dashboard.recentActivities")}</h2>
    {isLoading ? <ListSkeleton rows={4} />
      : groups.length ? <ul className="max-h-[22rem] overflow-auto pe-1">{groups.slice(0, 8).map(group => <ActivityGroup key={group.key} group={group} />)}</ul>
      : <p className="py-6 text-center text-sm text-muted-foreground">{t("dashboard.noRecentActivities")}</p>}
  </section>;
};
