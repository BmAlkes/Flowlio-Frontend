import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { OngoingTask } from "@/hooks/useFetchOngoingTasks";
import { daysLate, dueDay } from "./home-insights";

export function OngoingTaskCard({ task }: { task: OngoingTask }) {
  const { t, i18n } = useTranslation();
  const late = daysLate(task);
  const due = dueDay(task);
  const state = late == null ? "none" : late > 0 ? "late" : late === 0 ? "today" : "later";
  const people = [
    task.assignedToId && task.assignedToName ? { id: task.assignedToId, name: task.assignedToName, image: task.assignedToImage } : null,
    task.creatorId !== task.assignedToId ? { id: task.creatorId, name: task.creatorName, image: task.creatorImage } : null,
  ].filter(Boolean) as { id: string; name: string; image: string | null }[];
  const progress = Math.max(0, Math.min(100, task.projectProgress ?? 0));

  return <Link to="/dashboard/task-management" className="home-task" data-state={state}>
    <span className="flex items-center justify-between gap-2">
      <span className="truncate text-xs text-muted-foreground">{task.projectName}</span>
      {state === "late" && <span className="home-badge home-badge-warn">{t("dashboard.home.lateDays", { count: late ?? 0 })}</span>}
      {state === "today" && <span className="home-badge">{t("dashboard.home.dueToday")}</span>}
    </span>
    <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">{task.title}</span>
    <span className="flex items-center gap-2.5">
      <span className="home-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={t("dashboard.progress")}><span style={{ width: `${progress}%` }} /></span>
      <span className="text-xs font-semibold tabular-nums">{progress}%</span>
    </span>
    <span className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{due ? t("dashboard.home.dueOn", { date: due.toLocaleDateString(i18n.language, { day: "numeric", month: "short" }) }) : t("dashboard.home.noDueDate")}</span>
      <span className="flex -space-x-2 rtl:space-x-reverse">
        {people.slice(0, 3).map(person => <TooltipProvider key={person.id}><Tooltip>
          <TooltipTrigger asChild><Avatar className="relative size-8 border-2 border-card hover:z-10"><AvatarImage src={person.image ?? ""} alt={person.name} /><AvatarFallback className="bg-[var(--home-soft)] text-[11px] font-semibold text-[var(--home-brand-ink)]">{person.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar></TooltipTrigger>
          <TooltipContent><p className="capitalize">{person.name}</p></TooltipContent>
        </Tooltip></TooltipProvider>)}
      </span>
    </span>
  </Link>;
}
