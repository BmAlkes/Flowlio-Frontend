import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { ArrowUpRight, Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { attentionSource, type AttentionItem } from "@/pages/attention.page";

export function AttentionPreview() {
 const { t } = useTranslation();
 const scope = useDataScope();
 const today = new Date().toISOString().slice(0, 10);
 const period = { from: today.slice(0, 8) + "01", to: today, week: today };
 const query = useQuery({ queryKey: ["attention-preview", scope, period], refetchInterval: 60000,
  queryFn: async ({ signal }) => (await axios.get<{ data: { items: AttentionItem[]; gaps: { financialProjects: number; unknownCapacity: number } } }>("/attention", { signal, params: { ...period, page: 1, type: "all", state: "active", assigned: "all" } })).data.data });
 return <section className="overflow-hidden rounded-xl border border-border bg-card">
  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
   <h2 className="flex items-center gap-2 text-base font-semibold"><Inbox className="size-4 text-primary" aria-hidden="true" />{t("attention.title")}</h2>
   <Button asChild variant="ghost" size="sm"><Link to="/dashboard/attention">{t("dashboard.openAttention")}<ArrowUpRight className="size-4" aria-hidden="true" /></Link></Button>
  </header>
  {query.isPending ? <p role="status" className="p-5 text-sm text-muted-foreground">{t("retainers.loading")}</p> : query.isError ? <div role="alert" className="space-y-3 p-5 text-sm"><p>{t("attention.error")}</p><Button variant="outline" onClick={() => void query.refetch()}>{t("attention.refresh")}</Button></div> : <>
   {query.data?.items.length ? <ul className="divide-y divide-border">{query.data.items.slice(0, 4).map(item => <li key={item.key}><Link className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary" to={attentionSource(item, period)}><span className="min-w-0 flex-1"><span className="block text-xs font-medium text-muted-foreground">{t(`attention.types.${item.type}`)}</span><span className="mt-1 block break-words text-sm font-medium">{item.title}</span></span><ArrowUpRight className="size-4 shrink-0 text-primary" aria-hidden="true" /></Link></li>)}</ul> : <div className="space-y-2 p-5"><p className="font-medium">{t("attention.empty")}</p><p className="text-sm text-muted-foreground">{t("attention.emptyHint")}</p></div>}
   <footer className="space-y-1 border-t border-border p-4 text-xs leading-5 text-muted-foreground"><p>{t("dashboard.attentionPreviewNote")}</p>{!!query.data?.gaps.financialProjects && <p>{t("attention.financialGaps", { count: query.data.gaps.financialProjects })}</p>}{!!query.data?.gaps.unknownCapacity && <p>{t("attention.capacityGaps", { count: query.data.gaps.unknownCapacity })}</p>}</footer>
  </>}
 </section>;
}
