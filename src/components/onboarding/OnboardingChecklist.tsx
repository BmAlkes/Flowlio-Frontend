import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles,
  Users,
  FolderKanban,
  UserPlus,
  ListTodo,
  FileText,
  Receipt,
  Eye,
  Clock,
  UserCog,
  PartyPopper,
} from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const STEP_META: Record<string, { icon: React.ElementType; route?: string }> = {
  create_client:     { icon: Users,        route: "/dashboard/client-management/create-client" },
  create_project:    { icon: FolderKanban, route: "/dashboard/project/create-project" },
  add_team_member:   { icon: UserPlus,     route: "/dashboard/user-management/add-user-members" },
  create_task:       { icon: ListTodo,     route: "/dashboard/task-management/create-task" },
  generate_proposal: { icon: FileText,     route: "/dashboard/proposals" },
  create_invoice:    { icon: Receipt,      route: "/dashboard/invoice" },
  view_projects:     { icon: Eye,          route: "/viewer/my-projects" },
  log_time:          { icon: Clock,        route: "/viewer/time-tracking" },
  update_profile:    { icon: UserCog,      route: "/viewer/viewer-settings" },
};

export function OnboardingChecklist() {
  const { t } = useTranslation();
  const { data, steps, totalSteps, completedSteps, allDone, showOnboarding, dismiss, isLoading } =
    useOnboarding();
  const [open, setOpen] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  // Track previous allDone so we only celebrate on the false→true transition,
  // never on initial load (backend auto-detects steps as done from existing data).
  const prevAllDone = useRef<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;
    // Only celebrate when it transitions from false to true (user just finished last step)
    if (allDone && prevAllDone.current === false) {
      setCelebrating(true);
      setTimeout(() => dismiss(), 3500);
    }
    prevAllDone.current = allDone;
  }, [allDone, isLoading]);

  if (isLoading || !data || !showOnboarding) return null;

  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (celebrating) {
    return (
      <div className="fixed bottom-6 right-6 z-[9998] w-80 bg-background border border-green-200 dark:border-green-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500" />
        <div className="p-5 flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-950/50">
            <PartyPopper className="size-7 text-green-600" />
          </div>
          <p className="font-bold text-foreground">{t("onboarding.allDoneTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("onboarding.allDoneDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9998] w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Gradient accent */}
      <div
        className="h-1 w-full bg-gradient-to-r from-[#0c89af] to-cyan-400 transition-all duration-500"
        style={{ width: `${progress}%`, minWidth: "2rem" }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#0c89af]/10">
            <Sparkles className="size-3.5 text-[#0c89af]" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            {t("onboarding.checklistTitle")}
          </span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {completedSteps}/{totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {open ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="size-4 text-muted-foreground" />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            className="p-1 rounded-md hover:bg-muted transition-colors ml-1"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Progress bar (background) */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-[#0c89af] transition-all duration-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps list */}
      {open && (
        <div className="px-4 py-3 flex flex-col gap-1.5 max-h-72 overflow-y-auto">
          {Object.entries(steps).map(([key, step]) => {
            const done = !!step?.completedAt;
            const meta = STEP_META[key];
            const Icon = meta?.icon ?? ListTodo;

            return (
              <a
                key={key}
                href={done || !meta?.route ? undefined : meta.route}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-xl transition-colors group",
                  done
                    ? "opacity-60 cursor-default"
                    : "hover:bg-muted cursor-pointer"
                )}
              >
                {/* Status indicator */}
                <div
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                    done
                      ? "bg-[#0c89af] border-[#0c89af]"
                      : "border-border bg-background group-hover:border-[#0c89af]"
                  )}
                >
                  {done ? (
                    <Check className="size-3 text-white" strokeWidth={3} />
                  ) : (
                    <Icon className="size-3 text-muted-foreground group-hover:text-[#0c89af]" />
                  )}
                </div>

                <span
                  className={cn(
                    "text-sm leading-tight",
                    done ? "line-through text-muted-foreground" : "text-foreground"
                  )}
                >
                  {t(`onboarding.step_${key}`)}
                </span>
              </a>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {open && (
        <div className="px-4 pb-3 pt-1 border-t border-border">
          <button
            onClick={() => dismiss()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("onboarding.dismiss")}
          </button>
        </div>
      )}
    </div>
  );
}
