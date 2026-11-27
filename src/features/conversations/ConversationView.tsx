import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Loader2, Lock, X } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { useUser } from "@/providers/user.provider";
import { cn } from "@/lib/utils";
import { useMarkRead, useMessages, useThread, type Audience, type Conversation, type Message } from "./api";
import { Composer } from "./Composer";
import { MessageItem } from "./MessageItem";
import { useConversationSocket } from "./realtime";

const dayKey = (iso: string) => iso.slice(0, 10);

/** Whether a conversation has a client side (Team / Client tabs) for this viewer. */
export const hasClientSide = (conversation: Conversation) => !conversation.access.clientOnly && (conversation.access.postToClient || conversation.kind === "client");

export function ThreadView({ messageId, conversation, onClose, inline = false }: { messageId: string; conversation: Conversation; onClose: () => void; inline?: boolean }) {
  const { t } = useTranslation();
  const { data: session } = useUser();
  const thread = useThread(messageId);
  const names = useMentionNames();
  if (!thread.data) return <div className="p-4"><Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} /></div>;
  const audience: Audience = conversation.access.clientOnly ? "client" : thread.data.parent.visibility;
  return (
    <section aria-label={t("conversations.thread")} className={cn("flex flex-col gap-2", inline ? "ms-12 mt-1 border-s-2 border-border ps-3" : "h-full p-4")}>
      {!inline && (
        <div className="flex items-center">
          <h3 className="text-sm font-semibold">{t("conversations.thread")}</h3>
          <Button size="icon" variant="ghost" className="ms-auto size-8" aria-label={t("conversations.closeThread")} onClick={onClose}><X className="size-4" aria-hidden="true" /></Button>
        </div>
      )}
      {!inline && <MessageItem message={thread.data.parent} currentUserId={session?.user?.id ?? ""} mentionNames={names} clientView={conversation.access.clientOnly} canManage={conversation.access.manage} inThread />}
      <div className={cn("flex flex-col", !inline && "border-t border-border pt-2")}>
        {thread.data.replies.map(reply => (
          <MessageItem key={reply.id} message={reply} currentUserId={session?.user?.id ?? ""} mentionNames={names} clientView={conversation.access.clientOnly} canManage={conversation.access.manage} inThread />
        ))}
      </div>
      {conversation.access.post && <Composer conversationId={conversation.id} audience={audience} parentId={messageId} projectId={conversation.projectId} allowTaskLinks={false} compact />}
      {inline && <Button size="sm" variant="ghost" className="self-start" onClick={onClose}>{t("conversations.hideReplies")}</Button>}
    </section>
  );
}

function useMentionNames() {
  const { data } = useUser();
  const members = useGetCurrentOrgUserMembers();
  return useMemo(() => (data?.user?.role === "client" ? [] : (members.data?.data?.userMembers ?? []).map(member => member.user?.name ?? "").filter(Boolean)), [data?.user?.role, members.data]);
}

/**
 * One conversation: Team / Client tabs (when it has a client side), the messages by day, older pages on demand,
 * threads (side panel, or inline when compact) and the composer.
 */
export function ConversationView({ conversation, compact = false, onOpenThread, onOpenTask, initialAudience }: {
  conversation: Conversation; compact?: boolean; onOpenThread?: (messageId: string) => void; onOpenTask?: (taskId: string) => void; initialAudience?: Audience;
}) {
  const { t, i18n } = useTranslation();
  const { data: session } = useUser();
  useConversationSocket();
  const clientSide = hasClientSide(conversation);
  const [audience, setAudience] = useState<Audience>(conversation.access.clientOnly ? "client" : initialAudience ?? "internal");
  const effective: Audience | null = conversation.access.clientOnly ? "client" : clientSide ? audience : null;
  const messages = useMessages(conversation.id, effective);
  const [older, setOlder] = useState<Message[]>([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const [inlineThread, setInlineThread] = useState<string | null>(null);
  const markRead = useMarkRead();
  const names = useMentionNames();
  const bottom = useRef<HTMLDivElement>(null);
  const latest = messages.data?.messages ?? [];
  const all = [...older, ...latest.filter(message => !older.some(item => item.id === message.id))];
  const lastId = latest.at(-1)?.id;

  useEffect(() => { setOlder([]); setNoMore(false); }, [conversation.id, effective]);
  useEffect(() => {
    if (!lastId) return;
    markRead.mutate(conversation.id);
    bottom.current?.scrollIntoView?.({ block: "end" });
    // Only when a new latest message arrives.
  }, [lastId, conversation.id]);

  const loadOlder = async () => {
    const first = all[0];
    if (!first) return;
    setLoadingOlder(true);
    try {
      const response = await axios.get(`/conversations/${encodeURIComponent(conversation.id)}/messages`, { params: { audience: effective ?? undefined, before: first.createdAt } });
      const page = response.data.data as { messages: Message[]; hasMore: boolean };
      setOlder(current => [...page.messages, ...current]);
      if (!page.hasMore) setNoMore(true);
    } finally {
      setLoadingOlder(false);
    }
  };
  const openThread = (messageId: string) => (compact || !onOpenThread ? setInlineThread(current => (current === messageId ? null : messageId)) : onOpenThread(messageId));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {clientSide && (
        <div role="tablist" aria-label={t("conversations.whoSees")} className="flex gap-1 border-b border-border px-3">
          {(["internal", "client"] as const).map(option => (
            <button key={option} type="button" role="tab" aria-selected={audience === option} onClick={() => setAudience(option)}
              className={cn("flex min-h-10 items-center gap-1.5 border-b-[3px] px-3 text-sm", audience === option ? (option === "client" ? "border-amber-600 font-semibold" : "border-[#1797b9] font-semibold") : "border-transparent text-muted-foreground")}>
              {option === "client" ? <Eye className="size-4" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
              {option === "client" ? t("conversations.withClient") : t("conversations.team")}
            </button>
          ))}
        </div>
      )}
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-3 py-3", effective === "client" && !conversation.access.clientOnly && "bg-amber-50/40 dark:bg-amber-950/10")} aria-live="polite">
        {messages.isLoading ? <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} />
          : !all.length ? <p className="py-8 text-center text-sm text-muted-foreground">{effective === "client" ? t("conversations.emptyClient") : t("conversations.empty")}</p>
          : (
            <>
              {(messages.data?.hasMore && !noMore) && (
                <div className="mb-2 text-center"><Button size="sm" variant="ghost" disabled={loadingOlder} onClick={() => void loadOlder()}>{loadingOlder && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{t("conversations.loadOlder")}</Button></div>
              )}
              {all.map((message, index) => (
                <Fragment key={message.id}>
                  {(index === 0 || dayKey(all[index - 1].createdAt) !== dayKey(message.createdAt)) && (
                    <div className="my-3 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />
                      {new Date(message.createdAt).toLocaleDateString(i18n.language, { weekday: "long", day: "numeric", month: "long" })}<span className="h-px flex-1 bg-border" /></div>
                  )}
                  <MessageItem message={message} currentUserId={session?.user?.id ?? ""} mentionNames={names} clientView={conversation.access.clientOnly}
                    canManage={conversation.access.manage} onOpenThread={openThread} onOpenTask={onOpenTask}
                    footer={inlineThread === message.id ? <ThreadView messageId={message.id} conversation={conversation} onClose={() => setInlineThread(null)} inline /> : undefined} />
                </Fragment>
              ))}
            </>
          )}
        <div ref={bottom} />
      </div>
      {conversation.access.post ? (
        <div className="p-3">
          <Composer conversationId={conversation.id} audience={effective ?? "internal"} projectId={conversation.projectId} clientName={conversation.clientName ?? conversation.title}
            allowApproval={!conversation.access.clientOnly} allowTaskLinks={!conversation.access.clientOnly} compact={compact} />
        </div>
      ) : <p className="p-3 text-center text-xs text-muted-foreground">{t("conversations.readOnly")}</p>}
    </div>
  );
}
