import { useId, useState } from "react";
import { Link } from "react-router";
import { Check, ChevronDown, ChevronUp, Minus, X } from "lucide-react";
import { readOnboardingMinimized, writeOnboardingMinimized } from "./onboarding-minimized";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/providers/user.provider";
import { OnboardingCurrencySetup } from "./OnboardingCurrencySetup";

const routes: Record<string, string> = {
  create_client: "/dashboard/client-management/create-client",
  create_project: "/dashboard/project/create-project",
  create_task: "/dashboard/task-management/create-task",
  invite_member: "/dashboard/user-management/add-user-members",
  complete_task: "/dashboard/task-management",
  log_time: "/dashboard/time-tracking",
  update_profile: "/dashboard/settings",
};

export function OnboardingChecklist() {
  const { t } = useTranslation();
  const { data, steps, totalSteps, completedSteps, allDone, showOnboarding, dismiss, isLoading, dismissPending, dismissError } = useOnboarding();
  const { data: session } = useUser();
  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(readOnboardingMinimized);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const contentId = useId();
  if (isLoading || !data || !showOnboarding) return null;
  const canConfigureCurrency = data.role === "admin" && session?.user?.role === "user" && !!session.user.isOrganizationOwner;
  const currencyConfigured = !!steps.configure_currency?.completedAt;
  const minimize = (value: boolean) => { setMinimized(value); writeOnboardingMinimized(value); if (!value) setOpen(true); };
  if (minimized) return <button type="button" onClick={() => minimize(false)} aria-label={`${t("coreOnboarding.reopen")} (${completedSteps}/${totalSteps})`} className="fixed bottom-4 end-4 z-40 flex items-center gap-2 rounded-full border border-border bg-background py-2 ps-2 pe-4 text-sm font-medium text-foreground shadow-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#1797ba]">
    <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-[#1797ba] text-xs font-semibold text-white">{completedSteps}/{totalSteps}</span>
    <span>{t("coreOnboarding.title")}</span><ChevronUp aria-hidden="true" className="size-4" />
  </button>;
  return <><aside aria-label={t("coreOnboarding.title")} className="fixed bottom-4 end-4 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-lg">
    <header className="flex items-center gap-2 p-3">
      <button type="button" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(value => !value)} className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md p-1 text-start text-sm font-medium focus-visible:outline-2 focus-visible:outline-[#1797ba]">{t("coreOnboarding.title")}<span className="text-xs text-muted-foreground">{completedSteps}/{totalSteps}</span><ChevronDown aria-hidden="true" className="size-4 shrink-0" /></button>
      <button type="button" aria-label={t("coreOnboarding.minimize")} title={t("coreOnboarding.minimize")} onClick={() => minimize(true)} className="rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#1797ba]"><Minus aria-hidden="true" className="size-4" /></button>
    </header>
    <div role="progressbar" aria-label={t("coreOnboarding.progress")} aria-valuenow={completedSteps} aria-valuemin={0} aria-valuemax={totalSteps} className="h-1 w-full bg-muted"><div className="h-full bg-[#1797ba]" style={{ width: `${completedSteps / totalSteps * 100}%` }} /></div>
    {open && <div id={contentId} className="space-y-3 p-3">
      <p className="text-xs text-muted-foreground">{t(allDone ? "coreOnboarding.completed" : "coreOnboarding.evidence")}</p>
      <ul className="space-y-1">{Object.entries(steps).filter(([key]) => key !== "configure_currency" || canConfigureCurrency).map(([key, step]) => <li key={key}>{step?.completedAt ? <span className="flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground"><Check aria-hidden="true" className="size-4 shrink-0 text-[#11718c] dark:text-[#55bdd9]" /><span>{t(`coreOnboarding.step_${key}`)}</span><span className="sr-only">{t("coreOnboarding.done")}</span></span> : key === "configure_currency" ? <button type="button" className="block w-full rounded-md p-2 text-start text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#1797ba]" onClick={() => setCurrencyOpen(true)}>{t("coreOnboarding.step_configure_currency")}</button> : <Link className="block rounded-md p-2 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#1797ba]" to={routes[key] ?? "/dashboard"}>{t(`coreOnboarding.step_${key}`)}</Link>}</li>)}</ul>
      {allDone && <Button type="button" size="sm" variant="outline" className="w-full" disabled={dismissPending} onClick={() => { writeOnboardingMinimized(false); dismiss(); }}><X aria-hidden="true" className="size-4" />{t("coreOnboarding.dismiss")}</Button>}
    </div>}
    {dismissError && <p role="alert" className="px-3 pb-3 text-xs">{t("coreOnboarding.error")}</p>}
  </aside>
    {currencyOpen && canConfigureCurrency && <Dialog open onOpenChange={setCurrencyOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle>{t("coreOnboarding.step_configure_currency")}</DialogTitle><DialogDescription>{t("coreOnboarding.currencyDescription")}</DialogDescription></DialogHeader>
        <OnboardingCurrencySetup configured={currencyConfigured} />
        <Button type="button" disabled={!currencyConfigured} onClick={() => setCurrencyOpen(false)}>{t("coreOnboarding.start")}</Button>
      </DialogContent>
    </Dialog>}
  </>;
}
