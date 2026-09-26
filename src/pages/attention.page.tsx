import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Inbox, ArrowUpRight, Clock3, CheckCheck, UsersRound, FileText, Wallet, Settings2, RefreshCw, Info } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WorkspaceAside, WorkspaceMetric, WorkspaceHeader, workspacePage, workspacePanel } from "@/components/ui/workspace-page";

const types = ["approval", "unbilled", "capacity", "proposal", "budget"] as const;
type Kind = typeof types[number];
type Period = { from: string; to: string; week: string };
type Settings = { approvalDays: number; proposalDays: number; unbilledMinutes: number; budgetPercent: number };
export type AttentionItem = { key: string; type: Kind; title: string; resource_id: string; since: string; revision: string; assignee_id: string | null; assignee_name?: string | null; snoozed_until: string | null; details: { days?: number; threshold?: number; minutes?: number; available?: number; incomplete?: number; cost?: string; budget?: string; currency?: string; percent?: number } };
type Report = { items: AttentionItem[]; page: number; hasMore: boolean; settings: Settings; gaps: { financialProjects: number; unknownCapacity: number }; financial: boolean; week: { from: string; to: string } };
const selectClass = "block h-9 w-full rounded-md border border-border bg-background px-3 text-sm";
const symbols = { approval: CheckCheck, unbilled: Clock3, capacity: UsersRound, proposal: FileText, budget: Wallet };

export function attentionSource(item: AttentionItem, period: Period) {
  const id = encodeURIComponent(item.resource_id);
  if (item.type === "proposal") return `/dashboard/proposals?proposalId=${id}`;
  if (item.type === "capacity") return `/dashboard/team-capacity?week=${period.week}&userId=${id}`;
  if (item.type === "budget" || item.type === "unbilled") return `/dashboard/project/view/${id}/profitability?from=${period.from}&to=${period.to}`;
  return `/dashboard/project/view/${id}`;
}

export default function AttentionPage() {
  const { data } = useUser();
  const { t } = useTranslation();
  const scope = useDataScope();
  const user = data?.user;
  const allowed = user && (["superadmin", "subadmin"].includes(user.role) || (user.role === "user" && (user.isOrganizationOwner || user.isOrganizationManager)));
  return allowed ? <AttentionWorkspace key={JSON.stringify(scope)} /> : <p className="p-6">{t("attention.forbidden")}</p>;
}

function AttentionWorkspace() {
  const { t, i18n } = useTranslation();
  const scope = useDataScope();
  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState<Period>({ from: today.slice(0, 8) + "01", to: today, week: today });
  const [draft, setDraft] = useState(period);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [state, setState] = useState("active");
  const [assigned, setAssigned] = useState("all");
  const [search, setSearch] = useState("");
  const [grouped, setGrouped] = useState(false);
  const [editing, setEditing] = useState<AttentionItem | null>(null);
  const query = useQuery({ queryKey: ["attention", scope, period, page, type, state, assigned], refetchInterval: 60000,
    queryFn: async () => (await axios.get<{ data: Report }>("/attention", { params: { ...period, page, type, state, assigned } })).data.data });
  const number = (value: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(value);
  const describe = (item: AttentionItem) => {
    const d = item.details;
    return t(`attention.reason.${item.type}`, { ...d, hours: number((d.minutes ?? 0) / 60), available: number((d.available ?? 0) / 60), cost: d.currency ? new Intl.NumberFormat(i18n.language, { style: "currency", currency: d.currency }).format(Number(d.cost)) : d.cost });
  };
  const rows = (query.data?.items ?? []).filter(item => !search.trim() || `${item.title} ${item.assignee_name ?? ""} ${describe(item)}`.toLocaleLowerCase(i18n.language).includes(search.trim().toLocaleLowerCase(i18n.language)));
  const groups = grouped ? types.map(kind => ({ label: t(`attention.types.${kind}`), rows: rows.filter(row => row.type === kind) })).filter(group => group.rows.length) : [{ label: "", rows }];
  return <main className={workspacePage}>
    <WorkspaceHeader icon={Inbox} title={t("attention.title")} description={t("attention.description")} actions={<Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw aria-hidden="true" className="size-4" />{t("attention.refresh")}</Button>} />
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-4">
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <WorkspaceMetric icon={Inbox} label={t('workspace.loadedItems')} note={t('workspace.currentPage')} tone="rose">{query.data ? query.data.items.length : '—'}</WorkspaceMetric>
          <WorkspaceMetric icon={Wallet} label={t('attention.types.budget')} note={t('workspace.currentPage')} tone="amber">{query.data ? query.data.items.filter(i=>i.type==='budget').length : '—'}</WorkspaceMetric>
          <WorkspaceMetric icon={CheckCheck} label={t('attention.types.approval')} note={t('workspace.currentPage')} tone="violet">{query.data ? query.data.items.filter(i=>i.type==='approval').length : '—'}</WorkspaceMetric>
          <WorkspaceMetric icon={UsersRound} label={t('attention.unassigned')} note={t('workspace.currentPage')}>{query.data ? query.data.items.filter(i=>!i.assignee_id).length : '—'}</WorkspaceMetric>
        </dl>
        <form className={`${workspacePanel} space-y-4 p-4`} onSubmit={event => { event.preventDefault(); setPage(1); setPeriod(draft); }}>
          <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5 text-xs text-muted-foreground">{t('workspace.searchPage')}<Input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('workspace.searchPage')} /></label>
            {[["type", type, setType, ["all", ...types]], ["state", state, setState, ["active", "snoozed", "all"]], ["assigned", assigned, setAssigned, ["all", "mine", "unassigned"]]].map(([key, value, setter, options]) => <label key={key as string} className="space-y-1.5 text-xs text-muted-foreground">{t(`attention.${key as string}`)}<select className={selectClass} value={value as string} onChange={event => { (setter as (v: string) => void)(event.target.value); setPage(1); }}>{(options as string[]).map(option => <option key={option} value={option}>{t(`attention.${key === "type" && option !== "all" ? "types." : ""}${option}`)}</option>)}</select></label>)}
          </div>
          <div className="grid items-end gap-3 border-t border-border/60 pt-4 sm:grid-cols-3">{(["from", "to", "week"] as const).map(key => <label key={key} className="space-y-1.5 text-xs text-muted-foreground">{t(`attention.${key}`)}<Input type="date" required value={draft[key]} onChange={event => setDraft({ ...draft, [key]: event.target.value })} /></label>)}</div>
          <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={grouped} onChange={event => setGrouped(event.target.checked)} />{t("attention.group")}</label><Button type="submit">{t("attention.apply")}</Button></div>
          <p className="text-xs leading-relaxed text-muted-foreground">{t("attention.periodNote")}</p>
        </form>
        <section className={`${workspacePanel} overflow-hidden`}>
          <header className="flex flex-wrap items-center justify-between gap-3 p-4"><h2 className="text-sm font-semibold">{t('workspace.visibleItems',{count:rows.length})}</h2><span className="text-xs text-muted-foreground">{t('workspace.currentPage')}</span></header>
          {query.isPending ? <p role="status" className="p-6">{t("common.loading")}</p> : query.isError ? <p role="alert" className="p-5">{t("attention.error")}</p> : !rows.length ? <div className="p-10 text-center"><Inbox aria-hidden="true" className="mx-auto mb-4 size-8 text-primary" /><h3 className="font-medium">{t("attention.empty")}</h3><p className="mt-2 text-sm text-muted-foreground">{t("attention.emptyHint")}</p></div> : <div className="overflow-x-auto px-4" role="region" aria-label={t('attention.title')} tabIndex={0}>
            <table className="w-full min-w-[740px] text-sm"><caption className="sr-only">{t('attention.title')}</caption><thead className="bg-slate-50 text-xs text-muted-foreground dark:bg-secondary/50"><tr>{['item','issue','type','assignee','actions'].map(k=><th key={k} scope="col" className="px-3 py-3 text-start font-medium first:rounded-s-lg last:rounded-e-lg">{t(`workspace.${k}`)}</th>)}</tr></thead>
            {groups.map(group=><tbody key={group.label} className="divide-y divide-border/60">{group.label&&<tr><th colSpan={5} className="bg-secondary/30 px-3 py-2 text-start text-xs font-semibold">{group.label}</th></tr>}{group.rows.map(item=>{const Icon=symbols[item.type];return <tr key={item.key} className="align-top transition-colors hover:bg-sky-50/40 dark:hover:bg-secondary/30">
              <th scope="row" className="max-w-64 px-3 py-4 text-start font-medium"><div className="flex items-start gap-3"><span className="rounded-md bg-sky-50 p-1.5 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Icon className="size-4" aria-hidden="true"/></span><span className="break-words">{item.title}<span className="mt-1 block text-xs font-normal text-muted-foreground">{new Date(item.since).toLocaleDateString(i18n.language)}</span></span></div></th>
              <td className="max-w-72 px-3 py-4"><p className="text-xs leading-5">{describe(item)}</p>{!!item.details.incomplete&&<p className="mt-1 text-xs text-muted-foreground">{t('attention.partial')}</p>}{item.snoozed_until&&<p className="mt-1 text-xs text-muted-foreground">{t('attention.snoozedUntil',{date:new Date(item.snoozed_until).toLocaleString(i18n.language)})}</p>}</td>
              <td className="px-3 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${item.type==='budget'||item.type==='capacity'?'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300':'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'}`}><Icon aria-hidden="true" className="size-3"/>{t(`attention.types.${item.type}`)}</span></td>
              <td className="px-3 py-4"><div className="flex items-center gap-2"><span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">{item.assignee_name?item.assignee_name.split(/\s+/).slice(0,2).map(p=>p[0]).join(''):'—'}</span><span className="text-xs">{item.assignee_id?item.assignee_name??t('attention.currentAssignee'):t('attention.unassigned')}</span></div></td>
              <td className="px-3 py-3"><div className="flex flex-col items-start gap-1"><Button size="sm" variant="outline" asChild><Link to={attentionSource(item,period)}>{t('attention.openSource')}<ArrowUpRight aria-hidden="true" className="size-3"/></Link></Button><Button size="sm" variant="ghost" onClick={()=>setEditing(item)}>{t(item.assignee_id?'attention.manage':'attention.assign')}</Button></div></td>
            </tr>;})}</tbody>)}
            </table>
          </div>}
          <nav aria-label={t("attention.pagination")} className="flex items-center justify-between gap-3 p-4"><Button variant="outline" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>{t("attention.previous")}</Button><span className="text-xs">{t("attention.page", { page })}</span><Button variant="outline" disabled={!query.data?.hasMore || query.isFetching} onClick={() => setPage(page + 1)}>{t("attention.next")}</Button></nav>
        </section>
      </div>
      <aside className="min-w-0 space-y-4">{query.data&&<><WorkspaceAside icon={Info} title={t('attention.coverage')}><p>{t('attention.coverageNote')}</p><div className="space-y-3 border-y border-border/60 py-4"><p>{t('attention.financialGaps',{count:query.data.gaps.financialProjects})}</p><p>{t('attention.capacityGaps',{count:query.data.gaps.unknownCapacity})}</p></div><p className="text-xs">{t('attention.capacityWeek')}<span className="mt-1 block" dir="ltr">{query.data.week.from} — {query.data.week.to}</span></p><p className="text-xs">{t('workspace.updated')}<span className="mt-1 block">{new Date(query.dataUpdatedAt).toLocaleString(i18n.language)}</span></p></WorkspaceAside><AttentionSettings key={JSON.stringify(query.data.settings)} settings={query.data.settings}/></>}</aside>
    </div>

    <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogTitle>{t("attention.manage")}</DialogTitle><DialogDescription>{editing?.title}</DialogDescription>{editing && <TriageForm key={editing.key} item={editing} period={period} onSaved={() => setEditing(null)} />}</DialogContent></Dialog>
  </main>;
}

function AttentionSettings({ settings }: { settings: Settings }) {
  const { t } = useTranslation(); const client = useQueryClient(); const [draft, setDraft] = useState(settings);
  const mutation = useMutation({ mutationFn: () => axios.put("/attention/settings", draft), onSuccess: () => client.invalidateQueries({ queryKey: ["attention"] }) });
  return <details className={`${workspacePanel} p-5`}><summary className="cursor-pointer text-sm font-medium"><Settings2 aria-hidden="true" className="me-2 inline size-4 text-[#1797ba]" />{t("attention.settings")}</summary><form className="mt-4 space-y-3" onSubmit={event => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }}><fieldset disabled={mutation.isPending} className="space-y-3">{(Object.keys(settings) as (keyof Settings)[]).map(key => <label key={key} className="block space-y-2 text-sm">{t(`attention.${key}`)}<Input type="number" required min={key === "approvalDays" ? 0 : 1} max={key === "unbilledMinutes" ? 60000 : key === "budgetPercent" ? 500 : 365} value={draft[key]} onChange={event => setDraft({ ...draft, [key]: Number(event.target.value) })} /></label>)}<Button type="submit">{t("common.save")}</Button></fieldset>{mutation.isError && <p role="alert" className="text-sm">{t("attention.saveError")}</p>}</form></details>;
}

function TriageForm({ item, period, onSaved }: { item: AttentionItem; period: Period; onSaved: () => void }) {
  const { t } = useTranslation(); const scope = useDataScope(); const client = useQueryClient();
  const [search, setSearch] = useState(""); const [assigneeId, setAssignee] = useState(item.assignee_id ?? ""); const [days, setDays] = useState("keep");
  const members = useQuery({ queryKey: ["attention-members", scope, search], queryFn: async () => (await axios.get<{ data: { id: string; name: string }[] }>("/attention/members", { params: { search } })).data.data });
  const mutation = useMutation({ mutationFn: () => axios.put("/attention/triage", { period, key: item.key, revision: item.revision, assigneeId: assigneeId || null, snoozedUntil: days === "keep" ? item.snoozed_until : days === "0" ? null : new Date(Date.now() + Number(days) * 86400000).toISOString() }), onSuccess: () => { void client.invalidateQueries({ queryKey: ["attention"] }); onSaved(); } });
  return <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }}><fieldset disabled={mutation.isPending} className="space-y-4"><label className="block space-y-2 text-sm">{t("attention.searchMember")}<Input value={search} maxLength={80} onChange={event => setSearch(event.target.value)} /></label><label className="block space-y-2 text-sm">{t("attention.assigned")}<select className={selectClass} value={assigneeId} onChange={event => setAssignee(event.target.value)}><option value="">{t("attention.unassigned")}</option>{assigneeId && !members.data?.some(member => member.id === assigneeId) && <option value={assigneeId}>{item.assignee_name ?? t("attention.currentAssignee")}</option>}{members.data?.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>{members.isError && <p role="alert">{t("attention.error")}</p>}<label className="block space-y-2 text-sm">{t("attention.snooze")}<select className={selectClass} value={days} onChange={event => setDays(event.target.value)}><option value="keep">{t("attention.keep")}</option><option value="0">{t("attention.reactivate")}</option>{[1, 3, 7, 30].map(value => <option key={value} value={value}>{t("attention.days", { count: value })}</option>)}</select></label><p className="text-xs leading-relaxed text-muted-foreground">{t("attention.triageNote")}</p><Button type="submit">{t("common.save")}</Button></fieldset>{mutation.isError && <p role="alert" className="text-sm">{t("attention.saveError")}</p>}</form>;
}

