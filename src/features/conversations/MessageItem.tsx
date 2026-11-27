import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, CircleDashed, ListTodo, MessageSquare, Pencil, SmilePlus, Trash2, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { REACTIONS, useMessageActions, type Message } from "./api";

const COLORS = ["#db2777", "#7c3aed", "#0891b2", "#ea580c", "#16a34a", "#2563eb"];
export const colorFor = (seed: string) => COLORS[[...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLORS.length];

export function Avatar({ name, image, seed, size = 36, client = false }: { name: string; image?: string | null; seed: string; size?: number; client?: boolean }) {
  if (image) return <img src={image} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-full text-xs font-bold"
      style={{ width: size, height: size, background: client ? "#fef3c7" : colorFor(seed), color: client ? "#92400e" : "#fff" }}>
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

/** Message text with @mentions of known people highlighted. Text is never rendered as HTML. */
function Body({ text, names }: { text: string; names: string[] }) {
  if (!names.length) return <>{text}</>;
  const escaped = names.filter(Boolean).sort((a, b) => b.length - a.length).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(@(?:${escaped.join("|")}))`, "g"));
  return <>{parts.map((part, index) => (part.startsWith("@") && names.includes(part.slice(1))
    ? <span key={index} className="rounded bg-[#1797b9]/12 px-1 font-semibold text-[#0c5568] dark:text-[#7dd3e8]">{part}</span>
    : <span key={index}>{part}</span>))}</>;
}

function ApprovalCard({ message, canDecide }: { message: Message; canDecide: boolean }) {
  const { t } = useTranslation();
  const { decide } = useMessageActions();
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const approval = message.approval!;
  const tone = approval.status === "approved" ? "text-emerald-700 dark:text-emerald-400" : approval.status === "changes" ? "text-amber-700 dark:text-amber-400" : "text-amber-700 dark:text-amber-400";
  return (
    <div className="mt-2 max-w-md rounded-xl border border-border bg-background p-3 text-sm">
      <p className={cn("flex items-center gap-2 font-semibold", tone)}>
        {approval.status === "approved" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : approval.status === "changes" ? <Wrench className="size-4" aria-hidden="true" /> : <CircleDashed className="size-4" aria-hidden="true" />}
        {t(`conversations.approval.${approval.status}`)}
      </p>
      {approval.note && <p className="mt-1 text-muted-foreground">{approval.note}</p>}
      {canDecide && approval.status === "pending" && (
        asking ? (
          <form className="mt-2 flex flex-col gap-2" onSubmit={event => { event.preventDefault(); decide.mutate({ id: message.id, decision: "changes", note: note.trim() || undefined }); }}>
            <label className="text-xs font-medium">{t("conversations.approval.whatToChange")}
              <textarea className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm" rows={2} value={note} onChange={event => setNote(event.target.value)} />
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={decide.isPending}>{t("conversations.approval.sendChanges")}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAsking(false)}>{t("conversations.cancel")}</Button>
            </div>
          </form>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" className="bg-emerald-700 text-white hover:bg-emerald-800" disabled={decide.isPending} onClick={() => decide.mutate({ id: message.id, decision: "approved" })}>{t("conversations.approval.approve")}</Button>
            <Button size="sm" variant="outline" onClick={() => setAsking(true)}>{t("conversations.approval.requestChanges")}</Button>
          </div>
        )
      )}
    </div>
  );
}

export function MessageItem({ message, currentUserId, mentionNames, clientView, canManage, onOpenThread, onOpenTask, inThread = false, footer }: {
  message: Message; currentUserId: string; mentionNames: string[]; clientView: boolean; canManage: boolean;
  onOpenThread?: (id: string) => void; onOpenTask?: (taskId: string) => void; inThread?: boolean; footer?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const { edit, remove, react } = useMessageActions();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const time = new Date(message.createdAt).toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });
  const mine = message.authorId === currentUserId;

  if (message.authorKind === "system") {
    return (
      <div className="flex items-center gap-3 py-1 text-[13px] text-muted-foreground">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted"><Zap className="size-4" aria-hidden="true" /></span>
        <span><Body text={message.body} names={[]} /> <span className="text-xs">{time}</span></span>
      </div>
    );
  }
  if (message.deletedAt) {
    return <p className="py-1 ps-12 text-[13px] italic text-muted-foreground">{t("conversations.deleted")}</p>;
  }
  const name = message.authorName ?? t("conversations.someone");
  return (
    <article className="group relative flex gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/40">
      <Avatar name={name} image={message.authorImage} seed={message.authorId ?? name} client={message.authorKind === "client"} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <strong>{name}</strong>
          {message.authorKind === "client" && <span className="rounded-full bg-amber-100 px-2 text-[11px] font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">{t("conversations.client")}</span>}
          <time className="text-xs text-muted-foreground" dateTime={message.createdAt}>{time}</time>
          {message.editedAt && <span className="text-xs text-muted-foreground">{t("conversations.edited")}</span>}
        </p>
        {editing ? (
          <form className="mt-1 flex flex-col gap-2" onSubmit={event => { event.preventDefault(); if (draft.trim()) edit.mutate({ id: message.id, body: draft.trim() }, { onSuccess: () => setEditing(false) }); }}>
            <label className="sr-only" htmlFor={`edit-${message.id}`}>{t("conversations.editMessage")}</label>
            <textarea id={`edit-${message.id}`} className="w-full rounded-md border border-border bg-background p-2 text-sm" rows={2} value={draft} onChange={event => setDraft(event.target.value)} />
            <div className="flex gap-2"><Button size="sm" type="submit" disabled={edit.isPending}>{t("conversations.save")}</Button><Button size="sm" type="button" variant="ghost" onClick={() => setEditing(false)}>{t("conversations.cancel")}</Button></div>
          </form>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed"><Body text={message.body} names={mentionNames} /></p>
        )}
        {message.tasks.map(task => (
          <button key={task.id} type="button" onClick={() => onOpenTask?.(task.id)}
            className="mt-2 flex max-w-md items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-start hover:border-[#1797b9]/50">
            <span className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100"><ListTodo className="size-4" aria-hidden="true" /></span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold">{task.title}</span>
              <span className="block text-xs text-muted-foreground">{t(`conversations.status.${task.status}`, { defaultValue: task.status })}{task.assigneeName ? ` · ${task.assigneeName}` : ""}{task.endDate ? ` · ${new Date(task.endDate).toLocaleDateString(i18n.language)}` : ""}</span></span>
          </button>
        ))}
        {message.approval && <ApprovalCard message={message} canDecide={clientView} />}
        {(message.reactions.length > 0 || (!inThread && message.replies.count > 0)) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {message.reactions.map(reaction => (
              <button key={reaction.emoji} type="button" aria-pressed={reaction.mine} onClick={() => react.mutate({ id: message.id, emoji: reaction.emoji })}
                className={cn("rounded-full border px-2 py-0.5 text-[13px]", reaction.mine ? "border-[#1797b9]/60 bg-[#1797b9]/10" : "border-border bg-background")}>
                {reaction.emoji} {reaction.count}
              </button>
            ))}
            {!inThread && message.replies.count > 0 && (
              <button type="button" onClick={() => onOpenThread?.(message.id)} className="ms-1 text-[13px] font-semibold text-[#11718c] hover:underline dark:text-[#55bdd9]">
                {t("conversations.replies", { count: message.replies.count })}
              </button>
            )}
          </div>
        )}
        {footer}
      </div>
      <div className="absolute end-2 top-1 hidden items-center gap-0.5 rounded-lg border border-border bg-background p-0.5 shadow-sm group-hover:flex group-focus-within:flex">
        <Popover>
          <PopoverTrigger asChild><Button size="icon" variant="ghost" className="size-7" aria-label={t("conversations.react")}><SmilePlus className="size-4" aria-hidden="true" /></Button></PopoverTrigger>
          <PopoverContent className="flex w-auto gap-1 p-1" align="end">
            {REACTIONS.map(emoji => <button key={emoji} type="button" className="rounded p-1 text-lg hover:bg-muted" aria-label={emoji} onClick={() => react.mutate({ id: message.id, emoji })}>{emoji}</button>)}
          </PopoverContent>
        </Popover>
        {!inThread && onOpenThread && <Button size="icon" variant="ghost" className="size-7" aria-label={t("conversations.reply")} onClick={() => onOpenThread(message.id)}><MessageSquare className="size-4" aria-hidden="true" /></Button>}
        {mine && <Button size="icon" variant="ghost" className="size-7" aria-label={t("conversations.editMessage")} onClick={() => { setDraft(message.body); setEditing(true); }}><Pencil className="size-4" aria-hidden="true" /></Button>}
        {(mine || canManage) && <Button size="icon" variant="ghost" className="size-7 text-destructive" aria-label={t("conversations.delete")} onClick={() => { if (window.confirm(t("conversations.deleteConfirm"))) remove.mutate(message.id); }}><Trash2 className="size-4" aria-hidden="true" /></Button>}
      </div>
    </article>
  );
}
