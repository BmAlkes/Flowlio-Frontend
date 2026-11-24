import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import type { TaskDraft } from "./scene";

type Props = {
  drafts: TaskDraft[];
  defaultProjectId: string | null;
  onClose: () => void;
  /** Called with the notes that became tasks; the dialog closes itself when every task was created. */
  onCreated: (keys: string[]) => void;
};

/** Turns the selected sticky notes into tasks of one project, one task per note. */
export function TasksFromNotesDialog({ drafts, defaultProjectId, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const cache = useQueryClient();
  const navigate = useNavigate();
  const { data: projects } = useFetchProjects();
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [chosen, setChosen] = useState(() => new Set(drafts.map(draft => draft.key)));
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const picked = drafts.filter(draft => chosen.has(draft.key));

  const toggle = (key: string) => setChosen(current => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const create = async () => {
    setBusy(true);
    setFailed([]);
    const created: string[] = [];
    const errors: string[] = [];
    // One at a time: the task endpoint applies plan limits and notifications per task.
    for (const draft of picked) {
      try {
        await axios.post("/tasks/create", { title: draft.title, description: draft.description || undefined, projectId });
        created.push(draft.key);
      } catch (error) {
        const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
        errors.push(`${draft.title}${message ? ` — ${message}` : ""}`);
      }
    }
    setBusy(false);
    if (created.length) {
      void cache.invalidateQueries({ queryKey: ["tasks"] });
      void cache.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t("whiteboards.tasks.created", { count: created.length }), {
        action: { label: t("whiteboards.tasks.view"), onClick: () => navigate(`/dashboard/project/view/${encodeURIComponent(projectId)}`) },
      });
      onCreated(created);
      // What was created is not offered again if the person retries the rest.
      setChosen(current => new Set([...current].filter(key => !created.includes(key))));
    }
    if (errors.length) setFailed(errors);
    else onClose();
  };

  return (
    <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("whiteboards.tasks.title")}</DialogTitle>
          <DialogDescription>{t("whiteboards.tasks.description")}</DialogDescription>
        </DialogHeader>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t("whiteboards.tasks.project")}</span>
          <select className="h-9 rounded-md border border-border bg-background px-2 text-sm" value={projectId} onChange={event => setProjectId(event.target.value)}>
            <option value="">{t("whiteboards.tasks.chooseProject")}</option>
            {(projects?.data ?? []).map(project => <option key={project.id} value={project.id}>{project.projectName}</option>)}
          </select>
        </label>
        <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2" aria-label={t("whiteboards.tasks.notes")}>
          {drafts.map(draft => (
            <li key={draft.key}>
              <label className="flex cursor-pointer items-start gap-2 rounded-md p-1.5 text-sm hover:bg-muted">
                <input type="checkbox" className="mt-0.5" checked={chosen.has(draft.key)} onChange={() => toggle(draft.key)} />
                <span>
                  <span className="font-medium">{draft.title}</span>
                  {draft.description && <span className="block whitespace-pre-line text-xs text-muted-foreground">{draft.description}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {failed.length > 0 && (
          <div role="alert" className="text-sm text-destructive">
            <p>{t("whiteboards.tasks.failed")}</p>
            <ul className="list-disc ps-5">{failed.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>{t("whiteboards.cancel")}</Button>
          <Button disabled={busy || !projectId || !picked.length} onClick={() => void create()}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t("whiteboards.tasks.submit", { count: picked.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
