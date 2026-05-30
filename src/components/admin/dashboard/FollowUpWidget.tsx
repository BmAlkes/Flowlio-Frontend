import { usePendingFollowUps, useSetFollowUp } from "@/hooks/useCRM";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Building2, CalendarClock, Loader2, CheckCheck } from "lucide-react";
import { differenceInDays, format, isPast } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export const FollowUpWidget = () => {
  const { data: leads, isLoading } = usePendingFollowUps();
  const cancelFollowUp = useSetFollowUp();

  const handleDone = (clientId: string) => {
    cancelFollowUp.mutate({ clientId, followUpAt: null });
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-5 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-foreground">Follow-ups Pendentes</h3>
        </div>
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Bell className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Follow-ups Pendentes</h3>
        </div>
        {leads && leads.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            {leads.length}
          </span>
        )}
      </div>

      {!leads?.length ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground/70">Tudo em dia!</p>
          <p className="text-xs text-muted-foreground text-center">
            Nenhum follow-up pendente no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {leads.map((lead) => {
              const date = new Date(lead.followUpAt);
              const overdue = isPast(date);
              const daysAgo = differenceInDays(new Date(), date);
              const daysLeft = differenceInDays(date, new Date());

              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    overdue
                      ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-500/20"
                      : "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-500/20"
                  }`}
                >
                  <Avatar className="h-9 w-9 rounded-xl shrink-0">
                    <AvatarImage src={lead.image} />
                    <AvatarFallback className="rounded-xl text-xs font-bold bg-muted">
                      {getInitials(lead.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {lead.businessIndustry && (
                        <>
                          <Building2 className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{lead.businessIndustry}</span>
                          <span className="text-muted-foreground/40">·</span>
                        </>
                      )}
                      <CalendarClock className={`h-3 w-3 shrink-0 ${overdue ? "text-rose-500" : "text-indigo-500"}`} />
                      <span className={`text-xs font-medium ${overdue ? "text-rose-600 dark:text-rose-400" : "text-indigo-600 dark:text-indigo-400"}`}>
                        {overdue
                          ? daysAgo === 0 ? "Hoje" : `${daysAgo}d atrás`
                          : daysLeft === 0 ? "Hoje" : `em ${daysLeft}d · ${format(date, "d MMM")}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDone(lead.id)}
                    disabled={cancelFollowUp.isPending}
                    title="Marcar como feito"
                    className={`shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                      overdue
                        ? "text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                        : "text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                    }`}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
