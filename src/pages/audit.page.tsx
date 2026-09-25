import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { History, Download, ArrowUpRight, ShieldCheck, RefreshCw } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceHeader, workspacePanel } from "@/components/ui/workspace-page";

export type AuditEvent = {
  id: string; actor_kind: "human" | "system" | "unknown"; actor_id: string | null;
  actor_name: string | null; action: string; resource_type: string; resource_id: string;
  project_id: string | null; project_name: string | null; operation_id: string; occurred_at: string;
  changes: Record<string, { before: unknown; after: unknown }>;
};
type Report = { events: AuditEvent[]; nextCursor: string | null };
type Filters = { from: string; to: string; person: string; action: string; resourceType: string; resourceId: string };
const resourceTypes = ["project", "delivery_review", "organization_membership", "organization_member", "change_request", "retainer"];
const actions = ["project.update", "delivery_review.insert", "delivery_review.update", "organization_membership.insert", "organization_membership.update", "organization_membership.delete", "organization_member.update", "change_request.requested", "change_request.analysis", "change_request.estimated", "change_request.approved", "change_request.rejected", "change_request.cancelled", "change_request.applied", "retainer.created", "retainer.state", "retainer.opened", "retainer.allocated", "retainer.removed", "retainer.adjusted", "retainer.closed", "retainer.decided"];
const selectClass = "mt-1 block h-9 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-[#1797ba]";

export default function AuditPage() {
  const { data } = useUser();
  const scope = useDataScope();
  const { t } = useTranslation();
  const [search] = useSearchParams();
  const user = data?.user;
  const allowed = user && (["superadmin", "subadmin"].includes(user.role) || (user.role === "user" && (user.isOrganizationOwner || user.isOrganizationManager)));
  const projectId = search.get("projectId") ?? "";
  return allowed ? <AuditWorkspace key={JSON.stringify([scope, projectId])} projectId={projectId} /> : <p className="p-6">{t("audit.forbidden")}</p>;
}

function AuditWorkspace({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const scope = useDataScope();
  const [draft, setDraft] = useState<Filters>(() => ({ from: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10), person: "", action: "", resourceType: "", resourceId: "" }));
  const [filters, setFilters] = useState(draft);
  const [invalid, setInvalid] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const exportController = useRef<AbortController | null>(null);
  useEffect(() => () => exportController.current?.abort(), []);
  const params = Object.fromEntries(Object.entries({ ...filters, projectId }).filter(([, value]) => value !== ""));
  const query = useInfiniteQuery({
    queryKey: ["audit", scope, params], initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => (await axios.get<{ data: Report }>("/audit", { params: { ...params, ...(pageParam ? { cursor: pageParam } : {}) }, signal })).data.data,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const events = query.data?.pages.flatMap(page => page.events) ?? [];
  async function download() {
    const controller = new AbortController();
    exportController.current?.abort(); exportController.current = controller;
    setExporting(true); setExportError("");
    try {
      const response = await axios.get<string>("/audit/export", { params, responseType: "text", signal: controller.signal });
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a"); link.href = url; link.download = `flowlio-audit-${filters.from}-${filters.to}.csv`;
      document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      if (controller.signal.aborted) return;
      const raw = (error as { response?: { data?: unknown } }).response?.data;
      let code = "";
      try { code = (typeof raw === "string" ? JSON.parse(raw) : raw)?.code ?? ""; } catch { /* generic error below */ }
      setExportError(code === "EXPORT_TOO_LARGE" ? "exportLimit" : "exportError");
    } finally { if (!controller.signal.aborted) setExporting(false); }
  }
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-foreground sm:px-6">
    {projectId && <Link to={`/dashboard/project/view/${encodeURIComponent(projectId)}`} className="inline-flex text-sm text-[#11718c] hover:underline dark:text-[#55bdd9]">{t("audit.back")}</Link>}
    <WorkspaceHeader icon={History} title={t("audit.title")} description={t("audit.description")} actions={<Button variant="outline" onClick={() => void download()} disabled={exporting || query.isPending || query.isError || !events.length}><Download className="size-4" aria-hidden="true" />{t(exporting ? "audit.exporting" : "audit.export")}</Button>} />
    <form className={`${workspacePanel} grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3`} onSubmit={event => {
      event.preventDefault();
      if (!draft.from || !draft.to || draft.from > draft.to || (Date.parse(draft.to) - Date.parse(draft.from)) / 86400000 > 366) { setInvalid(true); return; }
      setInvalid(false); setExportError(""); setFilters({ ...draft, person: draft.person.trim(), resourceId: draft.resourceId.trim() });
    }}>
      {(["from", "to"] as const).map(key => <label key={key} className="min-w-0 text-sm font-medium">{t(`audit.${key}`)}<Input className="mt-1 w-full min-w-0" type="date" required value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></label>)}
      <label className="text-sm font-medium">{t("audit.person")}<Input className="mt-1" maxLength={80} value={draft.person} onChange={e => setDraft({ ...draft, person: e.target.value })} /></label>
      <label className="text-sm font-medium">{t("audit.resource")}<select className={selectClass} value={draft.resourceType} onChange={e => setDraft({ ...draft, resourceType: e.target.value })}><option value="">{t("audit.all")}</option>{resourceTypes.map(type => <option key={type} value={type}>{t(`audit.resources.${type}`)}</option>)}</select></label>
      <label className="text-sm font-medium">{t("audit.action")}<select className={selectClass} value={draft.action} onChange={e => setDraft({ ...draft, action: e.target.value })}><option value="">{t("audit.all")}</option>{actions.map(action => <option key={action} value={action}>{t(`audit.actions.${action.replace(/\./g, "_")}`)}</option>)}</select></label>
      <label className="text-sm font-medium">{t("audit.resourceId")}<Input className="mt-1" maxLength={128} value={draft.resourceId} onChange={e => setDraft({ ...draft, resourceId: e.target.value })} /></label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3"><Button type="submit">{t("audit.apply")}</Button><p className="text-xs text-muted-foreground">{t("audit.periodNote")}</p></div>
      {invalid && <p role="alert" className="text-sm text-destructive sm:col-span-2 lg:col-span-3">{t("audit.invalidPeriod")}</p>}
    </form>
    {exportError && <p role="alert" className="text-sm text-destructive">{t(`audit.${exportError}`)}</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <section className={`${workspacePanel} min-w-0 overflow-hidden`} aria-labelledby="audit-history">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/30 p-5"><h2 id="audit-history" className="font-medium">{t("audit.history")}</h2><Button variant="ghost" size="sm" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw aria-hidden="true" className="size-4" />{t("audit.refresh")}</Button></div>
        {query.isPending ? <p role="status" className="p-6 text-sm text-muted-foreground">{t("audit.loading")}</p> : query.isError && !query.isFetchNextPageError ? <p role="alert" className="p-6 text-sm text-destructive">{t("audit.error")}</p> : <>
          {events.length ? <ol className="divide-y divide-border">{events.map(event => <AuditEntry key={event.id} event={event} />)}</ol> : <div className="space-y-2 p-10 text-center"><History className="mx-auto size-7 text-[#1797ba]" aria-hidden="true" /><p className="text-sm font-medium">{t("audit.empty")}</p><p className="text-sm text-muted-foreground">{t("audit.emptyHint")}</p></div>}
          {query.isFetchNextPageError && <p role="alert" className="p-5 text-sm text-destructive">{t("audit.error")}</p>}
          {query.hasNextPage && <div className="border-t border-border p-4 text-center"><Button variant="outline" disabled={query.isFetching} onClick={() => void query.fetchNextPage()}>{t(query.isFetchingNextPage ? "audit.loading" : "audit.more")}</Button></div>}
        </>}
      </section>
      <aside className="space-y-3 rounded-xl border border-[#1797ba]/20 bg-[#1797ba]/5 p-5"><ShieldCheck className="size-6 text-[#11718c] dark:text-[#55bdd9]" aria-hidden="true" /><h2 className="text-sm font-semibold">{t("audit.readOnly")}</h2><p className="text-sm leading-relaxed text-muted-foreground">{t("audit.coverage")}</p><p className="border-t border-[#1797ba]/15 pt-3 text-xs leading-relaxed text-muted-foreground">{t("audit.scope")}</p></aside>
    </div>
  </main>;
}

export function AuditEntry({ event }: { event: AuditEvent }) {
  const { t, i18n } = useTranslation();
  function value(input: unknown): string {
    if (input === null || input === undefined) return t("audit.noValue");
    if (typeof input === "boolean") return t(input ? "audit.yes" : "audit.no");
    return typeof input === "object" ? JSON.stringify(input, null, 2) : String(input);
  }
  return <li className="min-w-0 p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-1"><p className="break-words text-sm font-semibold">{t(`audit.actions.${event.action.replace(/\./g, "_")}`, { defaultValue: event.action })}</p><p className="break-all text-xs text-muted-foreground">{event.actor_kind === "human" ? (event.actor_name || event.actor_id || t("audit.unknown")) : t(`audit.${event.actor_kind}`)}</p></div>
      <time dateTime={event.occurred_at} className="text-xs tabular-nums text-muted-foreground">{new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" }).format(new Date(event.occurred_at))} UTC</time>
    </div>
    {event.project_id && <Link className="mt-3 inline-flex max-w-full items-center gap-1 text-sm text-[#11718c] hover:underline dark:text-[#55bdd9]" to={`/dashboard/project/view/${encodeURIComponent(event.project_id)}`}><span className="break-all">{event.project_name || event.project_id}</span><ArrowUpRight className="size-3 shrink-0" aria-hidden="true" /></Link>}
    <dl className="mt-4 space-y-3 border-s-2 border-[#1797ba]/30 ps-4">{Object.entries(event.changes).map(([field, change]) => <div key={field}>
      <dt className="mb-2 text-xs font-medium">{t(`audit.fields.${field}`, { defaultValue: field })}</dt>
      <dd className="grid min-w-0 gap-2 sm:grid-cols-2">{(["before", "after"] as const).map(side => <div key={side} className={`min-w-0 rounded-lg border p-3 ${side === "after" ? "border-[#1797ba]/20 bg-[#1797ba]/5" : "border-border bg-secondary/30"}`}><span className="block text-[11px] font-medium text-muted-foreground">{t(`audit.${side}`)}</span><pre className="mt-1 whitespace-pre-wrap break-all font-sans text-sm">{value(change[side])}</pre></div>)}</dd>
    </div>)}</dl>
    <details className="mt-4 text-xs text-muted-foreground"><summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1797ba]">{t("audit.references")}</summary><p className="mt-2 break-all">{t("audit.resourceId")}: {event.resource_id}</p><p className="mt-1 break-all">{t("audit.operation")}: {event.operation_id}</p></details>
  </li>;
}
