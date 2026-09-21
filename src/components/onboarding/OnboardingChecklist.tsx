import { useId, useState } from "react";
import { Link } from "react-router";
import { Check, ChevronDown, X } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const routes: Record<string, string> = {
  create_client: "/dashboard/client-management/create-client",
  create_project: "/dashboard/project/create-project",
  approve_delivery: "/dashboard/project",
  complete_task: "/viewer/my-tasks",
  log_time: "/viewer/time-tracking",
  update_profile: "/viewer/viewer-settings",
};

export function OnboardingChecklist() {
  const { t } = useTranslation();
  const { data, steps, totalSteps, completedSteps, allDone, showOnboarding, dismiss, isLoading, dismissPending, dismissError, refresh, isRefreshing } = useOnboarding();
  const [open, setOpen] = useState(true);
  const contentId = useId();
  if (isLoading || !data || !showOnboarding) return null;
  return <aside aria-label={t("coreOnboarding.title")} className="fixed bottom-4 end-4 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-lg">
    <header className="flex items-center gap-2 p-3">
      <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(value => !value)} className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md p-1 text-start text-sm font-medium focus-visible:outline-2 focus-visible:outline-[#1797ba]">{t("coreOnboarding.title")}<span className="text-xs text-muted-foreground">{completedSteps}/{totalSteps}</span><ChevronDown aria-hidden="true" className="size-4 shrink-0" /></button>
      <button type="button" aria-label={t("coreOnboarding.dismiss")} disabled={dismissPending} onClick={() => dismiss()} className="rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#1797ba]"><X aria-hidden="true" className="size-4" /></button>
    </header>
    <div role="progressbar" aria-label={t("coreOnboarding.progress")} aria-valuenow={completedSteps} aria-valuemin={0} aria-valuemax={totalSteps} className="h-1 w-full bg-muted"><div className="h-full bg-[#1797ba]" style={{ width: `${completedSteps / totalSteps * 100}%` }} /></div>
    {open && <div id={contentId} className="space-y-3 p-3">
      <p className="text-xs text-muted-foreground">{t(allDone ? "coreOnboarding.completed" : "coreOnboarding.evidence")}</p>
      <ul className="space-y-1">{Object.entries(steps).map(([key, step]) => <li key={key}>{step?.completedAt ? <span className="flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground"><Check aria-hidden="true" className="size-4 shrink-0 text-[#11718c] dark:text-[#55bdd9]" /><span>{t(`coreOnboarding.step_${key}`)}</span><span className="sr-only">{t("coreOnboarding.done")}</span></span> : <Link className="block rounded-md p-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#1797ba]" to={routes[key] ?? "/dashboard"}>{t(`coreOnboarding.step_${key}`)}</Link>}</li>)}</ul>
      <Button variant="ghost" size="sm" disabled={isRefreshing} onClick={refresh}>{t("coreOnboarding.refresh")}</Button>
    </div>}
    {dismissError && <p role="alert" className="px-3 pb-3 text-xs">{t("coreOnboarding.error")}</p>}
  </aside>;
}
