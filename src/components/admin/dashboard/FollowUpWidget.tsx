import { useFollowUpsDashboard, useSetFollowUp, FollowUpLead } from "@/hooks/useCRM";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Building2, CalendarClock, Loader2, CheckCheck, AlertTriangle } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

interface LeadRowProps {
  lead: FollowUpLead;
  variant: "overdue" | "today" | "upcoming";
  onDone: (id: string) => void;
  isPending: boolean;
}

const LeadRow = ({ lead, variant, onDone, isPending }: LeadRowProps) => {
  const date = new Date(lead.followUpAt);
  const daysLeft = differenceInDays(date, new Date());
  const daysAgo = differenceInDays(new Date(), date);

  const colors = {
    overdue: "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-500/20",
    today: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20",
    upcoming: "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-500/20",
  };

  const dateColors = {
    overdue: "text-rose-600 dark:text-rose-400",
    today: "text-amber-600 dark:text-amber-400",
    upcoming: "text-indigo-600 dark:text-indigo-400",
  };

  const iconColors = {
    overdue: "text-rose-500",
    today: "text-amber-500",
    upcoming: "text-indigo-400",
  };

  const btnColors = {
    overdue: "text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30",
    today: "text-amber-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30",
    upcoming: "text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30",
  };

  const dateLabel = {
    overdue: daysAgo === 0 ? "Hoje" : `${daysAgo}d atrás`,
    today: "Hoje",
    upcoming: daysLeft <= 1 ? "Amanhã" : `em ${daysLeft}d · ${format(date, "d MMM")}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`flex items-center gap-3 p-2.5 rounded-xl border ${colors[variant]}`}
    >
      <Avatar className="h-8 w-8 rounded-lg shrink-0">
        <AvatarImage src={lead.image} />
        <AvatarFallback className="rounded-lg text-[10px] font-bold bg-muted">
          {getInitials(lead.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <CalendarClock className={`h-3 w-3 shrink-0 ${iconColors[variant]}`} />
          <span className={`text-xs font-medium ${dateColors[variant]}`}>
            {dateLabel[variant]}
          </span>
          {lead.businessIndustry && (
            <>
              <span className="text-muted-foreground/40 mx-0.5">·</span>
              <Building2 className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{lead.businessIndustry}</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={() => onDone(lead.id)}
        disabled={isPending}
        title="Marcar como feito"
        className={`shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-40 ${btnColors[variant]}`}
      >
        <CheckCheck className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

interface SectionProps {
  title: string;
  leads: FollowUpLead[];
  variant: "overdue" | "today" | "upcoming";
  onDone: (id: string) => void;
  isPending: boolean;
}

const Section = ({ title, leads, variant, onDone, isPending }: SectionProps) => {
  if (!leads.length) return null;

  const labelColors = {
    overdue: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
    today: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
    upcoming: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${labelColors[variant]}`}>
          {title}
        </span>
        <span className={`text-xs font-bold ${labelColors[variant].split(" ")[0]}`}>
          {leads.length}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {leads.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            variant={variant}
            onDone={onDone}
            isPending={isPending}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const FollowUpWidget = () => {
  const { data, isLoading } = useFollowUpsDashboard();
  const cancelFollowUp = useSetFollowUp();

  const handleDone = (clientId: string) => {
    cancelFollowUp.mutate({ clientId, followUpAt: null });
  };

  const total = (data?.overdue?.length ?? 0) + (data?.today?.length ?? 0) + (data?.upcoming?.length ?? 0);
  const hasUrgent = (data?.overdue?.length ?? 0) + (data?.today?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${hasUrgent ? "bg-rose-100 dark:bg-rose-900/30" : "bg-indigo-100 dark:bg-indigo-900/30"}`}>
            {hasUrgent
              ? <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              : <Bell className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            }
          </div>
          <h3 className="text-sm font-semibold text-foreground">Follow-ups</h3>
        </div>
        {total > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            hasUrgent
              ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
              : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          }`}>
            {total}
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : total === 0 ? (
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
        <div className="space-y-4">
          <Section
            title="Vencidos"
            leads={data?.overdue ?? []}
            variant="overdue"
            onDone={handleDone}
            isPending={cancelFollowUp.isPending}
          />
          <Section
            title="Hoje"
            leads={data?.today ?? []}
            variant="today"
            onDone={handleDone}
            isPending={cancelFollowUp.isPending}
          />
          <Section
            title="Próximos 7 dias"
            leads={data?.upcoming ?? []}
            variant="upcoming"
            onDone={handleDone}
            isPending={cancelFollowUp.isPending}
          />
        </div>
      )}
    </div>
  );
};
