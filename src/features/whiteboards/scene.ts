/** Pure helpers for the whiteboard editor: what to save, and which selected notes become tasks. */
type SceneElement = {
  id: string;
  type: string;
  isDeleted?: boolean;
  text?: string;
  originalText?: string;
  containerId?: string | null;
  fileId?: string | null;
  boundElements?: readonly { id: string; type: string }[] | null;
  groupIds?: readonly string[];
};

export type TaskDraft = { key: string; title: string; description: string };

const TITLE_MAX = 200;

/**
 * Each selected note (a shape with text inside, or a loose text) becomes one task:
 * the first line is the title, the other lines the description. Empty notes are skipped.
 */
export function tasksFromSelection(elements: readonly SceneElement[], selectedIds: Record<string, boolean>): TaskDraft[] {
  const live = elements.filter(element => !element.isDeleted);
  const byId = new Map(live.map(element => [element.id, element]));
  const selected = live.filter(element => selectedIds[element.id]);
  const seen = new Set<string>();
  const drafts: TaskDraft[] = [];
  for (const element of selected) {
    // A text inside a shape counts once, through its container.
    const container = element.type === "text" && element.containerId ? byId.get(element.containerId) : undefined;
    const owner = container ?? element;
    if (seen.has(owner.id)) continue;
    seen.add(owner.id);
    const text = owner.type === "text"
      ? owner.originalText ?? owner.text
      : owner.boundElements?.map(bound => byId.get(bound.id)).find(child => child?.type === "text")?.originalText
        ?? owner.boundElements?.map(bound => byId.get(bound.id)).find(child => child?.type === "text")?.text;
    const lines = (text ?? "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!lines.length) continue;
    drafts.push({ key: owner.id, title: lines[0].slice(0, TITLE_MAX), description: lines.slice(1).join("\n") });
  }
  return drafts;
}

/** Image files the board uses that the server does not have yet. */
export function newFiles<T extends { id: string }>(elements: readonly SceneElement[], files: Record<string, T>, savedIds: ReadonlySet<string>) {
  const used = new Set(elements.filter(element => element.type === "image" && !element.isDeleted && element.fileId).map(element => String(element.fileId)));
  return Object.fromEntries(Object.entries(files).filter(([id]) => used.has(id) && !savedIds.has(id)));
}

/** Image ids the scene references but the editor has not loaded (added by someone else). */
export function missingFileIds(elements: readonly SceneElement[], loaded: Record<string, unknown>) {
  return [...new Set(elements.filter(element => element.type === "image" && !element.isDeleted && element.fileId && !loaded[String(element.fileId)]).map(element => String(element.fileId)))];
}
