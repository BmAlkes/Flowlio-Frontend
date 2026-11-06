import { AlertCircle, ArrowUpRight, CheckCheck, Clock3, FolderKanban, UsersRound, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { formatHours } from "@/utils/timeFormat";

type Count = number | null | undefined;
export type HomeNumbers = {
  clients: Count; activeProjects: Count; weeklyHours: Count; pendingTasks: Count; completedTasks: Count;
  projects?: { ongoing: number; delayed: number; finished: number; total: number };
  overdue: number; dueToday: number;
};

const shown = (value: Count, format: (v: number) => string = String) => value == null ? "—" : format(value);

function Metric({ to, icon: Icon, tone, label, value, children, alert = false }: { to: string; icon: LucideIcon; tone: string; label: string; value: React.ReactNode; children?: React.ReactNode; alert?: boolean }) {
  return <Link to={to} className={`home-metric group ${alert ? "home-metric-alert" : ""}`} data-tone={tone}>
    <span className="flex items-start justify-between gap-3">
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <span className="home-metric-icon"><Icon className="size-4" aria-hidden="true" /></span>
    </span>
    <span className="home-number mt-3 block text-[2rem] font-semibold leading-none tracking-tight tabular-nums">{value}</span>
    <span className="mt-2.5 flex min-h-5 flex-col gap-1.5 text-xs text-muted-foreground">{children}</span>
    <ArrowUpRight className="home-metric-arrow size-4" aria-hidden="true" />
  </Link>;
}

export function HomeMetrics({ numbers, manager }: { numbers: HomeNumbers; manager: boolean }) {
  const { t } = useTranslation();
  const { projects } = numbers;
  return <div className={`home-metrics grid grid-cols-2 gap-3 ${manager ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
    {manager && <Metric to="/dashboard/client-management" icon={UsersRound} tone="violet" label={t("dashboard.totalClients")} value={shown(numbers.clients)}>{t("dashboard.home.clientsNote")}</Metric>}
    <Metric to="/dashboard/project" icon={FolderKanban} tone="cyan" label={t("dashboard.activeProjects")} value={<>{shown(numbers.activeProjects)}{projects && projects.total > 0 && <span className="ms-1.5 text-sm font-medium text-muted-foreground">{t("dashboard.home.ofTotal", { count: projects.total })}</span>}</>}>
      {projects && projects.total > 0 ? <>
        <span className="home-split" role="img" aria-label={t("dashboard.home.projectSplit", { finished: projects.finished, delayed: projects.delayed, ongoing: projects.ongoing })}>
          {projects.finished > 0 && <span style={{ flex: projects.finished, background: "#14A7D4" }} />}
          {projects.delayed > 0 && <span style={{ flex: projects.delayed, background: "#EE7A5C" }} />}
          {projects.ongoing > 0 && <span style={{ flex: projects.ongoing, background: "#F2BC3F" }} />}
        </span>
        <span>{t("dashboard.home.finishedCount", { count: projects.finished })}{projects.delayed > 0 && <> · <span className="home-warn">{t("dashboard.home.delayedCount", { count: projects.delayed })}</span></>}</span>
      </> : t("dashboard.ongoingProjectsDesc")}
    </Metric>
    <Metric to="/dashboard/time-tracking" icon={Clock3} tone="green" label={t("dashboard.home.hoursThisWeek")} value={shown(numbers.weeklyHours, formatHours)}>
      {numbers.weeklyHours === 0 ? <span className="font-semibold text-[var(--home-brand-ink)]">{t("dashboard.logTime")} →</span> : t("dashboard.timeLoggedDesc")}
    </Metric>
    <Metric to="/dashboard/task-management" icon={AlertCircle} tone="amber" alert={numbers.overdue > 0} label={t("dashboard.pendingTasks")} value={shown(numbers.pendingTasks)}>
      {numbers.overdue + numbers.dueToday > 0 ? <span className="home-warn">{[numbers.overdue && t("dashboard.home.overdueCount", { count: numbers.overdue }), numbers.dueToday && t("dashboard.home.dueTodayCount", { count: numbers.dueToday })].filter(Boolean).join(" · ")}</span> : t("dashboard.tasksNotCompletedDesc")}
    </Metric>
    <Metric to="/dashboard/task-management" icon={CheckCheck} tone="blue" label={t("dashboard.tasksCompleted")} value={shown(numbers.completedTasks)}>{t("dashboard.tasksCompletedDesc")}</Metric>
  </div>;
}
