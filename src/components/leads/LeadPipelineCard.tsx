import { useDraggable } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { financialMoney } from "@/lib/financial-currency";
import type { Lead } from "@/hooks/useLeads";
import { LeadContactActions } from "./LeadContactActions";
import { OVERDUE_PILL, TEMP_TONE, avatarTone, followUpOf, initialsOf, leadTemperature } from "./lead-ui";

export function LeadCardBody({ lead }: { lead: Lead }) {
  const { t, i18n } = useTranslation();
  const temp = leadTemperature(lead);
  const value = lead.leadValue && Number(lead.leadValue) > 0 ? financialMoney(lead.leadValue, i18n.language, lead.currencyCode, t("core.currencyUnknown")) : null;
  return <>
    <div className="flex items-center gap-2.5 min-w-0">
      <Avatar className="size-8 rounded-[10px] shrink-0">
        <AvatarImage src={lead.image} />
        <AvatarFallback className={`rounded-[10px] text-xs font-bold ${avatarTone(lead.id)}`}>{initialsOf(lead.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{lead.name}</p>
        <p className="text-xs text-muted-foreground truncate">{lead.businessIndustry || lead.webhookName || t("leadsLayout.manual")}</p>
      </div>
    </div>
    <div className="flex items-center justify-between gap-2">
      {temp ? <span className={`ld-pill ${TEMP_TONE[temp].pill}`}>{t(`pipeline.temperatures.${temp}`)}</span> : <span className="ld-empty-value">—</span>}
      {value ? <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{value}</span> : <span className="ld-empty-value">{t("pipeline.noValue")}</span>}
    </div>
  </>;
}

// A pipeline card: drag it to another stage, click it for details.
export function LeadPipelineCard({ lead, onOpen }: { lead: Lead; onOpen: (lead: Lead) => void }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  const followUp = followUpOf(lead);
  return (
    <article ref={setNodeRef} className={`ld-card ${followUp?.state === "overdue" ? "ld-card-overdue" : ""} ${isDragging ? "opacity-30" : ""}`}
      {...attributes} {...listeners} aria-label={lead.name} onClick={() => onOpen(lead)}
      onKeyDown={event => { if (event.key === "Enter") onOpen(lead); listeners?.onKeyDown?.(event); }}>
      <LeadCardBody lead={lead} />
      <div className="ld-card-foot" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}>
        {followUp?.state === "overdue" ? <span className={`ld-pill ${OVERDUE_PILL}`}>{t("leadsLayout.overdue")}</span>
          : followUp?.state === "today" ? <span className="text-xs font-semibold">{t("pipeline.followUpToday")}</span>
          : followUp ? <span className="text-xs text-muted-foreground">{t("pipeline.followUpInDays", { count: followUp.days })}</span>
          : <span className="text-xs text-muted-foreground">{lead.lastInteractionAt ? t("leadsLayout.lastContactOn", { date: new Date(lead.lastInteractionAt).toLocaleDateString() }) : t("pipeline.noContactYet")}</span>}
        <div className="flex items-center"><LeadContactActions lead={lead} compact /></div>
      </div>
    </article>
  );
}
