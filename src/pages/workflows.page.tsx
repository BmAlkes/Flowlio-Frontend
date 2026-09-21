import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { useUser } from "@/providers/user.provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  return <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 text-foreground sm:px-6">
    <header className="space-y-2 border-b border-border pb-5"><h1 className="text-2xl font-medium">{t("workflows.title")}</h1><p className="text-sm text-muted-foreground">{t("workflows.description")}</p></header>
    <details className="rounded-lg border border-border p-4"><summary className="cursor-pointer text-sm font-medium">{t("workflows.create")}</summary>
      <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); if (!create.isPending) create.mutate(); }}>
        <fieldset disabled={create.isPending} className="space-y-4">
          <label className="block text-sm">{t("workflows.name")}<Input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label>
          <label className="block text-sm">{t("workflows.trigger")}<select className={fieldClass} value={trigger} onChange={event => setTrigger(event.target.value)}>{triggers.map(value => <option key={value} value={value}>{t(`workflows.${value}`)}</option>)}</select></label>
          <label className="block text-sm">{t("workflows.condition")}<select className={fieldClass} value={projectStatus} onChange={event => setProjectStatus(event.target.value)}><option value="">{t("workflows.anyStatus")}</option>{["pending", "ongoing", "completed"].map(value => <option key={value} value={value}>{t(`projects.${value}`)}</option>)}</select></label>
          <p className="text-sm">{t("workflows.action")}</p>
          <label className="block text-sm">{t("workflows.notificationTitle")}<Input required maxLength={150} value={title} onChange={event => setTitle(event.target.value)} /></label>
          <label className="block text-sm">{t("workflows.message")}<textarea required rows={3} maxLength={1000} className={fieldClass} value={message} onChange={event => setMessage(event.target.value)} /></label>
          <p className="text-xs text-muted-foreground">{t("workflows.createNote")}</p><Button type="submit">{t("common.save")}</Button>
        </fieldset>
        {create.isError && <p role="alert" className="text-sm">{t("workflows.error")}</p>}
        {create.isSuccess && <p role="status" className="text-sm">{t("workflows.created")}</p>}
      </form>
    </details>
    <p className="text-xs text-muted-foreground">{t("workflows.timing")}</p>
    {query.isPending ? <p role="status">{t("common.loading")}</p> : query.isError ? <div role="alert"><p>{t("workflows.error")}</p><Button variant="outline" onClick={() => void query.refetch()}>{t("operations.refresh")}</Button></div> : query.data?.length ? <div className="divide-y divide-border">{query.data.map(rule => <WorkflowRuleRow key={rule.id} rule={rule} />)}</div> : <p>{t("workflows.empty")}</p>}
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
  return <section className="space-y-3 py-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-medium">{rule.name}</h2><span className="text-sm text-muted-foreground">{t(rule.enabled ? "workflows.active" : "workflows.paused")}</span></header>
    <p className="text-sm">{t(`workflows.${rule.trigger}`)} · {rule.projectStatus ? t(`projects.${rule.projectStatus}`) : t("workflows.anyStatus")}</p>
    <div className="border-s-2 border-[#1797ba] ps-3"><p className="text-sm font-medium">{rule.title}</p><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{rule.message}</p></div>
    <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate()}>{t(rule.enabled ? "workflows.pause" : "workflows.enable")}</Button><Button variant="outline" disabled={simulation.isPending} onClick={() => simulation.mutate()}>{t("workflows.simulate")}</Button><Button variant="ghost" onClick={() => { setHistoryOpen(true); if (historyOpen) void history.refetch(); }}>{t("workflows.history")}</Button></div>
    {(toggle.isError || simulation.isError) && <p role="alert" className="text-sm">{t("workflows.error")}</p>}
    {simulation.data && <p role="status" className="text-sm">{t("workflows.simulation", simulation.data)}</p>}
    {historyOpen && <div className="rounded-md border border-border p-3 text-sm"><p className="mb-2 text-xs text-muted-foreground">{t("workflows.historyNote")}</p>{history.isPending ? <p>{t("common.loading")}</p> : history.isError ? <p role="alert">{t("workflows.error")}</p> : history.data?.length ? <ul className="space-y-2">{history.data.map(entry => <li key={entry.id}>{new Date(entry.createdAt).toLocaleString(i18n.language)} · {t(`workflows.${entry.outcome}`)}</li>)}</ul> : <p>{t("workflows.noHistory")}</p>}</div>}
  </section>;
}
