import { useFollowUpsDashboard, useSetFollowUp, FollowUpLead } from "@/hooks/useCRM";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Building2, CalendarClock, Loader2, CheckCheck, AlertTriangle, ArrowRight } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

interface LeadRowProps {
  lead: FollowUpLead;
  variant: "overdue" | "today" | "upcoming";
  onDone: (id: string) => void;
  onNavigate: (id: string) => void;
  isPending: boolean;
}

const LeadRow = ({ lead, variant, onDone, onNavigate, isPending }: LeadRowProps) => {
  const { t } = useTranslation();
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

  const dateLabel =
    variant === "overdue"
      ? daysAgo === 0 ? t("dashboard.followUpsToday_label") : t("dashboard.followUpsDaysAgo", { count: daysAgo })
      : variant === "today"
      ? t("dashboard.followUpsToday_label")
      : daysLeft <= 1
      ? t("dashboard.followUpsTomorrow_label")
      : t("dashboard.followUpsDaysLeft", { count: daysLeft, date: format(date, "d MMM") });

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer hover:brightness-95 transition-all ${colors[variant]}`}
      onClick={() => onNavigate(lead.id)}
    >
      {/* Avatar with real image */}
      <Avatar className="h-9 w-9 rounded-xl shrink-0">
        <AvatarImage src={lead.image} alt={lead.name} className="object-cover" />
        <AvatarFallback className="rounded-xl text-[11px] font-bold bg-muted text-muted-foreground">
          {getInitials(lead.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <CalendarClock className={`h-3 w-3 shrink-0 ${iconColors[variant]}`} />
          <span className={`text-xs font-medium ${dateColors[variant]}`}>{dateLabel}</span>
          {lead.businessIndustry && (
            <>
              <span className="text-muted-foreground/40 mx-0.5">·</span>
              <Building2 className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{lead.businessIndustry}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onDone(lead.id); }}
          disabled={isPending}
          title={t("dashboard.followUpsMarkDone")}
          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${btnColors[variant]}`}
        >
          <CheckCheck className="h-4 w-4" />
        </button>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>
    </motion.div>
  );
};

interface SectionProps {
  title: string;
  leads: FollowUpLead[];
  variant: "overdue" | "today" | "upcoming";
  onDone: (id: string) => void;
  onNavigate: (id: string) => void;
  isPending: boolean;
  moreLabel: string;
}

const Section = ({ title, leads, variant, onDone, onNavigate, isPending, moreLabel }: SectionProps) => {
  if (!leads.length) return null;

  const labelColors = {
    overdue: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
    today: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
    upcoming: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30",
  };

  const visible = leads.slice(0, 5);

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
        {visible.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            variant={variant}
            onDone={onDone}
            onNavigate={onNavigate}
            isPending={isPending}
          />
        ))}
      </AnimatePresence>
      {leads.length > 5 && (
        <p className={`text-xs text-center font-medium ${labelColors[variant].split(" ")[0]}`}>
          {moreLabel}
        </p>
      )}
    </div>
  );
};

export const FollowUpWidget = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useFollowUpsDashboard();
  const cancelFollowUp = useSetFollowUp();
  const navigate = useNavigate();

  const handleDone = (clientId: string) => {
    cancelFollowUp.mutate({ clientId, followUpAt: null });
  };

  const handleNavigate = (_clientId: string) => {
    navigate("/dashboard/leads");
  };

  const total = (data?.overdue?.length ?? 0) + (data?.today?.length ?? 0) + (data?.upcoming?.length ?? 0);
  const hasUrgent = (data?.overdue?.length ?? 0) + (data?.today?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl p-5 w-full bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.07] shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${hasUrgent ? "bg-rose-100 dark:bg-rose-900/30" : "bg-indigo-100 dark:bg-indigo-900/30"}`}>
            {hasUrgent
              ? <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              : <Bell className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            }
          </div>
          <h3 className="text-sm font-semibold text-foreground">{t("dashboard.followUps")}</h3>
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
          <p className="text-sm font-medium text-foreground/70">{t("dashboard.followUpsAllDone")}</p>
          <p className="text-xs text-muted-foreground text-center">{t("dashboard.followUpsAllDoneDesc")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Section
            title={t("dashboard.followUpsOverdue")}
            leads={data?.overdue ?? []}
            variant="overdue"
            onDone={handleDone}
            onNavigate={handleNavigate}
            isPending={cancelFollowUp.isPending}
            moreLabel={t("dashboard.followUpsMore", { count: Math.max(0, (data?.overdue?.length ?? 0) - 5) })}
          />
          <Section
            title={t("dashboard.followUpsToday")}
            leads={data?.today ?? []}
            variant="today"
            onDone={handleDone}
            onNavigate={handleNavigate}
            isPending={cancelFollowUp.isPending}
            moreLabel={t("dashboard.followUpsMore", { count: Math.max(0, (data?.today?.length ?? 0) - 5) })}
          />
          <Section
            title={t("dashboard.followUpsUpcoming")}
            leads={data?.upcoming ?? []}
            variant="upcoming"
            onDone={handleDone}
            onNavigate={handleNavigate}
            isPending={cancelFollowUp.isPending}
            moreLabel={t("dashboard.followUpsMore", { count: Math.max(0, (data?.upcoming?.length ?? 0) - 5) })}
          />
        </div>
      )}
    </div>
  );
};
