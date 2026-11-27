import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, Hash, Loader2, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MentionInput } from "@/components/common/MentionInput";
import { useFetchTasks } from "@/hooks/usefetchtasks";
import { cn } from "@/lib/utils";
import { usePostMessage, type Audience } from "./api";

/**
 * Message box. Internal messages get a blue "team only" bar; client messages an orange bar and border,
 * so nobody sends internal talk to the client by mistake. Enter sends, Shift+Enter adds a line.
 */
export function Composer({ conversationId, audience, projectId, parentId, clientName, allowApproval, allowTaskLinks = true, compact = false }: {
  conversationId: string; audience: Audience; projectId?: string | null; parentId?: string | null; clientName?: string | null;
  allowApproval?: boolean; allowTaskLinks?: boolean; compact?: boolean;
}) {
  const { t } = useTranslation();
  const post = usePostMessage(conversationId);
  const [body, setBody] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [linked, setLinked] = useState<{ id: string; title: string }[]>([]);
  const [approval, setApproval] = useState(false);
  const [taskQuery, setTaskQuery] = useState("");
  const tasks = useFetchTasks(projectId ? { projectId } : undefined, { enabled: allowTaskLinks });
  const toClient = audience === "client";
  const options = (tasks.data?.data ?? []).filter(task => !linked.some(item => item.id === task.id) && task.title.toLowerCase().includes(taskQuery.toLowerCase())).slice(0, 8);

  const send = () => {
    const text = body.trim();
    if (!text || post.isPending) return;
    post.mutate({ body: text, visibility: audience, parentId: parentId ?? null, mentions, taskRefs: linked.map(task => task.id), requestApproval: toClient && approval }, {
      onSuccess: () => { setBody(""); setMentions([]); setLinked([]); setApproval(false); },
      onError: error => toast.error((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("conversations.sendFailed")),
    });
  };

  return (
    <form className={cn("overflow-hidden rounded-xl bg-background", toClient ? "border-2 border-amber-500" : "border border-border")} onSubmit={event => { event.preventDefault(); send(); }}>
      {!parentId && (
        <p className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-semibold", toClient ? "bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200" : "bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200")}>
          {toClient ? <Eye className="size-3.5" aria-hidden="true" /> : <Lock className="size-3.5" aria-hidden="true" />}
          {toClient ? t("conversations.clientSees", { name: clientName ?? t("conversations.theClient") }) : t("conversations.teamOnly")}
        </p>
      )}
      {linked.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 px-3 pt-2">
          {linked.map(task => (
            <li key={task.id} className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              <Hash className="size-3" aria-hidden="true" />{task.title}
              <button type="button" aria-label={t("conversations.unlinkTask", { title: task.title })} onClick={() => setLinked(current => current.filter(item => item.id !== task.id))}><X className="size-3" aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      )}
      <label className="block px-3 pt-2">
        <span className="sr-only">{t("conversations.message")}</span>
        <MentionInput as="textarea" rows={compact ? 2 : 2} value={body} onChange={setBody} onMentionedUserIdsChange={setMentions}
          placeholder={parentId ? t("conversations.replyPlaceholder") : toClient ? t("conversations.clientPlaceholder", { name: clientName ?? t("conversations.theClient") }) : t("conversations.teamPlaceholder")}
          className="w-full resize-none border-0 bg-transparent text-sm outline-none"
          onSubmitKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} />
      </label>
      <div className="flex flex-wrap items-center gap-1 px-2 pb-2">
        {allowTaskLinks && !toClient && (
          <Popover>
            <PopoverTrigger asChild><Button type="button" size="icon" variant="ghost" className="size-8" aria-label={t("conversations.linkTask")}><Hash className="size-4" aria-hidden="true" /></Button></PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="start">
              <label className="text-xs font-medium">{t("conversations.linkTask")}
                <input className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-sm" value={taskQuery} onChange={event => setTaskQuery(event.target.value)} placeholder={t("conversations.searchTask")} />
              </label>
              <ul className="mt-2 max-h-56 overflow-y-auto">
                {options.map(task => (
                  <li key={task.id}><button type="button" className="w-full truncate rounded px-2 py-1.5 text-start text-sm hover:bg-muted" onClick={() => setLinked(current => [...current, { id: task.id, title: task.title }].slice(0, 10))}>{task.title}</button></li>
                ))}
                {!options.length && <li className="px-2 py-1.5 text-xs text-muted-foreground">{t("conversations.noTasks")}</li>}
              </ul>
            </PopoverContent>
          </Popover>
        )}
        {toClient && allowApproval && !parentId && (
          <label className="flex min-h-8 cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <input type="checkbox" checked={approval} onChange={event => setApproval(event.target.checked)} />{t("conversations.requestApproval")}
          </label>
        )}
        <Button type="submit" size="sm" disabled={!body.trim() || post.isPending}
          className={cn("ms-auto", toClient ? "bg-amber-700 text-white hover:bg-amber-800" : "bg-[#1797b9] text-white hover:bg-[#1797b9]/90")}>
          {post.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {parentId ? t("conversations.reply") : toClient ? t("conversations.sendToClient") : t("conversations.send")}
        </Button>
      </div>
    </form>
  );
}
