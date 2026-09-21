import { useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { useUser } from "@/providers/user.provider";
import { canViewInternalProjectFinancials } from "@/utils/projectFinancialAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState, TableSkeleton } from "@/components/skeletons";
import { ArrowLeft, ChartNoAxesCombined, Wallet, Receipt, Clock3, TrendingUp } from "lucide-react";
import { WorkspaceHeader, WorkspaceMetric, workspacePanel, workspaceToolbar } from "@/components/ui/workspace-page";

type Settings = { currency: string; hourlyCost: string | null };
export type ProfitabilityReport = {
  projectName: string; settings: Settings | null; revenue?: string; expenses?: string;
  laborCost?: string | null; estimatedProfit?: string | null; minutes?: number;
  unbilledMinutes?: number; unpricedMinutes?: number; unbilledValue?: string;
  incompleteEntries?: number; hiddenEntries?: number; complete?: boolean;
  otherCurrencies?: { currency: string; amount: string }[];
};

export default function ProjectProfitabilityPage() {
  const { id = "" } = useParams();
  const { data: user } = useUser();
  const allowed = canViewInternalProjectFinancials(user?.user);
  const scope = useDataScope();
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today.slice(0, 8) + "01");
  const [to, setTo] = useState(today);
  const [period, setPeriod] = useState({ from, to });
  const query = useQuery({
    queryKey: ["profitability", scope, id, period], enabled: allowed && !!id,
    queryFn: async () => (await axios.get<{ data: ProfitabilityReport }>(`/projects/${encodeURIComponent(id)}/profitability`, { params: period })).data.data,
  });
  if (!allowed) return <p className="p-6">{t("profitability.forbidden")}</p>;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 text-foreground">
    <Link className="inline-flex items-center gap-2 text-sm text-[#11718c] hover:underline dark:text-[#55bdd9]" to={`/dashboard/project/view/${id}`}><ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />{t("profitability.back")}</Link>
    <WorkspaceHeader icon={ChartNoAxesCombined} title={t("profitability.title")} description={query.data?.projectName} />
    <form className={workspaceToolbar} onSubmit={event => { event.preventDefault(); setPeriod({ from, to }); }}>
      <label className="text-sm">{t("profitability.from")}<Input type="date" required value={from} max={to} onChange={event => setFrom(event.target.value)} /></label>
      <label className="text-sm">{t("profitability.to")}<Input type="date" required value={to} min={from} onChange={event => setTo(event.target.value)} /></label>
      <Button type="submit" className="bg-[#11718c] text-white hover:bg-[#0e6078]">{t("profitability.apply")}</Button>
      <p className="basis-full text-xs leading-relaxed text-muted-foreground">{t("profitability.periodNote")}</p>
    </form>
    {query.isPending ? <TableSkeleton rows={3} columns={3} /> : query.isError ? <ErrorState title={t("profitability.error")} message={t("profitability.retry")} onRetry={() => void query.refetch()} /> : query.data && <>
      <ProfitabilityContent report={query.data} />
      <FinancialSettingsForm key={`${id}:${query.data.settings?.currency}:${query.data.settings?.hourlyCost}`} id={id} settings={query.data.settings} />
    </>}
  </main>;
}

export function ProfitabilityContent({ report }: { report: ProfitabilityReport }) {
  const { t, i18n } = useTranslation();
  if (!report.settings) return <p className="rounded-lg border border-border p-5 text-sm">{t("profitability.setup")}</p>;
  const currency = report.settings.currency;
  const money = (amount: string | null | undefined, unit = currency) => amount == null ? "—" : new Intl.NumberFormat(i18n.language, { style: "currency", currency: unit }).format(Number(amount));
  const hours = (minutes = 0) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(minutes / 60);
  return <section className="space-y-5" aria-label={t("profitability.title")}>
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {(["revenue", "expenses", "laborCost", "estimatedProfit"] as const).map((key, index) => <WorkspaceMetric key={key} icon={[Wallet, Receipt, Clock3, TrendingUp][index]} label={t(`profitability.${key}`)} featured={key === "estimatedProfit"}>{money(report[key])}</WorkspaceMetric>)}
    </dl>
    {!report.complete && <p role="status" className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">{t("profitability.incomplete")}</p>}
    <p className="text-sm text-muted-foreground">{t("profitability.formula")}</p>
    <dl className={`${workspacePanel} grid gap-5 p-5 text-sm sm:grid-cols-3 sm:gap-0 sm:[&>div]:px-5 sm:[&>div+div]:border-s sm:[&>div+div]:border-border [&_dt]:text-muted-foreground [&_dd]:text-xl [&_dd]:tabular-nums`}><div><dt>{t("profitability.hours")}</dt><dd className="mt-2 font-medium">{hours(report.minutes)}</dd></div><div><dt>{t("profitability.unbilledHours")}</dt><dd className="mt-2 font-medium">{hours(report.unbilledMinutes)}</dd></div><div><dt>{t("profitability.unbilledValue")}</dt><dd className="mt-2 font-medium">{money(report.unbilledValue)}</dd></div></dl>
    <p className="text-xs text-muted-foreground">{t("profitability.unbilledNote")}</p>
    {!!report.unpricedMinutes && <p className="text-sm">{t("profitability.unpriced", { hours: hours(report.unpricedMinutes) })}</p>}
    {!!report.incompleteEntries && <p className="text-sm">{t("profitability.unfinished", { count: report.incompleteEntries })}</p>}
    {!!report.hiddenEntries && <p className="text-sm">{t("profitability.hidden")}</p>}
    {!!report.otherCurrencies?.length && <div className="space-y-2 border-t border-border pt-4"><h2 className="text-sm font-medium">{t("profitability.otherCurrencies")}</h2>{report.otherCurrencies.map(row => <p key={row.currency} className="text-sm">{money(row.amount, row.currency)}</p>)}</div>}
  </section>;
}

function FinancialSettingsForm({ id, settings }: { id: string; settings: Settings | null }) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [currency, setCurrency] = useState(settings?.currency ?? "");
  const [cost, setCost] = useState(settings?.hourlyCost ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const save = useMutation({
    mutationFn: () => axios.put(`/projects/${encodeURIComponent(id)}/financial-settings`, { currency, hourlyCost: cost || null, confirmCurrency: confirmed }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["profitability"] }); setConfirmed(false); },
  });
  return <details open={!settings || undefined} className={`${workspacePanel} p-5`}><summary className="cursor-pointer text-sm font-medium text-[#11718c] dark:text-[#55bdd9]">{t("profitability.settings")}</summary>
    <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); if (!save.isPending) save.mutate(); }}>
      <p className="text-sm text-muted-foreground">{t("profitability.settingsNote")}</p>
      <fieldset disabled={save.isPending} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">{t("profitability.currency")}<Input required maxLength={3} pattern="[A-Z]{3}" placeholder="USD" value={currency} onChange={event => setCurrency(event.target.value.toUpperCase())} /></label>
        <label className="text-sm">{t("profitability.hourlyCost")}<Input inputMode="decimal" pattern="[0-9]{1,8}(\.[0-9]{1,2})?" value={cost} onChange={event => setCost(event.target.value)} /></label>
        <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1" />{t("profitability.confirm")}</label>
      </fieldset>
      {save.isError && <p role="alert" className="text-sm">{t("profitability.settingsError")}</p>}
      {save.isSuccess && <p role="status" className="text-sm">{t("profitability.saved")}</p>}
      <Button disabled={save.isPending} type="submit">{t("common.save")}</Button>
    </form>
  </details>;
}
