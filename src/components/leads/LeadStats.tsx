import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Coins, Flame, UserPlus, type LucideIcon } from "lucide-react";
import { financialTotals } from "@/lib/financial-currency";
import type { Lead } from "@/hooks/useLeads";
import { isOpenLead, matchesStat, type LeadStatFilter } from "./lead-ui";

type Card = { key: string; filter: LeadStatFilter | "value"; icon: LucideIcon; value: string; hint: string; tone: string };

// Each card counts the leads behind it; the first three also filter the list when clicked.
const TONES = {
  overdue: "ld-stat-orange",
  uncontacted: "ld-stat-cyan",
  hot: "ld-stat-rose",
  value: "ld-stat-emerald",
};

export function LeadStats({ leads, active, onSelect }: { leads: Lead[]; active: LeadStatFilter; onSelect: (stat: LeadStatFilter) => void }) {
  const { t, i18n } = useTranslation();
  const cards = useMemo<Card[]>(() => {
    const now = new Date();
    const count = (stat: LeadStatFilter) => leads.filter(lead => matchesStat(lead, stat, now)).length;
    const valued = leads.filter(lead => isOpenLead(lead) && lead.leadValue != null && Number(lead.leadValue) > 0);
    const total = valued.length
      ? financialTotals(valued.map(lead => ({ amount: lead.leadValue!, currencyCode: lead.currencyCode })), i18n.language, t("core.currencyUnknown"))
      : "—";
    return [
      { key: "overdue", filter: "overdue", icon: AlertCircle, value: String(count("overdue")), hint: t("leadsLayout.statOverdueHint"), tone: TONES.overdue },
      { key: "uncontacted", filter: "uncontacted", icon: UserPlus, value: String(count("uncontacted")), hint: t("leadsLayout.statUncontactedHint"), tone: TONES.uncontacted },
      { key: "hot", filter: "hot", icon: Flame, value: String(count("hot")), hint: t("leadsLayout.statHotHint"), tone: TONES.hot },
      { key: "value", filter: "value", icon: Coins, value: total, hint: t("leadsLayout.statValueHint", { count: valued.length }), tone: TONES.value },
    ];
  }, [leads, t, i18n.language]);

  return (
    <section className="ld-stats" aria-label={t("leadsLayout.statsLabel")}>
      {cards.map(card => {
        const Icon = card.icon;
        const label = t(`leadsLayout.stat_${card.key}`);
        const body = <>
          <span className="ld-stat-head"><span className="ld-stat-label">{label}</span><span className="ld-stat-icon"><Icon aria-hidden="true" className="size-4" /></span></span>
          <span className="ld-stat-value">{card.value}</span>
          <span className="ld-stat-hint">{card.hint}</span>
        </>;
        // The pipeline value is a total, not a filter.
        if (card.filter === "value") return <div key={card.key} className={`ld-stat ${card.tone}`}>{body}</div>;
        const filter = card.filter;
        return <button key={card.key} type="button" className={`ld-stat ${card.tone}`} aria-pressed={active === filter}
          title={t("leadsLayout.statFilter")} onClick={() => onSelect(filter)}>{body}</button>;
      })}
    </section>
  );
}
