import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { addDays, isSameDay, startOfDay, startOfWeek } from "date-fns";
import type { OngoingTask } from "@/hooks/useFetchOngoingTasks";
import type { FollowUpDashboardData, FollowUpLead } from "@/hooks/useCRM";
import { dueDay } from "./home-insights";

type Item = { key: string; kind: "task" | "followup"; title: string; to: string; time?: string; late: boolean };
const MAX_PER_DAY = 3;

export function WeekCalendar({ tasks, followUps, today = new Date() }: { tasks: OngoingTask[]; followUps?: FollowUpDashboardData; today?: Date }) {
  const { t, i18n } = useTranslation();
  const start = startOfWeek(today, { weekStartsOn: i18n.language?.startsWith("he") ? 0 : 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const now = startOfDay(today);
  const time = (date: Date) => date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });
  const leads: FollowUpLead[] = followUps ? [...followUps.overdue, ...followUps.today, ...followUps.upcoming] : [];
  const earlier = tasks.filter(task => { const due = dueDay(task); return due && due < start; }).length;
  const itemsFor = (day: Date): Item[] => [
    ...tasks.filter(task => { const due = dueDay(task); return due && isSameDay(due, day); })
      .map(task => ({ key: `t-${task.id}`, kind: "task" as const, title: task.title, to: "/dashboard/task-management", late: day < now })),
    ...leads.filter(lead => isSameDay(new Date(lead.followUpAt), day))
      .map(lead => ({ key: `f-${lead.id}`, kind: "followup" as const, title: lead.name, time: time(new Date(lead.followUpAt)), to: lead.clientType === "client" ? "/dashboard/client-management" : "/dashboard/leads", late: new Date(lead.followUpAt) < today })),
  ];
  const label = (day: Date) => day.toLocaleDateString(i18n.language, { weekday: "short" });

  return <section className="home-panel p-5" aria-labelledby="home-week-title">
    <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id="home-week-title" className="home-title">{t("dashboard.home.thisWeek")}</h2>
        <p className="text-[13px] text-muted-foreground">{days[0].toLocaleDateString(i18n.language, { day: "numeric", month: "short" })} – {days[6].toLocaleDateString(i18n.language, { day: "numeric", month: "short" })}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {earlier > 0 && <Link to="/dashboard/task-management" className="home-pill home-pill-warn">{t("dashboard.home.overdueEarlier", { count: earlier })}</Link>}
        <span className="flex items-center gap-1.5"><span className="home-dot" data-kind="task" />{t("dashboard.home.task")}</span>
        {followUps && <span className="flex items-center gap-1.5"><span className="home-dot" data-kind="followup" />{t("dashboard.followUps")}</span>}
        <Link to="/dashboard/calendar" className="font-medium text-[var(--home-brand-ink)] hover:underline">{t("dashboard.home.openCalendar")}</Link>
      </div>
    </header>
    <div className="overflow-x-auto">
      <ol className="home-week">
        {days.map(day => {
          const items = itemsFor(day); const isToday = isSameDay(day, today);
          return <li key={day.toISOString()} className="home-day" aria-current={isToday ? "date" : undefined} data-past={day < now || undefined}>
            <p className="text-xs opacity-80">{label(day)}{isToday && ` · ${t("dashboard.home.today")}`}</p>
            <p className="home-number text-xl font-semibold leading-tight">{day.getDate()}</p>
            <ul className="mt-2 space-y-1.5">
              {items.slice(0, MAX_PER_DAY).map(item => <li key={item.key}><Link to={item.to} className="home-event" data-kind={item.kind} data-late={item.late || undefined}>{item.time && <span className="tabular-nums">{item.time} · </span>}{item.title}</Link></li>)}
              {items.length > MAX_PER_DAY && <li className="text-xs font-medium opacity-80">{t("dashboard.home.more", { count: items.length - MAX_PER_DAY })}</li>}
            </ul>
          </li>;
        })}
      </ol>
    </div>
  </section>;
}
