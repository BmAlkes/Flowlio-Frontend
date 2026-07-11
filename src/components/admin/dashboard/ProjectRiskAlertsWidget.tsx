import { AlertOctagon, CheckCheck, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useDismissRiskAlert,
  useProjectRiskAlerts,
  type ProjectRiskAlert,
} from "@/hooks/useProjectRiskAlerts";

const riskLabel = (score: number) => {
  if (score >= 75) return { label: "Critical", color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" };
  return { label: "High", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" };
};

interface AlertRowProps {
  alert: ProjectRiskAlert;
  onDismiss: (id: string) => void;
  onNavigate: (projectId: string) => void;
  isPending: boolean;
}

const overdueSummary = (titles: string[] | null) => {
  if (!titles || titles.length === 0) return null;
  const shown = titles.slice(0, 2).join(", ");
  const remaining = titles.length - 2;
  return remaining > 0 ? `${shown} +${remaining} more` : shown;
};

const AlertRow = ({ alert, onDismiss, onNavigate, isPending }: AlertRowProps) => {
  const risk = riskLabel(alert.riskScore);
  const overdueText = overdueSummary(alert.overdueTaskTitles);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="p-2.5 rounded-xl border bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-500/20 cursor-pointer hover:brightness-95 transition-all"
      onClick={() => onNavigate(alert.projectId)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {alert.projectName || alert.projectNumber}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${risk.color}`}>
              {risk.label}
            </span>
            <span className="text-xs text-muted-foreground">
              Score {alert.riskScore}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(alert.id);
          }}
          disabled={isPending}
          title="Dismiss for 7 days"
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-40 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {overdueText ? (
        <p className="text-xs text-muted-foreground mt-1.5 truncate">
          Overdue: {overdueText}
        </p>
      ) : (
        alert.reasons.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1.5 truncate">
            {alert.reasons.join(" · ")}
          </p>
        )
      )}
    </motion.div>
  );
};

export const ProjectRiskAlertsWidget = () => {
  const { data, isLoading } = useProjectRiskAlerts();
  const dismissAlert = useDismissRiskAlert();
  const navigate = useNavigate();

  const alerts = data?.data ?? [];
  const visible = alerts.slice(0, 5);

  const handleDismiss = (id: string) => {
    dismissAlert.mutate(id);
  };

  const handleNavigate = (projectId: string) => {
    navigate(`/dashboard/project/view/${projectId}`);
  };

  return (
    <div className="rounded-2xl p-5 w-full bg-white/55 dark:bg-slate-800/55 backdrop-blur-xl border border-white/70 dark:border-white/[0.09] shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30">
            <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Projects at Risk
          </h3>
        </div>
        {alerts.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            {alerts.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground/70">
            No projects at risk
          </p>
          <p className="text-xs text-muted-foreground text-center">
            We'll flag anything that needs attention here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onDismiss={handleDismiss}
                onNavigate={handleNavigate}
                isPending={dismissAlert.isPending}
              />
            ))}
          </AnimatePresence>
          {alerts.length > 5 && (
            <p className="text-xs text-center font-medium text-rose-600 dark:text-rose-400">
              +{alerts.length - 5} more
            </p>
          )}
        </div>
      )}
    </div>
  );
};
