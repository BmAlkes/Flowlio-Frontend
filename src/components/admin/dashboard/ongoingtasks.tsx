import { Link } from "react-router";
import { type FC } from "react";
import { cn } from "@/lib/utils";
import { type BoxProps } from "@/components/ui/box";
import { useFetchOngoingTasks } from "@/hooks/useFetchOngoingTasks";
import { useTranslation } from "react-i18next";
import { ListSkeleton } from "@/components/skeletons";
import { OngoingTaskCard } from "./ongoingtaskcard";

const VISIBLE = 6;

// The API sends the most urgent tasks first.
export const OngoingTasks: FC<BoxProps> = ({ className }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useFetchOngoingTasks();
  const tasks = data?.data ?? [];

  return <section className={cn("home-panel p-5", className)} aria-labelledby="home-ongoing-title">
    <header className="mb-4 flex items-baseline justify-between gap-3">
      <h2 id="home-ongoing-title" className="home-title">{t("dashboard.ongoingTasksTitle")}{tasks.length > 0 && <span className="ms-1.5 text-sm font-medium text-muted-foreground">· {tasks.length}</span>}</h2>
      <Link to="/dashboard/task-management" className="text-[13px] font-medium text-[var(--home-brand-ink)] hover:underline">{t("dashboard.home.seeAll")}</Link>
    </header>
    {isLoading ? <ListSkeleton rows={3} />
      : error ? <p role="alert" className="py-8 text-center text-sm text-destructive">{t("dashboard.failedToLoadOngoingTasks")}</p>
      : !tasks.length ? <p className="py-8 text-center text-sm text-muted-foreground">{t("dashboard.noOngoingTasksFound")}</p>
      : <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">{tasks.slice(0, VISIBLE).map(task => <OngoingTaskCard key={task.id} task={task} />)}</div>}
  </section>;
};
