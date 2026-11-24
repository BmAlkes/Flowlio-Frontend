import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Loader2, PenTool, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useUser } from "@/providers/user.provider";
import { useCreateWhiteboard, useDeleteWhiteboard, useWhiteboards, type WhiteboardSummary } from "@/features/whiteboards/api";

export default function WhiteboardsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const projectFilter = params.get("projectId");
  const { data: session } = useUser();
  const canCreate = ["superadmin", "subadmin", "user", "operator"].includes(session?.user?.role ?? "");
  const { data: boards, isLoading, isError } = useWhiteboards(projectFilter);
  const { data: projects } = useFetchProjects();
  const create = useCreateWhiteboard();
  const remove = useDeleteWhiteboard();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projectFilter ?? "");
  const [deleting, setDeleting] = useState<WhiteboardSummary | null>(null);

  useEffect(() => { document.title = `${t("whiteboards.title")} - Flowlio`; }, [t]);

  const submit = async () => {
    try {
      const board = await create.mutateAsync({ title: title.trim(), projectId: projectId || null });
      navigate(`/dashboard/whiteboards/${board.id}`);
    } catch {
      toast.error(t("whiteboards.createFailed"));
    }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    try { await remove.mutateAsync(deleting.id); setDeleting(null); } catch { toast.error(t("whiteboards.deleteFailed")); }
  };
  const when = (value: string) => new Date(value).toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" });
  const projectName = projects?.data?.find(project => project.id === projectFilter)?.projectName;

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("whiteboards.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("whiteboards.subtitle")}</p>
        </div>
        {canCreate && <Button onClick={() => { setTitle(""); setProjectId(projectFilter ?? ""); setCreating(true); }}><Plus className="size-4" aria-hidden="true" />{t("whiteboards.new")}</Button>}
      </div>

      {projectFilter && (
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-[#1797B9]/10 px-3 py-1 text-[#11718c] dark:text-[#55bdd9]">{t("whiteboards.filteredBy", { name: projectName ?? "…" })}</span>
          <Button variant="link" size="sm" className="px-1" onClick={() => setParams({})}>{t("whiteboards.showAll")}</Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" aria-label={t("whiteboards.loading")} /></div>
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">{t("whiteboards.loadFailed")}</p>
      ) : !boards?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <PenTool className="size-8 text-[#1797B9]" aria-hidden="true" />
          <p className="font-medium">{t("whiteboards.emptyTitle")}</p>
          <p className="max-w-md text-sm text-muted-foreground">{t("whiteboards.emptyText")}</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {boards.map(board => (
            <li key={board.id} className="group relative rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
              <Link to={`/dashboard/whiteboards/${board.id}`} className="block space-y-2 focus-visible:outline-2 focus-visible:outline-[#1797ba]">
                <span className="flex items-center gap-2 pe-8 font-semibold"><PenTool className="size-4 shrink-0 text-[#1797B9]" aria-hidden="true" />{board.title}</span>
                {board.projectName && <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs">{board.projectName}</span>}
                <span className="block text-xs text-muted-foreground">
                  {t("whiteboards.updated", { when: when(board.updatedAt), who: board.updatedByName ?? "—" })}
                </span>
              </Link>
              {board.canDelete && (
                <Button variant="ghost" size="icon" className="absolute end-2 top-2 size-8 text-muted-foreground hover:text-destructive" aria-label={t("whiteboards.delete", { title: board.title })} onClick={() => setDeleting(board)}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <Dialog open onOpenChange={setCreating}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("whiteboards.new")}</DialogTitle>
              <DialogDescription>{t("whiteboards.newHint")}</DialogDescription>
            </DialogHeader>
            <form className="space-y-3" onSubmit={event => { event.preventDefault(); void submit(); }}>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t("whiteboards.titleLabel")}</span>
                <Input autoFocus required maxLength={200} value={title} placeholder={t("whiteboards.titlePlaceholder")} onChange={event => setTitle(event.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t("whiteboards.project")}</span>
                <select className="h-9 rounded-md border border-border bg-background px-2 text-sm" value={projectId} onChange={event => setProjectId(event.target.value)}>
                  <option value="">{t("whiteboards.noProject")}</option>
                  {(projects?.data ?? []).map(project => <option key={project.id} value={project.id}>{project.projectName}</option>)}
                </select>
              </label>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreating(false)}>{t("whiteboards.cancel")}</Button>
                <Button type="submit" disabled={!title.trim() || create.isPending}>{create.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{t("whiteboards.create")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleting && (
        <Dialog open onOpenChange={open => { if (!open) setDeleting(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("whiteboards.deleteTitle")}</DialogTitle>
              <DialogDescription>{t("whiteboards.deleteText", { title: deleting.title })}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>{t("whiteboards.cancel")}</Button>
              <Button variant="destructive" disabled={remove.isPending} onClick={() => void confirmDelete()}>{t("whiteboards.deleteConfirm")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
