import { AlertOctagon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useDismissRiskAlert,
  useProjectRiskAlerts,
} from "@/hooks/useProjectRiskAlerts";

const riskLabel = (score: number) => {
  if (score >= 75)
    return {
      label: "Critical",
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    };
  return {
    label: "High",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };
};

export const ProjectRiskAlertsPanel = () => {
  const { data } = useProjectRiskAlerts();
  const dismissAlert = useDismissRiskAlert();
  const navigate = useNavigate();

  const alerts = data?.data ?? [];
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-2xl p-5 mb-6 border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-900/10">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 shrink-0">
          <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          {alerts.length} project{alerts.length > 1 ? "s" : ""} at risk
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => {
            const risk = riskLabel(alert.riskScore);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl border bg-card border-rose-200 dark:border-rose-500/20 cursor-pointer hover:brightness-95 transition-all"
                onClick={() =>
                  navigate(`/dashboard/project/view/${alert.projectId}`)
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {alert.projectName || alert.projectNumber}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${risk.color}`}
                      >
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
                      dismissAlert.mutate(alert.id);
                    }}
                    disabled={dismissAlert.isPending}
                    title="Dismiss for 7 days"
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-40 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {alert.reasons.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {alert.reasons.join(" · ")}
                  </p>
                )}
                {alert.overdueTaskTitles && alert.overdueTaskTitles.length > 0 && (
                  <ul className="mt-1.5 list-disc pl-4 space-y-0.5">
                    {alert.overdueTaskTitles.map((title, i) => (
                      <li key={i} className="text-xs text-muted-foreground truncate">
                        {title}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
