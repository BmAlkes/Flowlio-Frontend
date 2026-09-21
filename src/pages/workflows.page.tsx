import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { useUser } from "@/providers/user.provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Workflow, Bell, GitBranch, Zap, Play, History, Pause } from "lucide-react";
import { WorkspaceHeader, workspacePanel } from "@/components/ui/workspace-page";

export type WorkflowRule = { id: string; name: string; trigger: string; projectStatus: string | null; title: string; message: string; enabled: boolean };
const triggers = ["proposal_project", "delivery_approved", "delivery_changes_requested"];
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
  const query = useQuery({ queryKey: ["workflows", scope], enabled: !!allowed, queryFn: async () => (await axios.get<{ data: WorkflowRule[] }>("/workflows")).data.data });
  const create = useMutation({ mutationFn: () => axios.post("/workflows", { name, trigger, projectStatus: projectStatus || null, title, message }), onSuccess: () => { setName(""); setTitle(""); setMessage(""); void client.invalidateQueries({ queryKey: ["workflows"] }); } });
  if (!allowed) return <p className="p-6">{t("workflows.forbidden")}</p>;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-foreground sm:px-6">
    <WorkspaceHeader icon={Workflow} title={t("workflows.title")} description={t("workflows.description")} />
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
    <details open className={`${workspacePanel} p-5 [&_label]:space-y-2`}><summary className="cursor-pointer text-base font-medium text-[#11718c] dark:text-[#55bdd9]">{t("workflows.create")}</summary>
      <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); if (!create.isPending) create.mutate(); }}>
        <fieldset disabled={create.isPending} className="space-y-4">
          <label className="block text-sm">{t("workflows.name")}<Input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label>
          <label className="block text-sm">{t("workflows.trigger")}<select className={fieldClass} value={trigger} onChange={event => setTrigger(event.target.value)}>{triggers.map(value => <option key={value} value={value}>{t(`workflows.${value}`)}</option>)}</select></label>
          <label className="block text-sm">{t("workflows.condition")}<select className={fieldClass} value={projectStatus} onChange={event => setProjectStatus(event.target.value)}><option value="">{t("workflows.anyStatus")}</option>{["pending", "ongoing", "completed"].map(value => <option key={value} value={value}>{t(`projects.statusValue.${value}`)}</option>)}</select></label>
          <p className="flex items-center gap-2 rounded-lg bg-[#1797ba]/10 p-3 text-sm"><Bell aria-hidden="true" className="size-4 shrink-0 text-[#11718c] dark:text-[#55bdd9]" />{t("workflows.action")}</p>
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
  const simulation = useMutation({ mutationFn: async () => (await axios.get<{ data: { sampled: number; matches: number } }>(`${path}/simulate`)).data.data });
  const history = useQuery({ queryKey: ["workflow-history", scope, rule.id], enabled: historyOpen, queryFn: async () => (await axios.get<{ data: { id: string; outcome: string; createdAt: string }[] }>(`${path}/history`)).data.data });
  return <section className={`${workspacePanel} space-y-4 p-5`}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><h2 className="min-w-0 break-words text-base font-medium">{rule.name}</h2><span className={`rounded-full border px-3 py-1 text-xs font-medium ${rule.enabled ? "border-[#1797ba]/25 bg-[#1797ba]/10 text-[#11718c] dark:text-[#55bdd9]" : "border-border bg-secondary text-muted-foreground"}`}>{t(rule.enabled ? "workflows.active" : "workflows.paused")}</span></header>
    <div className="space-y-0">
      <div className="flex gap-3"><span className="flex w-8 shrink-0 flex-col items-center"><Zap aria-hidden="true" className="size-4 text-[#1797ba]" /><span className="mt-2 min-h-5 w-px flex-1 bg-border" /></span><div className="pb-4"><p className="text-xs text-muted-foreground">{t("workflows.trigger")}</p><p className="mt-1 text-sm font-medium">{t(`workflows.${rule.trigger}`)}</p></div></div>
      <div className="flex gap-3"><span className="flex w-8 shrink-0 flex-col items-center"><GitBranch aria-hidden="true" className="size-4 text-[#1797ba]" /><span className="mt-2 min-h-5 w-px flex-1 bg-border" /></span><div className="pb-4"><p className="text-xs text-muted-foreground">{t("workflows.condition")}</p><p className="mt-1 text-sm">{rule.projectStatus ? t(`projects.statusValue.${rule.projectStatus}`) : t("workflows.anyStatus")}</p></div></div>
      <div className="flex gap-3"><span className="flex w-8 shrink-0 justify-center"><Bell aria-hidden="true" className="size-4 text-[#1797ba]" /></span><div className="min-w-0 flex-1 rounded-lg border border-[#1797ba]/15 bg-[#1797ba]/5 p-3"><p className="mb-2 text-xs text-muted-foreground">{t("workflows.action")}</p><p className="break-words text-sm font-medium">{rule.title}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{rule.message}</p></div></div>
    </div>
    <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate()}>{rule.enabled ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}{t(rule.enabled ? "workflows.pause" : "workflows.enable")}</Button><Button variant="outline" disabled={simulation.isPending} onClick={() => simulation.mutate()}>{t("workflows.simulate")}</Button><Button variant="ghost" onClick={() => { setHistoryOpen(true); if (historyOpen) void history.refetch(); }}><History aria-hidden="true" className="size-4" />{t("workflows.history")}</Button></div>
    {(toggle.isError || simulation.isError) && <p role="alert" className="text-sm">{t("workflows.error")}</p>}
    {simulation.data && <p role="status" className="text-sm">{t("workflows.simulation", simulation.data)}</p>}
    {historyOpen && <div className="rounded-md border border-border p-3 text-sm"><p className="mb-2 text-xs text-muted-foreground">{t("workflows.historyNote")}</p>{history.isPending ? <p>{t("common.loading")}</p> : history.isError ? <p role="alert">{t("workflows.error")}</p> : history.data?.length ? <ul className="space-y-2">{history.data.map(entry => <li key={entry.id}>{new Date(entry.createdAt).toLocaleString(i18n.language)} · {t(`workflows.${entry.outcome}`)}</li>)}</ul> : <p>{t("workflows.noHistory")}</p>}</div>}
  </section>;
}
