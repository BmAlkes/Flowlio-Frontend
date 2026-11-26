import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Board = { id: string; name: string; itemsCount: number; workspace: string | null };
type Result = { boardId: string; projectId: string; projectName: string; projectCreated: boolean; created: number; updated: number; fields: number; unmatchedPeople: string[]; skippedColumns: string[] };
type Progress = { state: "waiting" | "importing" | "done" | "failed"; result?: Result; error?: string };

const errorMessage = (error: unknown) => (error as { response?: { data?: { message?: string } } }).response?.data?.message;

/**
 * Three steps: paste a monday.com API token, choose boards, import them one by one.
 * The token lives only in this dialog's state and is sent with each request; it is never saved.
 */
export function MondayImport({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const cache = useQueryClient();
  const [token, setToken] = useState("");
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, Progress> | null>(null);

  const connect = useMutation({
    mutationFn: async () => (await axios.post<{ data: Board[] }>("/integrations/monday/boards", { token })).data.data,
    onSuccess: list => { setBoards(list); setChosen(new Set()); },
  });

  const running = progress !== null && Object.values(progress).some(entry => entry.state === "waiting" || entry.state === "importing");
  const start = async () => {
    const ids = boards!.filter(board => chosen.has(board.id)).map(board => board.id);
    setProgress(Object.fromEntries(ids.map(id => [id, { state: "waiting" }])));
    // One board at a time: monday limits how fast a token can read, and each board is its own transaction.
    for (const id of ids) {
      setProgress(current => ({ ...current, [id]: { state: "importing" } }));
      try {
        const result = (await axios.post<{ data: Result }>("/integrations/monday/import", { token, boardId: id })).data.data;
        setProgress(current => ({ ...current, [id]: { state: "done", result } }));
      } catch (error) {
        setProgress(current => ({ ...current, [id]: { state: "failed", error: errorMessage(error) ?? t("monday.importFailed") } }));
      }
    }
    void cache.invalidateQueries();
  };
  const close = () => { if (!running) { setToken(""); onClose(); } };
  const toggle = (id: string) => setChosen(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return (
    <Dialog open onOpenChange={open => { if (!open) close(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("monday.title")}</DialogTitle>
          <DialogDescription>{t("monday.description")}</DialogDescription>
        </DialogHeader>

        {!boards && (
          <form className="space-y-3" onSubmit={event => { event.preventDefault(); connect.mutate(); }}>
            <ol className="list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
              <li>{t("monday.step1")}</li>
              <li>{t("monday.step2")}</li>
              <li>{t("monday.step3")}</li>
            </ol>
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t("monday.token")}
              <Input type="password" autoComplete="off" spellCheck={false} value={token} onChange={event => setToken(event.target.value)} placeholder="eyJhbGciOi…" />
            </label>
            <p className="text-xs text-muted-foreground">{t("monday.privacy")}</p>
            {connect.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(connect.error) ?? t("monday.connectFailed")}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>{t("monday.cancel")}</Button>
              <Button type="submit" disabled={token.trim().length < 20 || connect.isPending}>{connect.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{t("monday.connect")}</Button>
            </DialogFooter>
          </form>
        )}

        {boards && !progress && (
          <div className="space-y-3">
            {!boards.length ? <p className="text-sm text-muted-foreground">{t("monday.noBoards")}</p> : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("monday.chooseBoards")}</span>
                  <Button size="sm" variant="link" className="px-0" onClick={() => setChosen(chosen.size === boards.length ? new Set() : new Set(boards.map(board => board.id)))}>
                    {chosen.size === boards.length ? t("monday.none") : t("monday.all")}
                  </Button>
                </div>
                <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border">
                  {boards.map(board => (
                    <li key={board.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted">
                        <input type="checkbox" checked={chosen.has(board.id)} onChange={() => toggle(board.id)} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{board.name}</span>
                          <span className="block text-xs text-muted-foreground">{[board.workspace, t("monday.items", { count: board.itemsCount })].filter(Boolean).join(" · ")}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">{t("monday.repeatable")}</p>
              </>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setBoards(null)}>{t("monday.back")}</Button>
              <Button disabled={!chosen.size} onClick={() => void start()}>{t("monday.import", { count: chosen.size })}</Button>
            </DialogFooter>
          </div>
        )}

        {progress && (
          <div className="space-y-3">
            <ul className="space-y-2" aria-live="polite">
              {Object.entries(progress).map(([id, entry]) => {
                const board = boards?.find(item => item.id === id);
                return (
                  <li key={id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      {entry.state === "done" ? <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                        : entry.state === "failed" ? <XCircle className="size-4 text-destructive" aria-hidden="true" />
                        : entry.state === "importing" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        : <span className="size-4 rounded-full border border-border" aria-hidden="true" />}
                      <span className="truncate">{board?.name}</span>
                      <span className="ms-auto text-xs font-normal text-muted-foreground">{t(`monday.states.${entry.state}`)}</span>
                    </div>
                    {entry.result && (
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>{t("monday.summary", { created: entry.result.created, updated: entry.result.updated, fields: entry.result.fields })}{" "}
                          <Link className="text-[#11718c] underline dark:text-[#55bdd9]" to={`/dashboard/project/view/${entry.result.projectId}`} onClick={close}>{t("monday.openProject", { name: entry.result.projectName })}</Link>
                        </p>
                        {entry.result.unmatchedPeople.length > 0 && <p>{t("monday.unmatched", { names: entry.result.unmatchedPeople.join(", ") })}</p>}
                        {entry.result.skippedColumns.length > 0 && <p>{t("monday.skipped", { names: entry.result.skippedColumns.join(", ") })}</p>}
                      </div>
                    )}
                    {entry.error && <p role="alert" className="mt-1 text-xs text-destructive">{entry.error}</p>}
                  </li>
                );
              })}
            </ul>
            <DialogFooter>
              <Button disabled={running} onClick={close}>{t("monday.close")}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
