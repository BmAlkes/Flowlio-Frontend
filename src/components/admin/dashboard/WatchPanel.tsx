import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { useProjectRiskAlerts } from "@/hooks/useProjectRiskAlerts";
import type { AttentionItem } from "@/pages/attention.page";

type Attention = { items: AttentionItem[]; gaps: { financialProjects: number; unknownCapacity: number } };

// One line per watcher: quiet when nothing needs a look, a count and a way in when something does.
export function WatchPanel() {
  const { t } = useTranslation();
  const scope = useDataScope();
  const today = new Date().toISOString().slice(0, 10);
  const period = { from: today.slice(0, 8) + "01", to: today, week: today };
  const attention = useQuery({ queryKey: ["attention-preview", scope, period], refetchInterval: 60000,
    queryFn: async ({ signal }) => (await axios.get<{ data: Attention }>("/attention", { signal, params: { ...period, page: 1, type: "all", state: "active", assigned: "all" } })).data.data });
  const risks = useProjectRiskAlerts();
  const riskCount = risks.data?.data?.length ?? 0;
  const items = attention.data?.items.length ?? 0;
  const gaps = attention.data?.gaps.financialProjects ?? 0;
  const attentionText = attention.isPending ? "…" : attention.isError ? t("dashboard.home.unavailable")
    : items ? t("dashboard.home.itemsCount", { count: items }) : gaps ? t("dashboard.home.budgetGaps", { count: gaps }) : t("dashboard.home.nothing");

  return <section className="home-panel p-5" aria-labelledby="home-watch-title">
    <h2 id="home-watch-title" className="home-title mb-1">{t("dashboard.home.watch")}</h2>
    <ul>
      <li className="home-watch-row">
        <span className="home-dot" data-tone={riskCount ? "warn" : "ok"} />
        <span className="flex-1">{t("dashboard.home.projectsAtRisk")}</span>
        <span className={riskCount ? "home-warn font-semibold" : "text-muted-foreground"}>{risks.isPending && risks.fetchStatus !== "idle" ? "…" : riskCount ? riskCount : t("dashboard.home.none")}</span>
      </li>
      <li className="home-watch-row">
        <span className="home-dot" data-tone={items ? "warn" : gaps ? "info" : "ok"} />
        <Link to="/dashboard/attention" className="flex flex-1 items-center gap-1 whitespace-nowrap hover:underline">{t("attention.title")}<ArrowUpRight className="size-3.5 shrink-0 opacity-60" aria-hidden="true" /></Link>
        <span className={`text-end ${items ? "home-warn font-semibold" : gaps ? "text-[#8A5A0A] dark:text-[#F2BC3F]" : "text-muted-foreground"}`}>{attentionText}</span>
      </li>
    </ul>
  </section>;
}
