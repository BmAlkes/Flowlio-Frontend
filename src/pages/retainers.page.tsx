import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CalendarRange, Plus, RefreshCw, LockKeyhole, ArrowUpRight } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";
import { useDataScope } from "@/hooks/useDataScope";
import { WorkspaceHeader, workspacePanel } from "@/components/ui/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Totals = { included: number; carried: number; used: number; remaining: number; overage: number };
type Lot = { source: string; minutes: number; expires: string };
export type Period = { id: string; month: string; state: string; revision: number; starts_at: string; ends_at: string; carry: Lot[]; totals: Totals; decision: string | null; decision_note: string | null; statement: { carryOut: Lot[]; overageAmount?: string; billing?: { id: string; currency: string; monthlyAmount: string; overageAmount: string; recurringId: string | null } } | null };
export type Retainer = { id: string; name: string; state: string; revision: number; currency?: string; monthly_amount?: string; included_minutes: number; timezone: string; start_month: string; end_month: string | null; renewal: string; carry_policy: string; carry_cap: number; carry_months: number; overage_policy: string; overage_rate?: string; recurring_id?: string | null; latest: Period | null };
type Entry = { id: string; time_entry_id: string | null; source_entry_id: string | null; minutes: number; kind: string; label: string; started_at: string | null };
type Template = { id: string; template_name: string; amount: string };
type Report = { client: { id: string; name: string }; items: Retainer[]; hasMore: boolean; canManage: boolean; canDecide: boolean; templates: Template[] };
type Detail = { contract: Retainer; periods: { id: string; month: string; state: string }[]; hasMorePeriods: boolean; period: Period; entries: Entry[]; hasMoreEntries: boolean };
type Candidate = { id: string; minutes: number; project: string; startedAt: string; version: string };
const fieldClass = "mt-1 block w-full min-w-0 rounded-md border border-border bg-background p-2 text-sm focus-visible:outline-2 focus-visible:outline-[#1797ba]";
const hour = (minutes: number) => `${minutes < 0 ? "−" : ""}${Math.floor(Math.abs(minutes) / 60)}h ${String(Math.abs(minutes) % 60).padStart(2, "0")}m`;
const followingMonth = (value: string) => { const d = new Date(value + "-01T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + 1); return d.toISOString().slice(0, 7); };

export default function RetainersPage() {
  const { clientId = "me" } = useParams(); const scope = useDataScope(); const { data } = useUser(); const { t } = useTranslation(); const user = data?.user;
  const allowed = user && (user.role === "client" || ["superadmin", "subadmin"].includes(user.role) || (user.role === "user" && (user.isOrganizationOwner || user.isOrganizationManager)));
  return allowed ? <RetainerWorkspace key={JSON.stringify([scope, clientId])} clientId={clientId} portal={user.role === "client"} /> : <p className="p-6">{t("retainers.forbidden")}</p>;
}
function RetainerWorkspace({ clientId, portal }: { clientId: string; portal: boolean }) {
  const { t } = useTranslation(); const scope = useDataScope(); const cache = useQueryClient(); const [page, setPage] = useState(1); const [selected, setSelected] = useState<string | null>(null); const [creating, setCreating] = useState(false);
  const path = `/clients/${encodeURIComponent(clientId)}/retainers`;
  const query = useQuery({ queryKey: ["retainers", scope, clientId, page], queryFn: async ({ signal }) => (await axios.get<{ data: Report }>(path, { params: { page }, signal })).data.data });
  const report = query.data;
  const active = selected && report?.items.some(r => r.id === selected) ? selected : report?.items[0]?.id;
  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 text-foreground sm:px-6">
    <Link className="inline-flex items-center gap-2 text-sm text-[#11718c] hover:underline dark:text-[#55bdd9]" to={portal ? "/clients" : `/dashboard/client-management/${encodeURIComponent(clientId)}`}><ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />{t("retainers.back")}</Link>
    <WorkspaceHeader icon={CalendarRange} title={t(portal ? "retainers.portalTitle" : "retainers.title")} description={report?.client.name || t("retainers.description")} actions={<>{report?.canManage && <Button onClick={() => setCreating(true)}><Plus className="size-4" aria-hidden="true" />{t("retainers.create")}</Button>}<Button variant="outline" disabled={query.isFetching} onClick={() => { void query.refetch(); void cache.invalidateQueries({ queryKey: ["retainer-detail"] }); }} aria-label={t("retainers.refresh")}><RefreshCw className="size-4" aria-hidden="true" /></Button></>} />
    {query.isPending ? <p role="status">{t("retainers.loading")}</p> : query.isError ? <p role="alert" className="text-destructive">{t("retainers.error")}</p> : report && <>
      {!report.items.length ? <div className={`${workspacePanel} space-y-3 p-10 text-center`}><CalendarRange className="mx-auto size-9 text-[#1797ba]" aria-hidden="true" /><h2 className="font-semibold">{t("retainers.empty")}</h2><p className="text-sm text-muted-foreground">{t(portal ? "retainers.emptyPortal" : "retainers.emptyHint")}</p></div> : <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-3"><h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("retainers.contracts")}</h2>
          {report.items.map(r => <button key={r.id} onClick={() => setSelected(r.id)} aria-pressed={active === r.id} className={`w-full rounded-xl border p-4 text-start focus-visible:outline-2 focus-visible:outline-[#1797ba] ${active === r.id ? "border-[#1797ba]/50 bg-[#1797ba]/10" : "border-border bg-card hover:bg-secondary/40"}`}><span className="block break-words text-sm font-semibold">{r.name}</span><span className="mt-2 block text-xs text-muted-foreground">{t(`retainers.${r.state}`)} · {hour(r.included_minutes)}/{t("retainers.month")}</span>{r.latest && <span className="mt-3 block text-xs tabular-nums">{r.latest.month} · {t("retainers.used")} {hour(r.latest.totals.used)}</span>}</button>)}
          <Pager page={page} more={report.hasMore} change={n => { setPage(n); setSelected(null); }} />
        </aside>
        {active && <ContractDetail key={`${active}:${scope}`} id={active} path={path} canManage={report.canManage} canDecide={report.canDecide} />}
      </div>}
      {creating && <Modal title={t("retainers.create")} description={t("retainers.createHint")} close={() => setCreating(false)}><CreateContract path={path} templates={report.templates} close={() => setCreating(false)} /></Modal>}
    </>}
  </main>;
}
function Pager({ page, more, change }: { page: number; more: boolean; change: (n: number) => void }) {
  const { t } = useTranslation(); return <nav className="flex flex-wrap items-center justify-between gap-2 pt-2" aria-label={t("retainers.pagination")}><Button size="sm" variant="outline" disabled={page === 1} onClick={() => change(page - 1)}>{t("retainers.previous")}</Button><span className="text-xs tabular-nums">{page}</span><Button size="sm" variant="outline" disabled={!more} onClick={() => change(page + 1)}>{t("retainers.next")}</Button></nav>;
}
function Modal({ title, description, close, children }: { title: string; description: string; close: () => void; children: ReactNode }) {
  return <Dialog open onOpenChange={open => { if (!open) close(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription>{children}</DialogContent></Dialog>;
}
function ErrorMessage({ error }: { error: unknown }) {
  const { t } = useTranslation(); const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
  return error ? <p role="alert" className="text-sm text-destructive">{t(`retainers.errors.${code}`, { defaultValue: t("retainers.saveError") })}</p> : null;
}
function useSave(path: string, close: () => void) {
  const cache = useQueryClient(); return useMutation({ mutationFn: (payload: unknown) => axios.post(path, payload), onSuccess: close, onSettled: () => { void cache.invalidateQueries({ queryKey: ["retainers"] }); void cache.invalidateQueries({ queryKey: ["retainer-detail"] }); void cache.invalidateQueries({ queryKey: ["retainer-time"] }); void cache.invalidateQueries({ queryKey: ["billable-time"] }); } });
}
function Consumption({ period }: { period: Period }) {
  const { t } = useTranslation(); const total = period.totals; const allowance = total.included + total.carried; const percentage = allowance ? Math.min(100, total.used / allowance * 100) : 0;
  return <section className="space-y-5 border-y border-border bg-secondary/20 p-5 sm:p-6" aria-label={t("retainers.consumption")}>
    <div className="flex flex-wrap items-baseline justify-between gap-3"><h3 className="text-sm font-semibold">{t("retainers.consumption")}</h3><span className="text-xs tabular-nums text-muted-foreground">{hour(total.used)} / {hour(allowance)}</span></div>
    <div role="progressbar" aria-label={t("retainers.consumption")} aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${hour(total.used)} / ${hour(allowance)}`} className="h-3 overflow-hidden rounded-full bg-[#1797ba]/15"><div className={`h-full rounded-full ${total.overage ? "bg-amber-500" : "bg-[#1797ba]"}`} style={{ width: `${percentage}%` }} /></div>
    <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">{(["included", "carried", "remaining", "overage"] as const).map(key => <div key={key}><dt className="text-xs text-muted-foreground">{t(`retainers.${key}`)}</dt><dd className={`mt-1 text-lg font-medium tabular-nums ${key === "overage" && total.overage ? "text-amber-700 dark:text-amber-300" : ""}`} dir="ltr">{hour(total[key])}</dd></div>)}</dl>
    {percentage >= 80 && <p role="status" className="text-xs font-medium text-amber-700 dark:text-amber-300">{t(total.overage ? "retainers.overageAlert" : "retainers.consumptionAlert")}</p>}
  </section>;
}
type Action = "allocate" | "remove" | "adjust" | "close" | "decide" | "open" | "state";
function ContractDetail({ id, path, canManage, canDecide }: { id: string; path: string; canManage: boolean; canDecide: boolean }) {
  const { t, i18n } = useTranslation(); const scope = useDataScope(); const [periodPage, setPeriodPage] = useState(1); const [entryPage, setEntryPage] = useState(1); const [periodId, setPeriodId] = useState<string>(); const [modal, setModal] = useState<{ action: Action; entry?: Entry; state?: string; decision?: string; contract: Retainer; period: Period } | null>(null);
  const query = useQuery({ queryKey: ["retainer-detail", scope, id, periodPage, periodId, entryPage], queryFn: async ({ signal }) => (await axios.get<{ data: Detail }>(`${path}/${id}`, { params: { periodPage, periodId, entryPage }, signal })).data.data });
  if (query.isPending) return <p role="status">{t("retainers.loading")}</p>;
  if (query.isError) return <div className="space-y-3"><p role="alert">{t("retainers.error")}</p><Button variant="outline" onClick={() => void query.refetch()}>{t("retainers.refresh")}</Button></div>;
  const { contract: r, period: p, periods, entries } = query.data; const billing = p.statement?.billing;
  const openModal = (value: { action: Action; entry?: Entry; state?: string; decision?: string }) => setModal({ ...value, contract: r, period: p });
  return <article className={`${workspacePanel} min-w-0 overflow-hidden`}>
    <header className="space-y-4 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-xl font-semibold">{r.name}</h2><p className="mt-1 text-xs text-muted-foreground">{r.start_month} → {r.end_month || t("retainers.noEnd")} · {r.timezone}</p></div><span className="rounded-md bg-[#1797ba]/10 px-2 py-1 text-xs font-medium text-[#11718c] dark:text-[#55bdd9]">{t(`retainers.${r.state}`)}</span></div>
      <div className="flex flex-wrap items-end justify-between gap-3"><label className="block min-w-0 text-xs text-muted-foreground">{t("retainers.period")}<select className={fieldClass} value={p.id} onChange={e => { setPeriodId(e.target.value); setEntryPage(1); }}>{periods.map(item => <option key={item.id} value={item.id}>{item.month} · {t(`retainers.${item.state}`)}</option>)}</select></label>{r.monthly_amount !== undefined && <p className="text-sm font-medium tabular-nums" dir="ltr">{r.monthly_amount} {r.currency} / {t("retainers.month")}</p>}</div>
      {(periodPage > 1 || query.data.hasMorePeriods) && <Pager page={periodPage} more={query.data.hasMorePeriods} change={n => { setPeriodPage(n); setPeriodId(undefined); setEntryPage(1); }} />}
    </header>
    <Consumption period={p} />
    <section className="space-y-4 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold">{t("retainers.ledger")}</h3>{canManage && p.state === "open" && r.state === "active" && <Button size="sm" variant="outline" onClick={() => openModal({ action: "allocate" })}><Plus className="size-4" aria-hidden="true" />{t("retainers.allocate")}</Button>}</div>
      {entries.length === 0 && <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">{t("retainers.noEntries")}</p>}
      <ul className="divide-y divide-border">{entries.map(entry => <li key={entry.id} className="flex flex-wrap items-start justify-between gap-3 py-4"><div className="min-w-0 flex-1 basis-36"><p className="break-words text-sm font-medium">{entry.label}</p><p className="mt-1 text-xs text-muted-foreground">{t(`retainers.${entry.kind}`)}{entry.started_at && ` · ${new Intl.DateTimeFormat(i18n?.resolvedLanguage, { dateStyle: "medium", timeStyle: "short", timeZone: r.timezone }).format(new Date(entry.started_at))}`}</p><p className="mt-1 break-all text-[11px] text-muted-foreground">{t("retainers.reference")}: {entry.source_entry_id || entry.time_entry_id || entry.id}</p></div><span className="text-sm font-semibold tabular-nums" dir="ltr">{hour(entry.minutes)}</span>{canManage && p.state === "open" && entry.kind === "time" && <Button size="sm" variant="ghost" onClick={() => openModal({ action: "remove", entry })}>{t("retainers.remove")}</Button>}</li>)}</ul>
      <Pager page={entryPage} more={query.data.hasMoreEntries} change={setEntryPage} />
    </section>
    <section className="space-y-3 border-t border-border bg-secondary/10 p-5 text-sm sm:p-6"><h3 className="flex items-center gap-2 font-semibold"><LockKeyhole className="size-4 text-[#1797ba]" aria-hidden="true" />{t("retainers.rules")}</h3><p className="text-muted-foreground">{t(`retainers.${r.renewal}`)} · {t(`retainers.${r.carry_policy}`)}{r.carry_policy === "carry" && `: ${hour(r.carry_cap)} / ${r.carry_months} ${t("retainers.months")}`}</p><p className="text-muted-foreground">{t(`retainers.${r.overage_policy}`)}{r.overage_rate !== undefined && r.overage_policy === "approval" && ` · ${r.overage_rate} ${r.currency}/h`}</p>
      {!!p.carry.length && <ul className="space-y-1 text-xs text-muted-foreground">{p.carry.map(lot => <li key={lot.source}>{hour(lot.minutes)} · {t("retainers.expires")}: {lot.expires}</li>)}</ul>}
      {billing && <div className="space-y-2 rounded-lg border border-[#1797ba]/25 bg-[#1797ba]/5 p-4"><h4 className="font-semibold">{t("retainers.billingDraft")}</h4><p>{t("retainers.monthlyAmount")}: <span dir="ltr">{billing.monthlyAmount} {billing.currency}</span>{billing.recurringId && ` · ${t("retainers.recurringOwnsFee")}`}</p><p>{t("retainers.overage")}: <span dir="ltr">{billing.overageAmount} {billing.currency}</span> · {t(`retainers.${p.decision}`)}</p>{p.decision_note && <p className="break-words text-muted-foreground">{p.decision_note}</p>}<p className="text-xs text-muted-foreground">{t("retainers.billingNote")}</p><p className="break-all text-xs text-muted-foreground">{t("retainers.reference")}: {billing.id}</p>{canDecide && p.decision === "awaiting" && <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => openModal({ action: "decide", decision: "approved" })}>{t("retainers.approve")}</Button><Button size="sm" variant="outline" onClick={() => openModal({ action: "decide", decision: "rejected" })}>{t("retainers.reject")}</Button></div>}</div>}
    </section>
    {canManage && <footer className="flex flex-wrap gap-2 border-t border-border p-4">
      {p.state === "open" && <><Button size="sm" disabled={new Date(p.ends_at).getTime() > Date.now()} onClick={() => openModal({ action: "close" })}>{t("retainers.close")}</Button>{r.state === "active" && <Button size="sm" variant="outline" onClick={() => openModal({ action: "adjust" })}>{t("retainers.adjust")}</Button>}</>}
      {p.state === "closed" && r.state === "active" && (!r.end_month || followingMonth(p.month) <= r.end_month) && p.id === periods[0]?.id && periodPage === 1 && <Button size="sm" onClick={() => openModal({ action: "open" })}>{t("retainers.openPeriod")}<ArrowUpRight className="size-4" aria-hidden="true" /></Button>}
      {r.state !== "cancelled" && <><Button size="sm" variant="ghost" onClick={() => openModal({ action: "state", state: r.state === "active" ? "paused" : "active" })}>{t(r.state === "active" ? "retainers.pause" : "retainers.resume")}</Button><Button size="sm" variant="ghost" onClick={() => openModal({ action: "state", state: "cancelled" })}>{t("retainers.cancel")}</Button></>}
    </footer>}
    {modal && <Modal title={t(`retainers.${modal.action}`)} description={`${modal.contract.name} · ${modal.period.month}`} close={() => setModal(null)}><CommandForm key={`${modal.period.id}:${modal.action}`} path={`${path}/${id}`} r={modal.contract} p={modal.period} action={modal.action} entry={modal.entry} state={modal.state} decision={modal.decision} close={() => setModal(null)} /></Modal>}
  </article>;
}
function Field({ name, label, type = "text", required = true, ...props }: { name: string; label: string; type?: string; required?: boolean; min?: number; max?: number; maxLength?: number; step?: string; pattern?: string; defaultValue?: string }) {
  return <label className="block min-w-0 text-sm">{label}<Input className="mt-1 min-w-0" name={name} type={type} required={required} {...props} /></label>;
}
function Choice({ name, options, onChange }: { name: string; options: string[]; onChange?: (value: string) => void }) {
  const { t } = useTranslation(); return <label className="block text-sm">{t(`retainers.${name}`)}<select className={fieldClass} name={name} required defaultValue="" onChange={e => onChange?.(e.target.value)}><option value="" disabled>{t("retainers.choose")}</option>{options.map(value => <option key={value} value={value}>{t(`retainers.${value}`)}</option>)}</select></label>;
}
function CreateContract({ path, templates, close }: { path: string; templates: Template[]; close: () => void }) {
  const { t } = useTranslation(); const [id] = useState(() => crypto.randomUUID()); const [carry, setCarry] = useState(""); const [overage, setOverage] = useState(""); const mutation = useSave(path, close);
  return <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); const val = (key: string) => String(f.get(key) || ""); mutation.mutate({ id, name: val("name"), currency: val("currency"), monthlyAmount: val("monthlyAmount"), includedMinutes: Number(val("includedHours")) * 60, timezone: val("timezone"), startMonth: val("startMonth"), endMonth: val("endMonth") || null, renewal: val("renewal"), carryPolicy: carry, carryCap: carry === "carry" ? Number(val("carryHours")) * 60 : 0, carryMonths: carry === "carry" ? Number(val("carryMonths")) : 0, overagePolicy: overage, overageRate: overage === "approval" ? val("overageRate") : "0", recurringId: val("recurringId") === "manual" ? null : val("recurringId"), confirm: true }); }}>
    <fieldset className="space-y-4" disabled={mutation.isPending}><Field name="name" label={t("retainers.name")} maxLength={160} /><div className="grid gap-4 sm:grid-cols-2"><Field name="currency" label={t("retainers.currency")} pattern="[A-Z]{3}" maxLength={3} /><Field name="monthlyAmount" label={t("retainers.monthlyAmount")} pattern="[0-9]{1,8}(\.[0-9]{1,2})?" /><Field name="includedHours" label={t("retainers.includedHours")} type="number" min={1} max={16666} step="1" /><Field name="timezone" label={t("retainers.timezone")} maxLength={80} defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone} /><Field name="startMonth" label={t("retainers.startMonth")} type="month" /><Field name="endMonth" label={t("retainers.endMonth")} type="month" required={false} /></div>
      <Choice name="renewal" options={["manual", "automatic"]} /><Choice name="carryPolicy" options={["expire", "carry"]} onChange={setCarry} />{carry === "carry" && <div className="grid gap-4 sm:grid-cols-2"><Field name="carryHours" label={t("retainers.carryHours")} type="number" min={1} max={16666} step="1" /><Field name="carryMonths" label={t("retainers.carryMonths")} type="number" min={1} max={12} step="1" /></div>}
      <Choice name="overagePolicy" options={["waive", "approval"]} onChange={setOverage} />{overage === "approval" && <Field name="overageRate" label={t("retainers.overageRate")} pattern="[0-9]{1,8}(\.[0-9]{1,2})?" />}
      <label className="block text-sm">{t("retainers.billingMode")}<select className={fieldClass} required name="recurringId" defaultValue=""><option disabled value="">{t("retainers.choose")}</option><option value="manual">{t("retainers.manualBilling")}</option>{templates.map(template => <option key={template.id} value={template.id}>{template.template_name} · {template.amount}</option>)}</select></label><p className="text-xs leading-relaxed text-muted-foreground">{t("retainers.termsNote")}</p><label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" required />{t("retainers.confirmTerms")}</label><Button type="submit">{t(mutation.isPending ? "retainers.saving" : "retainers.create")}</Button>
    </fieldset><ErrorMessage error={mutation.error} />
  </form>;
}
function CommandForm({ path, r, p, action, entry, state, decision, close }: { path: string; r: Retainer; p: Period; action: Action; entry?: Entry; state?: string; decision?: string; close: () => void }) {
  const { t, i18n } = useTranslation(); const [key] = useState(() => crypto.randomUUID()); const [page, setPage] = useState(1); const [selected, setSelected] = useState<Candidate[]>([]); const mutation = useSave(path, close); const scope = useDataScope();
  const query = useQuery({ queryKey: ["retainer-time", scope, path, p.id, page], enabled: action === "allocate", queryFn: async ({ signal }) => (await axios.get<{ data: { items: Candidate[]; hasMore: boolean } }>(`${path}/periods/${p.id}/time`, { params: { page }, signal })).data.data });
  return <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (mutation.isPending) return; const f = new FormData(e.currentTarget); const payload = action === "state" ? { key, action, state, revision: r.revision, reason: String(f.get("reason")) } : action === "open" ? { key, action, month: followingMonth(p.month) } : { key, action, periodId: p.id, revision: p.revision, ...(action === "allocate" ? { entries: selected.map(item => ({ id: item.id, version: item.version })) } : action === "remove" ? { entryId: entry!.id } : action === "adjust" ? { sourceEntryId: String(f.get("sourceEntryId")), minutes: Number(f.get("minutes")), reason: String(f.get("reason")) } : action === "decide" ? { decision, note: String(f.get("reason")), confirm: true } : { confirm: true }) }; mutation.mutate(payload); }}>
    <fieldset className="space-y-4" disabled={mutation.isPending}>
      {action === "allocate" && <><p className="text-sm text-muted-foreground">{t("retainers.allocateHint")}</p>{query.isPending ? <p role="status">{t("retainers.loading")}</p> : query.isError ? <p role="alert">{t("retainers.error")}</p> : query.data && <><div className="max-h-72 overflow-y-auto rounded-lg border border-border">{!query.data.items.length && <p className="p-5 text-sm">{t("retainers.noEligible")}</p>}{query.data.items.map(item => <label key={item.id} className="flex items-start gap-3 border-b border-border p-3 text-sm last:border-0"><input type="checkbox" className="mt-1" checked={selected.some(s => s.id === item.id)} onChange={e => setSelected(e.target.checked ? [...selected, item] : selected.filter(s => s.id !== item.id))} /><span className="min-w-0 flex-1 break-words">{item.project}<span className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat(i18n?.resolvedLanguage, { dateStyle: "medium", timeZone: r.timezone }).format(new Date(item.startedAt))}</span></span><span className="tabular-nums" dir="ltr">{hour(item.minutes)}</span></label>)}</div><Pager page={page} more={query.data.hasMore} change={n => { setPage(n); setSelected([]); }} /><p className="text-sm tabular-nums">{t("retainers.selected")}: {hour(selected.reduce((n, e) => n + e.minutes, 0))}</p></>}</>}
      {action === "remove" && <p className="text-sm">{t("retainers.removeHint")} {entry?.label} · {hour(entry?.minutes || 0)}</p>}
      {action === "adjust" && <><p className="text-sm text-muted-foreground">{t("retainers.adjustHint")}</p><AdjustmentSource path={path} currentMonth={p.month} /><Field name="minutes" label={t("retainers.adjustmentMinutes")} type="number" min={-1000000} max={1000000} step="1" /></>}
      {action === "close" && <><Consumption period={p} /><p className="text-sm text-muted-foreground">{t("retainers.closeHint")}</p></>}
      {action === "open" && <p>{t("retainers.openPeriod")}: {followingMonth(p.month)}</p>}
      {action === "state" && <p className="text-sm text-muted-foreground">{t(`retainers.${state}`)}. {t("retainers.stateHint")}</p>}
      {action === "decide" && <div className="space-y-2 rounded-lg border border-border p-4 text-sm"><p>{t(decision === "approved" ? "retainers.approve" : "retainers.reject")}</p><p className="text-xl font-semibold tabular-nums" dir="ltr">{p.statement?.billing?.overageAmount} {p.statement?.billing?.currency}</p><p className="text-muted-foreground">{t("retainers.billingNote")}</p></div>}
      {["state", "adjust", "decide"].includes(action) && <label className="block text-sm">{t("retainers.reason")}<textarea name="reason" className={fieldClass} rows={3} required maxLength={1000} /></label>}
      <label className="flex items-start gap-3 border-t border-border pt-4 text-sm"><input type="checkbox" className="mt-1" required />{t("retainers.confirm")}</label><Button type="submit" disabled={action === "allocate" && (!selected.length || query.isFetching || query.isError)}>{t(mutation.isPending ? "retainers.saving" : "retainers.save")}</Button>
    </fieldset><ErrorMessage error={mutation.error} />
  </form>;
}
function AdjustmentSource({ path, currentMonth }: { path: string; currentMonth: string }) {
  const { t } = useTranslation(); const scope = useDataScope(); const [periodPage, setPeriodPage] = useState(1); const [entryPage, setEntryPage] = useState(1); const [sourcePeriod, setSourcePeriod] = useState("");
  const periods = useQuery({ queryKey: ["retainer-detail", scope, path, "adjust-periods", periodPage], queryFn: async ({ signal }) => (await axios.get<{ data: Detail }>(path, { params: { periodPage }, signal })).data.data });
  const source = useQuery({ queryKey: ["retainer-detail", scope, path, "adjust-source", sourcePeriod, entryPage], enabled: !!sourcePeriod, queryFn: async ({ signal }) => (await axios.get<{ data: Detail }>(path, { params: { periodId: sourcePeriod, entryPage }, signal })).data.data });
  const closed = periods.data?.periods.filter(p => p.state === "closed" && p.month < currentMonth) || [];
  return <div className="space-y-3 rounded-lg border border-border p-4">
    {periods.isError || source.isError ? <p role="alert">{t("retainers.error")}</p> : <>
      <label className="block text-sm">{t("retainers.period")}<select className={fieldClass} required value={sourcePeriod} onChange={e => { setSourcePeriod(e.target.value); setEntryPage(1); }}><option value="">{t("retainers.choose")}</option>{closed.map(p => <option key={p.id} value={p.id}>{p.month}</option>)}</select></label>
      <Pager page={periodPage} more={periods.data?.hasMorePeriods || false} change={n => { setPeriodPage(n); setSourcePeriod(""); }} />
      {sourcePeriod && source.isPending && <p role="status">{t("retainers.loading")}</p>}
      <label className="block text-sm">{t("retainers.adjustmentSource")}<select className={fieldClass} name="sourceEntryId" required key={`${sourcePeriod}:${entryPage}`} defaultValue="" disabled={!sourcePeriod || source.isFetching}><option value="">{t("retainers.choose")}</option>{sourcePeriod && source.data?.entries.filter(e => e.kind === "time").map(e => <option key={e.id} value={e.id}>{e.label} · {e.started_at?.slice(0, 10)} · {hour(e.minutes)}</option>)}</select></label>
      {sourcePeriod && <Pager page={entryPage} more={source.data?.hasMoreEntries || false} change={setEntryPage} />}
    </>}
  </div>;
}
