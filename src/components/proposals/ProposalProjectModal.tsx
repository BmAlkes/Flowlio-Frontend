import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TaskDraft = { title: string; estimatedHours: string | null };
export type ProjectPreview = {
  existing: false; version: string; clientId: string; name: string; description: string;
  budgetText: string; budget: string; canSetBudget: boolean; tasks: TaskDraft[];
  milestones: string[]; templates: { id: string; name: string }[];
};
type Preview = ProjectPreview | { existing: true; projectId: string };

function errorKey(error: unknown) {
  const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
  return code ? `proposalConversion.errors.${code}` : "proposalConversion.error";
}

export function ProposalProjectModal({ proposalId, onClose }: { proposalId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const scope = useDataScope();
  const navigate = useNavigate();
  const [templateId, setTemplateId] = useState("");
  const query = useQuery({
    queryKey: ["proposal-project-preview", scope, proposalId, templateId],
    queryFn: async () => (await axios.get<{ data: Preview }>(`/proposals/${encodeURIComponent(proposalId)}/project-preview`, {
      params: templateId ? { templateId } : {},
    })).data.data,
    refetchOnWindowFocus: false,
  });
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>{t("proposalConversion.title")}</DialogTitle><DialogDescription>{t("proposalConversion.review")}</DialogDescription></DialogHeader>
      {query.isPending ? <p role="status">{t("proposalConversion.loading")}</p> : query.isError ? <div role="alert" className="space-y-3"><p>{t(errorKey(query.error), { defaultValue: t("proposalConversion.error") })}</p><Button variant="outline" onClick={() => void query.refetch()}>{t("operations.refresh")}</Button></div> : query.data?.existing ? <div className="space-y-4"><p>{t("proposalConversion.existing")}</p><Button onClick={() => { if (query.data?.existing) navigate(`/dashboard/project/view/${query.data.projectId}`); }}>{t("proposalConversion.open")}</Button></div> : query.data ? <ProposalProjectForm key={`${scope}:${proposalId}:${templateId}:${query.data.version}`} proposalId={proposalId} preview={query.data} templateId={templateId} onTemplateChange={setTemplateId} onRefresh={() => void query.refetch()} /> : null}
    </DialogContent>
  </Dialog>;
}

export function ProposalProjectForm({ proposalId, preview, templateId, onTemplateChange, onRefresh }: {
  proposalId: string; preview: ProjectPreview; templateId: string;
  onTemplateChange: (id: string) => void; onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [name, setName] = useState(preview.name);
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState(preview.description);
  const [budget, setBudget] = useState(preview.budget);
  const [tasks, setTasks] = useState(preview.tasks);
  const [milestones, setMilestones] = useState(preview.milestones.join("\n"));
  const mutation = useMutation({
    mutationFn: async () => (await axios.post<{ data: { projectId: string; existing: boolean } }>(`/proposals/${encodeURIComponent(proposalId)}/project`, {
      version: preview.version, templateId: templateId || null, name, projectNumber: number, description,
      ...(preview.canSetBudget && budget.trim() ? { budget: budget.trim() } : {}),
      tasks: tasks.map(task => ({ title: task.title, estimatedHours: task.estimatedHours?.trim() || null })),
      milestones: milestones.split("\n").map(value => value.trim()).filter(Boolean),
    })).data.data,
    onSuccess: result => {
      void client.invalidateQueries({ queryKey: ["projects"] });
      void client.invalidateQueries({ queryKey: ["org-proposals"] });
      void client.invalidateQueries({ queryKey: ["proposal-project-preview"] });
      toast.success(t(result.existing ? "proposalConversion.existing" : "proposalConversion.created"));
      navigate(`/dashboard/project/view/${result.projectId}`);
    },
  });
  const updateTask = (index: number, patch: Partial<TaskDraft>) => setTasks(current => current.map((task, i) => i === index ? { ...task, ...patch } : task));
  const textAreaClass = "mt-1 min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-[#1797ba]";
  return <form className="space-y-5" onSubmit={event => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }}>
    <fieldset disabled={mutation.isPending} className="min-w-0 space-y-5">
      <label className="block text-sm font-medium">{t("proposalConversion.template")}<select className="mt-1 w-full rounded-md border border-border bg-background p-2" value={templateId} onChange={event => onTemplateChange(event.target.value)}><option value="">{t("proposalConversion.noTemplate")}</option>{preview.templates.map(template => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
      <label className="block text-sm font-medium">{t("proposalConversion.name")}<Input className="mt-1" required maxLength={180} value={name} onChange={event => setName(event.target.value)} /></label>
      <label className="block text-sm font-medium">{t("proposalConversion.number")}<Input className="mt-1" maxLength={50} value={number} onChange={event => setNumber(event.target.value)} /></label>
      <label className="block text-sm font-medium">{t("proposalConversion.description")}<textarea className={textAreaClass} maxLength={10000} value={description} onChange={event => setDescription(event.target.value)} /></label>
      {preview.canSetBudget && <label className="block text-sm font-medium">{t("proposalConversion.budget")}<Input className="mt-1" inputMode="decimal" pattern="[0-9]{1,8}(\.[0-9]{1,2})?" value={budget} onChange={event => setBudget(event.target.value)} />{preview.budgetText && <span className="mt-1 block text-xs font-normal text-muted-foreground">{t("proposalConversion.sourceBudget", { value: preview.budgetText })}</span>}</label>}
      <section aria-labelledby="conversion-tasks"><h3 id="conversion-tasks" className="mb-3 text-sm font-medium text-[#11718c] dark:text-[#55bdd9]">{t("proposalConversion.tasks")} ({tasks.length}/100)</h3>
        <div className="space-y-3">{tasks.map((task, index) => <div key={index} className="grid grid-cols-[1fr_6rem_auto] items-end gap-2 max-sm:grid-cols-[1fr_auto]">
          <label className="min-w-0 text-xs">{t("proposalConversion.task", { number: index + 1 })}<Input className="mt-1" required maxLength={180} value={task.title} onChange={event => updateTask(index, { title: event.target.value })} /></label>
          <label className="text-xs max-sm:row-start-2">{t("proposalConversion.hours")}<Input className="mt-1" inputMode="decimal" pattern="[0-9]{1,8}(\.[0-9]{1,2})?" value={task.estimatedHours ?? ""} onChange={event => updateTask(index, { estimatedHours: event.target.value })} /></label>
          <Button type="button" variant="ghost" size="icon" aria-label={t("proposalConversion.removeTask", { number: index + 1 })} onClick={() => setTasks(current => current.filter((_, i) => i !== index))}><Trash2 className="size-4" /></Button>
        </div>)}</div>
        <Button type="button" className="mt-3" variant="outline" disabled={tasks.length >= 100} onClick={() => setTasks(current => [...current, { title: "", estimatedHours: null }])}><Plus className="me-2 size-4" />{t("proposalConversion.addTask")}</Button>
      </section>
      <label className="block text-sm font-medium">{t("proposalConversion.milestones")}<textarea className={textAreaClass} maxLength={5430} value={milestones} onChange={event => setMilestones(event.target.value)} /></label>
    </fieldset>
    {mutation.isError && <div role="alert" className="space-y-2 text-sm"><p>{t(errorKey(mutation.error), { defaultValue: t("proposalConversion.error") })}</p>{errorKey(mutation.error).endsWith("SOURCE_CHANGED") && <Button type="button" variant="outline" onClick={onRefresh}>{t("operations.refresh")}</Button>}</div>}
    <div className="flex justify-end border-t border-border pt-4"><Button type="submit" disabled={mutation.isPending} className="bg-[#11718c] text-white hover:bg-[#11718c]/90">{mutation.isPending ? t("common.saving") : t("proposalConversion.create")}</Button></div>
  </form>;
}
