import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { AlertCircle, CalendarClock, CheckCircle2, ListTodo, type LucideIcon } from "lucide-react";
import { avatarTone, initialsOf } from "@/components/leads/lead-ui";
import { cn } from "@/lib/utils";
import { dueOf, matchesStat, type TaskStatFilter, type TaskStatusKey } from "./task-ui";

/** Due date with its state: orange only when overdue, blue when it is due within a week. */
export function DueChip({ endDate, status, className }: { endDate?: string | null; status: TaskStatusKey; className?: string }) {
  const { t } = useTranslation();
  const due = dueOf(endDate, status);
  if (!due.date) return <span className={cn("tk-due", className)}>{t("tasksLayout.noDueDate")}</span>;
  const day = format(due.date, "dd MMM");
  const label = due.state === "overdue" ? `${day} · ${t("tasksLayout.daysLate", { count: due.daysLate })}`
    : due.state === "today" ? t("tasksLayout.dueToday") : day;
  return (
    <span className={cn("tk-due", `tk-due-${due.state}`, className)}>
      <CalendarClock aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  );
}

export function TaskAvatar({ name, image, id }: { name?: string; image?: string; id?: string }) {
  const { t } = useTranslation();
  const label = name || t("tasksLayout.unassigned");
  if (image) return <span className="tk-avatar" title={label}><img src={image} alt={label} /></span>;
  return (
    <span className={cn("tk-avatar", name ? avatarTone(id || name) : "bg-muted text-muted-foreground")} title={label} aria-label={label} role="img">
      {name ? initialsOf(name) : "?"}
    </span>
  );
}

type StatTask = { statusKey: TaskStatusKey; endDate?: string | null; projectId?: string };
const CARDS: { key: Exclude<TaskStatFilter, null>; icon: LucideIcon; tone: string }[] = [
  { key: "open", icon: ListTodo, tone: "" },
  { key: "overdue", icon: AlertCircle, tone: "ld-stat-orange" },
  { key: "week", icon: CalendarClock, tone: "ld-stat-cyan" },
  { key: "completed", icon: CheckCircle2, tone: "ld-stat-emerald" },
];

/** Four counts that double as filters; clicking the active one clears it. */
export function TaskStats({ tasks, active, onSelect }: { tasks: StatTask[]; active: TaskStatFilter; onSelect: (stat: TaskStatFilter) => void }) {
  const { t } = useTranslation();
  const counts = useMemo(() => {
    const now = new Date();
    const count = (stat: TaskStatFilter) => tasks.filter(task => matchesStat(task, stat, now)).length;
    const openProjects = new Set(tasks.filter(task => matchesStat(task, "open", now)).map(task => task.projectId)).size;
    return { open: count("open"), overdue: count("overdue"), week: count("week"), completed: count("completed"), openProjects };
  }, [tasks]);

  const hints = {
    open: t("tasksLayout.statOpenHint", { count: counts.openProjects }),
    overdue: t("tasksLayout.statOverdueHint"),
    week: t("tasksLayout.statWeekHint"),
    completed: t("tasksLayout.statCompletedHint"),
  };

  return (
    <section className="ld-stats" aria-label={t("tasksLayout.statsLabel")}>
      {CARDS.map(card => {
        const Icon = card.icon;
        return (
          <button key={card.key} type="button" className={`ld-stat ${card.tone}`} aria-pressed={active === card.key}
            title={t("tasksLayout.statFilter")} onClick={() => onSelect(active === card.key ? null : card.key)}>
            <span className="ld-stat-head">
              <span className="ld-stat-label">{t(`tasksLayout.stat_${card.key}`)}</span>
              <span className="ld-stat-icon"><Icon aria-hidden="true" className="size-4" /></span>
            </span>
            <span className="ld-stat-value">{counts[card.key]}</span>
            <span className="ld-stat-hint">{hints[card.key]}</span>
          </button>
        );
      })}
    </section>
  );
}
