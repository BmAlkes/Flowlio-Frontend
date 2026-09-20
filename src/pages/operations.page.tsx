import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { RefreshCw, Copy, AlertTriangle } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { ErrorState, TableSkeleton } from "@/components/skeletons";

export interface OperationalSummary {
  events: { id:string; source:string; code:string; route:string; correlationId:string; release:string; occurredAt:string; status:number|null }[];
  metrics: { source:string; requests:number; errors:number; averageMs:number; maxMs:number }[];
  alerts: { source:string; code:string }[];
}
export function OperationsContent({ data, refresh, refreshing=false }: { data:OperationalSummary; refresh:()=>void; refreshing?:boolean }) {
  const { t,i18n }=useTranslation();
  const [copied,setCopied]=useState("");
  const [copyError,setCopyError]=useState(false);
  const [source,setSource]=useState("all");
  const events=data.events.filter(event=>source==="all" || event.source===source);
  return <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 text-foreground">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div><h1 className="text-2xl font-medium tracking-tight">{t("operations.title")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("operations.window")}</p></div>
      <Button variant="outline" onClick={refresh} disabled={refreshing}><RefreshCw className="size-4 me-2" />{t("operations.refresh")}</Button>
    </header>
    {data.alerts.length>0 && <div role="status" className="my-5 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm"><AlertTriangle className="size-5 shrink-0 text-amber-600"/><div><p className="font-medium">{t("operations.attention")}</p><p className="mt-1 text-muted-foreground">{t("operations.action")}</p></div></div>}
    <div className="grid gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border border-b border-border sm:grid-cols-3">
      {["api","ui","job"].map(kind=>{const metric=data.metrics.find(row=>row.source===kind);return <section key={kind} className="py-5 sm:px-5 first:ps-0"><h2 className="text-sm font-medium text-[#1797ba]">{t("operations."+kind)}</h2>
        <p className="mt-2 text-sm">{kind === "ui" ? <>{data.events.filter(event=>event.source==="ui").length} {t("operations.recorded")}</> : metric ? <><span className="font-semibold tabular-nums">{metric.errors}</span> / {metric.requests} {t("operations.failed")}</> : t("operations.noMetrics")}</p>
        {metric && <p className="mt-1 text-xs text-muted-foreground">{t("operations.latency",{average:metric.averageMs,max:metric.maxMs})}</p>}
      </section>;})}
    </div>
    <section className="mt-7" aria-labelledby="failure-history">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="failure-history" className="text-base font-medium">{t("operations.history")}</h2>
        <label className="flex items-center gap-2 text-sm"><span>{t("operations.filter")}</span><select value={source} onChange={event=>setSource(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-[#1797ba]">
          {["all","api","ui","job"].map(kind=><option value={kind} key={kind}>{t("operations."+kind)}</option>)}
        </select></label>
      </div>
      {events.length===0 ? <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">{t("operations.empty")}</p> : <ul className="divide-y divide-border rounded-lg border border-border">
        {events.map(event=><li key={event.id} className="grid gap-3 p-4 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
          <div><p className="text-sm font-medium">{t("operations."+event.source)}</p><time dateTime={event.occurredAt} className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(i18n.language,{dateStyle:"short",timeStyle:"short"}).format(new Date(event.occurredAt))}</time></div>
          <div className="min-w-0"><p className="font-mono text-xs break-all" dir="ltr">{event.code} · {event.route}</p><p className="mt-1 font-mono text-xs text-muted-foreground break-all" dir="ltr">{event.correlationId}</p><p className="mt-1 text-xs text-muted-foreground">{t("operations.version")}: <span dir="ltr">{event.release.slice(0,12)}</span></p></div>
          <Button variant="ghost" className="justify-self-start sm:justify-self-end" aria-label={t("operations.copy")} onClick={()=>{void navigator.clipboard.writeText(event.correlationId).then(()=>{setCopied(event.id);setCopyError(false);}).catch(()=>setCopyError(true));}}><Copy className="size-4 me-2"/>{copied===event.id?t("operations.copied"):t("operations.copy")}</Button>
        </li>)}
      </ul>}
      <p className="mt-3 text-xs text-muted-foreground">{t("operations.limit")}</p>
      <span role="status" className="sr-only">{copyError?t("operations.copyError"):copied?t("operations.copied"):""}</span>
    </section>
  </main>;
}
export default function OperationsPage() {
  const {t}=useTranslation();
  const {isSuperAdmin}=useUser();
  const scope=useDataScope();
  const query=useQuery({queryKey:["operations",scope,isSuperAdmin],queryFn:async()=>
    (await axios.get<{data:OperationalSummary}>("/observability/summary",{params:isSuperAdmin?{scope:"global"}:{}})).data.data,staleTime:15000});
  if(query.isLoading) return <TableSkeleton rows={5} columns={3}/>;
  if(query.isError || !query.data) return <ErrorState title={t("operations.loadError")} message={t("operations.retry")} onRetry={()=>void query.refetch()}/>;
  return <OperationsContent data={query.data} refresh={()=>void query.refetch()} refreshing={query.isFetching}/>;
}
