import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { useUser } from "@/providers/user.provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Workflow, Bell, GitBranch, Zap, Play, History, Pause, ListTodo, UserRoundCheck, FileCheck2, ArrowUpRight } from "lucide-react";
import { WorkspaceMetric, WorkspaceHeader, workspacePage, workspacePanel } from "@/components/ui/workspace-page";

export type WorkflowRule = { id: string; name: string; trigger: string; projectStatus: string | null; title: string; message: string; enabled: boolean; actionType?: string; channel?: string; recipientName?: string; targetProjectName?: string };
const triggers = ["proposal_project", "delivery_approved", "delivery_changes_requested", "milestone_completed", "scope_approved", "retainer_80", "retainer_100", "retainer_closed", "retainer_overage_approved"];
const actions = [{ id: "notify", icon: Bell }, { id: "create_task", icon: ListTodo }, { id: "assign_project", icon: UserRoundCheck }, { id: "prepare_billing", icon: FileCheck2 }];
type Option = { id: string; name: string };
type Execution = { id: string; outcome: string; createdAt: string; canRetry?: boolean; href?: string; resourceId?: string; stale?: boolean; details?: { amount?: string; currency?: string } };
const fieldClass = "block w-full rounded-md border border-border bg-background p-2 text-sm";

export default function WorkflowsPage() {
  const { t } = useTranslation();
  const { data } = useUser();
  const user = data?.user;
  const allowed = user?.role === "user" && (user.isOrganizationOwner || user.isOrganizationManager);
  const scope = useDataScope();
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(triggers[0]);
  const [projectStatus, setProjectStatus] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [actionType, setActionType] = useState("notify");
  const [channel, setChannel] = useState("internal");
  const [recipient, setRecipient] = useState<Option | null>(null);
  const [project, setProject] = useState<Option | null>(null);
  const [search, setSearch] = useState("");
  const optionSearch = useDeferredValue(search);
  const options = useQuery({ queryKey: ["workflow-options", scope, optionSearch], enabled: !!allowed, queryFn: async () => (await axios.get<{ data: { members: Option[]; projects: Option[] } }>("/workflows/options", { params: { q: optionSearch } })).data.data });
  const retainer = trigger.startsWith("retainer_");
  const needsProject = retainer && ["create_task", "assign_project"].includes(actionType);
  const billingAllowed = !!user?.isOrganizationOwner && ["scope_approved", "retainer_overage_approved"].includes(trigger);
  const query = useQuery({ queryKey: ["workflows", scope], enabled: !!allowed, queryFn: async () => (await axios.get<{ data: WorkflowRule[] }>("/workflows")).data.data });
  const create = useMutation({ mutationFn: () => axios.post("/workflows", { name, trigger, projectStatus: retainer && !needsProject ? null : projectStatus || null, title, message, actionType, channel: actionType === "notify" ? channel : "internal", ...(actionType !== "prepare_billing" ? { recipientId: recipient?.id } : {}), targetProjectId: needsProject ? project?.id : null }), onSuccess: () => { setName(""); setTitle(""); setMessage(""); void client.invalidateQueries({ queryKey: ["workflows"] }); } });
  if (!allowed) return <p className="p-6">{t("workflows.forbidden")}</p>;
  return <main className={workspacePage}>
    <WorkspaceHeader icon={Workflow} title={t("workflows.title")} description={t("workflows.description")} />
    {query.data&&<dl className="grid gap-3 sm:grid-cols-3"><WorkspaceMetric icon={Workflow} label={t('workflows.title')} note={t('workspace.loadedItems')}>{query.data.length}</WorkspaceMetric><WorkspaceMetric icon={Zap} label={t('workflows.active')} tone="violet">{query.data.filter(r=>r.enabled).length}</WorkspaceMetric><WorkspaceMetric icon={Bell} label={t('workflows.paused')} tone="amber">{query.data.filter(r=>!r.enabled).length}</WorkspaceMetric></dl>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
    <details open className={`${workspacePanel} xl:order-2 p-5 [&_label]:space-y-2`}><summary className="cursor-pointer text-base font-medium text-[#11718c] dark:text-[#55bdd9]">{t("workflows.create")}</summary>
      <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); if (!create.isPending) create.mutate(); }}>
        <fieldset disabled={create.isPending} className="space-y-4">
          <label className="block text-sm">{t("workflows.name")}<Input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label>
          <label className="block text-sm">{t("workflows.trigger")}<select className={fieldClass} value={trigger} onChange={event => { setTrigger(event.target.value); if (actionType === "prepare_billing") setActionType("notify"); }}>{triggers.map(value => <option key={value} value={value}>{t(`workflows.${value}`)}</option>)}</select></label>
          {(!retainer || needsProject) && <label className="block text-sm">{t("workflows.condition")}<select className={fieldClass} value={projectStatus} onChange={event => setProjectStatus(event.target.value)}><option value="">{t("workflows.anyStatus")}</option>{["pending", "ongoing", "completed"].map(value => <option key={value} value={value}>{t(`projects.statusValue.${value}`)}</option>)}</select></label>}
          <fieldset className="border-t border-border pt-4"><legend className="pe-3 text-sm font-medium">{t("workflows.then")}</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{actions.filter(a => a.id !== "prepare_billing" || billingAllowed).map(({ id, icon: Icon }) => <label key={id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${actionType === id ? "border-[#1797ba]/60 bg-[#1797ba]/10" : "border-border hover:bg-secondary/50"}`}><input className="mt-1 accent-[#11718c]" type="radio" name="workflowAction" value={id} checked={actionType === id} onChange={() => setActionType(id)} /><span><Icon aria-hidden="true" className="mb-2 size-4 text-[#11718c] dark:text-[#55bdd9]" />{t(`workflows.${id}`)}</span></label>)}</div></fieldset>
          {actionType === "notify" && <label className="block text-sm">{t("workflows.channel")}<select className={fieldClass} value={channel} onChange={e => setChannel(e.target.value)}>{["internal", "email", "push"].map(id => <option key={id} value={id}>{t(`workflows.${id}`)}</option>)}</select></label>}
          {actionType !== "prepare_billing" && <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3">
            <label className="block text-xs text-muted-foreground">{t("workflows.searchOptions")}<Input value={search} maxLength={100} onChange={e => setSearch(e.target.value)} /></label>
            {options.isError && <p role="alert" className="text-xs">{t("workflows.error")}</p>}
            <label className="block text-sm">{t(actionType === "notify" ? "workflows.recipient" : "workflows.assignee")}<select required className={fieldClass} value={recipient?.id ?? ""} onChange={e => setRecipient(options.data?.members.find(m => m.id === e.target.value) ?? null)}><option value="">{t("workflows.choosePerson")}</option>{recipient && !options.data?.members.some(m => m.id === recipient.id) && <option value={recipient.id}>{recipient.name}</option>}{options.data?.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
            {needsProject && <label className="block text-sm">{t("workflows.targetProject")}<select required className={fieldClass} value={project?.id ?? ""} onChange={e => setProject(options.data?.projects.find(p => p.id === e.target.value) ?? null)}><option value="">{t("workflows.chooseProject")}</option>{project && !options.data?.projects.some(p => p.id === project.id) && <option value={project.id}>{project.name}</option>}{options.data?.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
            <p className="text-xs leading-relaxed text-muted-foreground">{t(needsProject ? "workflows.projectNote" : "workflows.recipientNote")}</p>
          </div>}
          {actionType === "prepare_billing" && <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-relaxed">{t("workflows.billingNote")}</p>}
          {actionType === "assign_project" && <p className="text-xs leading-relaxed text-muted-foreground">{t("workflows.assignmentNote")}</p>}
          <label className="block text-sm">{t("workflows.notificationTitle")}<Input required maxLength={150} value={title} onChange={event => setTitle(event.target.value)} /></label>
          <label className="block text-sm">{t("workflows.message")}<textarea required rows={3} maxLength={1000} className={fieldClass} value={message} onChange={event => setMessage(event.target.value)} /></label>
          <p className="text-xs leading-relaxed text-muted-foreground">{t("workflows.createNote")}</p><Button type="submit" className="bg-[#11718c] text-white hover:bg-[#0e6078]">{t("common.save")}</Button>
        </fieldset>
        {create.isError && <p role="alert" className="text-sm">{t("workflows.error")}</p>}
        {create.isSuccess && <p role="status" className="text-sm">{t("workflows.created")}</p>}
      </form>
    </details>
    <div className="min-w-0 space-y-4">
    <p className="rounded-lg border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">{t("workflows.timing")}</p>
    {query.isPending ? <p role="status">{t("common.loading")}</p> : query.isError ? <div role="alert"><p>{t("workflows.error")}</p><Button variant="outline" onClick={() => void query.refetch()}>{t("operations.refresh")}</Button></div> : query.data?.length ? <div className="space-y-5">{query.data.map(rule => <WorkflowRuleRow key={rule.id} rule={rule} />)}</div> : <div className={`${workspacePanel} flex flex-col items-center gap-4 px-6 py-12 text-center`}><Workflow aria-hidden="true" className="size-10 text-[#1797ba]" /><p className="text-sm text-muted-foreground">{t("workflows.empty")}</p></div>}
    </div></div>
  </main>;
}

export function WorkflowRuleRow({ rule }: { rule: WorkflowRule }) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const scope = useDataScope();
  const [historyOpen, setHistoryOpen] = useState(false);
  const path = `/workflows/${encodeURIComponent(rule.id)}`;
  const toggle = useMutation({ mutationFn: () => axios.patch(path, { enabled: !rule.enabled }), onSuccess: () => { void client.invalidateQueries({ queryKey: ["workflows"] }); } });
  const simulation = useMutation({ mutationFn: async () => (await axios.get<{ data: { sampled: number; matches: number; reasons?: Record<string, number> } }>(`${path}/simulate`)).data.data });
  const history = useQuery({ queryKey: ["workflow-history", scope, rule.id], enabled: historyOpen, queryFn: async () => (await axios.get<{ data: Execution[] }>(`${path}/history`)).data.data });
  const retry = useMutation({ mutationFn: (id: string) => axios.post(`${path}/executions/${encodeURIComponent(id)}/retry`), onSuccess: () => { void history.refetch(); } });
  const ActionIcon = actions.find(a => a.id === rule.actionType)?.icon ?? Bell;
  return <section className={`${workspacePanel} space-y-4 p-5`}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><h2 className="min-w-0 break-words text-base font-medium">{rule.name}</h2><span className={`rounded-full border px-3 py-1 text-xs font-medium ${rule.enabled ? "border-[#1797ba]/25 bg-[#1797ba]/10 text-[#11718c] dark:text-[#55bdd9]" : "border-border bg-secondary text-muted-foreground"}`}>{t(rule.enabled ? "workflows.active" : "workflows.paused")}</span></header>
    <div className="space-y-0">
      <div className="flex gap-3"><span className="flex w-8 shrink-0 flex-col items-center"><Zap aria-hidden="true" className="size-4 text-[#1797ba]" /><span className="mt-2 min-h-5 w-px flex-1 bg-border" /></span><div className="pb-4"><p className="text-xs text-muted-foreground">{t("workflows.trigger")}</p><p className="mt-1 text-sm font-medium">{t(`workflows.${rule.trigger}`)}</p></div></div>
      <div className="flex gap-3"><span className="flex w-8 shrink-0 flex-col items-center"><GitBranch aria-hidden="true" className="size-4 text-[#1797ba]" /><span className="mt-2 min-h-5 w-px flex-1 bg-border" /></span><div className="pb-4"><p className="text-xs text-muted-foreground">{t("workflows.condition")}</p><p className="mt-1 text-sm">{rule.projectStatus ? t(`projects.statusValue.${rule.projectStatus}`) : t("workflows.anyStatus")}</p></div></div>
      <div className="flex gap-3"><span className="flex w-8 shrink-0 justify-center"><ActionIcon aria-hidden="true" className="size-4 text-[#1797ba]" /></span><div className="min-w-0 flex-1 rounded-lg border border-[#1797ba]/15 bg-[#1797ba]/5 p-3"><p className="mb-2 text-xs font-medium text-[#11718c] dark:text-[#55bdd9]">{t(`workflows.${rule.actionType ?? "notify"}`)}{(!rule.actionType || rule.actionType === "notify") && ` · ${t(`workflows.${rule.channel ?? "internal"}`)}`}</p><p className="break-words text-sm font-medium">{rule.title}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{rule.message}</p>{rule.recipientName && rule.actionType !== "prepare_billing" && <p className="mt-3 break-words border-t border-[#1797ba]/15 pt-2 text-xs">{t("workflows.recipient")}: {rule.recipientName}</p>}{rule.targetProjectName && <p className="mt-1 break-words text-xs">{t("workflows.targetProject")}: {rule.targetProjectName}</p>}</div></div>
    </div>
    <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate()}>{rule.enabled ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}{t(rule.enabled ? "workflows.pause" : "workflows.enable")}</Button><Button variant="outline" disabled={simulation.isPending} onClick={() => simulation.mutate()}>{t("workflows.simulate")}</Button><Button variant="ghost" onClick={() => { setHistoryOpen(true); if (historyOpen) void history.refetch(); }}><History aria-hidden="true" className="size-4" />{t("workflows.history")}</Button></div>
    {(toggle.isError || simulation.isError || retry.isError) && <p role="alert" className="text-sm">{t("workflows.error")}</p>}
    {simulation.data && <p role="status" className="text-sm">{t("workflows.simulation", simulation.data)}</p>}
    {simulation.data?.reasons && Object.keys(simulation.data.reasons).length > 0 && <ul className="space-y-1 text-xs text-muted-foreground">{Object.entries(simulation.data.reasons).map(([reason, count]) => <li key={reason}>{t(`workflows.${reason}`)} · {count}</li>)}</ul>}
    {historyOpen && <div className="rounded-lg border border-border bg-secondary/15 p-3 text-sm"><p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t("workflows.historyNote")}</p>{history.isPending ? <p>{t("common.loading")}</p> : history.isError ? <p role="alert">{t("workflows.error")}</p> : history.data?.length ? <ul className="divide-y divide-border">{history.data.map(entry => <li key={entry.id} className="space-y-2 py-3 first:pt-0 last:pb-0"><div className="flex flex-wrap items-start justify-between gap-2"><span className="font-medium">{t(`workflows.${entry.outcome}`)}</span><time className="text-xs text-muted-foreground" dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString(i18n.language)}</time></div>{entry.details?.amount && <p className="font-medium tabular-nums">{entry.details.currency} {entry.details.amount} <span className="font-normal text-muted-foreground">· {t("workflows.reviewRequired")}</span></p>}{entry.stale && <p className="text-xs">{t("workflows.source_changed")}</p>}{entry.outcome === "uncertain" && <p className="text-xs leading-relaxed text-muted-foreground">{t("workflows.uncertainNote")}</p>}<div className="flex flex-wrap items-center gap-3">{entry.href && <a className="inline-flex items-center gap-1 text-xs text-[#11718c] underline underline-offset-4 dark:text-[#55bdd9]" href={entry.href}>{t("workflows.openResource")}<ArrowUpRight aria-hidden="true" className="size-3" /></a>}{entry.canRetry && <Button variant="outline" size="sm" disabled={retry.isPending} onClick={() => retry.mutate(entry.id)}>{t("workflows.retry")}</Button>}</div></li>)}</ul> : <p>{t("workflows.noHistory")}</p>}</div>}
  </section>;
}
