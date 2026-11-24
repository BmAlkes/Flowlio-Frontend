import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { ArrowLeft, Check, CloudOff, ListPlus, Loader2 } from "lucide-react";
import { CaptureUpdateAction, Excalidraw, hashElementsVersion, newElementWith, reconcileElements } from "@excalidraw/excalidraw";
import type { BinaryFileData, BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { whiteboardApi, type StoredElement, type StoredFile, type Whiteboard } from "./api";
import { missingFileIds, newFiles, tasksFromSelection, type TaskDraft } from "./scene";
import { TasksFromNotesDialog } from "./TasksFromNotesDialog";

// Production serves Excalidraw's fonts from our own domain (copied at build), so no third-party CDN is contacted.
if (import.meta.env.PROD && typeof window !== "undefined") {
  (window as unknown as { EXCALIDRAW_ASSET_PATH?: string }).EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";
}

const SAVE_DELAY = 1200;
const POLL_EVERY = 8000;
const LANGUAGES: Record<string, string> = { pt: "pt-BR", es: "es-ES", he: "he-IL", en: "en" };

type Status = "saved" | "saving" | "error";
type Remote = Parameters<typeof reconcileElements>[1];

export function WhiteboardEditor({ board }: { board: Whiteboard }) {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const api = useRef<ExcalidrawImperativeAPI | null>(null);
  const revision = useRef(board.revision);
  const savedFiles = useRef(new Set(Object.keys(board.files)));
  const savedHash = useRef(hashElementsVersion(board.elements as unknown as OrderedExcalidrawElement[]));
  const savedBackground = useRef(board.appState.viewBackgroundColor);
  const savedTitle = useRef(board.title);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef<Promise<void> | null>(null);
  // Local changes not yet on the server; while set, other people's changes are not pulled in.
  const dirty = useRef(false);
  const [status, setStatus] = useState<Status>("saved");
  const [title, setTitle] = useState(board.title);
  const [selectionHasText, setSelectionHasText] = useState(false);
  const [drafts, setDrafts] = useState<TaskDraft[] | null>(null);

  const initialData = useMemo(() => ({
    elements: board.elements as unknown as OrderedExcalidrawElement[],
    appState: { viewBackgroundColor: board.appState.viewBackgroundColor ?? "#ffffff", ...(board.appState.gridSize ? { gridSize: board.appState.gridSize } : {}) },
    files: board.files as unknown as BinaryFiles,
    scrollToContent: true,
  }), [board]);

  /** Brings in changes saved by other people, keeping local edits that are newer. */
  const applyRemote = useCallback(async (remote: StoredElement[]) => {
    const editor = api.current;
    if (!editor) return;
    const merged = reconcileElements(editor.getSceneElementsIncludingDeleted(), remote as unknown as Remote, editor.getAppState());
    editor.updateScene({ elements: merged, captureUpdate: CaptureUpdateAction.NEVER });
    savedHash.current = hashElementsVersion(remote as unknown as OrderedExcalidrawElement[]);
    const missing = missingFileIds(merged, editor.getFiles());
    if (missing.length) {
      const files = await whiteboardApi.files(board.id, missing).catch(() => ({}));
      editor.addFiles(Object.values(files) as unknown as BinaryFileData[]);
      missing.forEach(id => savedFiles.current.add(id));
    }
  }, [board.id]);

  const save = useCallback(async () => {
    const editor = api.current;
    if (!editor || !board.canEdit) return;
    if (saving.current) await saving.current;
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const elements = editor.getSceneElementsIncludingDeleted();
    const background = editor.getAppState().viewBackgroundColor;
    if (hashElementsVersion(elements) === savedHash.current && background === savedBackground.current) { dirty.current = false; setStatus("saved"); return; }
    dirty.current = false;
    setStatus("saving");
    const run = (async () => {
      try {
        const files = newFiles(elements, editor.getFiles() as unknown as Record<string, StoredFile>, savedFiles.current);
        const result = await whiteboardApi.save(board.id, { elements: elements as unknown as StoredElement[], appState: { viewBackgroundColor: background }, files });
        revision.current = result.revision;
        savedFiles.current = new Set(result.fileIds);
        savedBackground.current = background;
        await applyRemote(result.elements);
        setStatus("saved");
      } catch {
        dirty.current = true;
        setStatus("error");
        timer.current = setTimeout(() => void save(), 5000);
      }
    })();
    saving.current = run;
    await run;
    saving.current = null;
  }, [applyRemote, board.canEdit, board.id]);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), SAVE_DELAY);
  }, [save]);

  const onChange = useCallback((elements: readonly OrderedExcalidrawElement[], appState: { selectedElementIds: Readonly<Record<string, true>>; viewBackgroundColor: string }) => {
    const hasText = Object.keys(appState.selectedElementIds).length > 0 && tasksFromSelection(elements, appState.selectedElementIds).length > 0;
    setSelectionHasText(current => (current === hasText ? current : hasText));
    if (!board.canEdit) return;
    if (hashElementsVersion(elements) !== savedHash.current || appState.viewBackgroundColor !== savedBackground.current) {
      dirty.current = true;
      setStatus(current => (current === "error" ? current : "saving"));
      schedule();
    }
  }, [board.canEdit, schedule]);

  // Pick up other people's saves while the board is open and idle.
  useEffect(() => {
    const poll = setInterval(async () => {
      if (document.hidden || saving.current || dirty.current) return;
      try {
        const latest = await whiteboardApi.revision(board.id);
        if (latest.revision <= revision.current) return;
        const fresh = await whiteboardApi.get(board.id);
        revision.current = fresh.revision;
        savedTitle.current = fresh.title;
        setTitle(fresh.title);
        await applyRemote(fresh.elements);
      } catch {
        // A failed check is retried on the next tick.
      }
    }, POLL_EVERY);
    return () => clearInterval(poll);
  }, [applyRemote, board.id]);

  // Save pending work when leaving the page, and warn if it might be lost.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty.current && !saving.current) return;
      void save();
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      // Leaving the board inside the app: send what is still pending.
      if (dirty.current) void save();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [save]);

  const saveTitle = async () => {
    const next = title.trim();
    if (!next || next === savedTitle.current || !board.canEdit) { setTitle(next || savedTitle.current); return; }
    try { await whiteboardApi.save(board.id, { title: next }); savedTitle.current = next; } catch { setStatus("error"); }
  };

  const openTasks = () => {
    const editor = api.current;
    if (!editor) return;
    setDrafts(tasksFromSelection(editor.getSceneElements(), editor.getAppState().selectedElementIds));
  };

  /** Notes that became tasks turn green, so the board shows what is already planned. */
  const markCreated = (keys: string[]) => {
    const editor = api.current;
    if (!editor) return;
    const done = new Set(keys);
    editor.updateScene({
      elements: editor.getSceneElementsIncludingDeleted().map(element =>
        done.has(element.id) && element.type !== "text"
          ? newElementWith(element, { backgroundColor: "#b2f2bb" })
          : element),
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  };

  return (
    <div className="flex h-[calc(100dvh-4.5rem)] min-h-[480px] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-2">
        <Button asChild variant="ghost" size="sm"><Link to="/dashboard/whiteboards" aria-label={t("whiteboards.back")}><ArrowLeft className="size-4" aria-hidden="true" /></Link></Button>
        <Input
          aria-label={t("whiteboards.titleLabel")}
          value={title}
          readOnly={!board.canEdit}
          maxLength={200}
          onChange={event => setTitle(event.target.value)}
          onBlur={() => void saveTitle()}
          onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }}
          className="h-9 max-w-xs border-transparent bg-transparent font-semibold shadow-none hover:border-border focus:border-border"
        />
        <span role="status" className="flex items-center gap-1 text-xs text-muted-foreground">
          {!board.canEdit ? t("whiteboards.readOnly")
            : status === "saving" ? <><Loader2 className="size-3.5 animate-spin" aria-hidden="true" />{t("whiteboards.saving")}</>
            : status === "error" ? <span className="flex items-center gap-1 text-destructive"><CloudOff className="size-3.5" aria-hidden="true" />{t("whiteboards.saveError")}</span>
            : <><Check className="size-3.5" aria-hidden="true" />{t("whiteboards.saved")}</>}
        </span>
        <div className="ms-auto">
          {board.canEdit && (
            <Button size="sm" variant="outline" disabled={!selectionHasText} onClick={openTasks} title={selectionHasText ? undefined : t("whiteboards.tasks.hint")}>
              <ListPlus className="size-4" aria-hidden="true" />{t("whiteboards.tasks.open")}
            </Button>
          )}
        </div>
      </div>
      <div className="relative min-h-0 flex-1" dir="ltr">
        <Excalidraw
          excalidrawAPI={editor => { api.current = editor; }}
          initialData={initialData}
          onChange={onChange}
          viewModeEnabled={!board.canEdit}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          langCode={LANGUAGES[i18n.language?.slice(0, 2) ?? "en"] ?? "en"}
          name={title}
          UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, export: { saveFileToDisk: true } } }}
        />
      </div>
      {drafts && (
        <TasksFromNotesDialog
          drafts={drafts}
          defaultProjectId={board.projectId}
          onClose={() => setDrafts(null)}
          onCreated={markCreated}
        />
      )}
    </div>
  );
}
