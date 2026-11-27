import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FolderKanban, Hash, ListTodo, Loader2, MessagesSquare, Plus, Search, UserRound } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { useUser } from "@/providers/user.provider";
import { cn } from "@/lib/utils";
import { useConversation, useCreateChannel, useOpenDirect, useSidebar, type Context, type Conversation, type SidebarRow } from "@/features/conversations/api";
import { ConversationView, ThreadView, hasClientSide } from "@/features/conversations/ConversationView";
import { Avatar } from "@/features/conversations/MessageItem";
import { useConversationSocket } from "@/features/conversations/realtime";

function Row({ row, label, icon, active, onOpen }: { row: SidebarRow; label: string; icon: React.ReactNode; active: boolean; onOpen: () => void }) {
  return (
    <li>
      <button type="button" onClick={onOpen} aria-current={active ? "page" : undefined}
        className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start text-sm", active ? "bg-[#1797b9]/12 font-semibold text-[#0c5568] dark:text-[#7dd3e8]" : row.unread ? "font-semibold" : "text-foreground/80 hover:bg-muted")}>
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {row.fromClient && row.unread > 0 && <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />}
        {row.unread > 0 && <span className={cn("rounded-full px-1.5 text-[11px] font-bold", row.fromClient ? "bg-amber-500 text-amber-950" : "bg-[#1797b9] text-white")}>{row.unread}</span>}
      </button>
    </li>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-0.5">
      <div className="flex items-center px-2.5 pb-1"><h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>{action}</div>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </section>
  );
}

export default function ConversationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("c");
  const { data: session } = useUser();
  useConversationSocket();
  const sidebar = useSidebar();
  const selected = useConversation(selectedId);
  const members = useGetCurrentOrgUserMembers();
  const createChannel = useCreateChannel();
  const openDirect = useOpenDirect();
  const [filter, setFilter] = useState("");
  const [thread, setThread] = useState<string | null>(null);
  const [newChannel, setNewChannel] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const canCreateChannel = ["superadmin", "subadmin", "user"].includes(session?.user?.role ?? "");

  useEffect(() => { document.title = `${t("conversations.title")} - Flowlio`; }, [t]);
  useEffect(() => { setThread(null); }, [selectedId]);

  const select = (conversationId: string) => setParams({ c: conversationId });
  const openContext = async (context: Context) => {
    setOpening(true);
    try { select((await axios.post<{ data: Conversation }>("/conversations/context", context)).data.data.id); }
    catch { toast.error(t("conversations.openFailed")); }
    finally { setOpening(false); }
  };
  const open = (row: SidebarRow, context?: Context) => (row.conversationId ? select(row.conversationId) : context ? void openContext(context) : undefined);
  const match = (text?: string | null) => !filter.trim() || (text ?? "").toLowerCase().includes(filter.trim().toLowerCase());
  const data = sidebar.data;
  const others = useMemo(() => (members.data?.data?.userMembers ?? []).filter(member => member.user && member.user.id !== session?.user?.id), [members.data, session?.user?.id]);

  const submitChannel = () => {
    if (!newChannel?.trim()) return;
    createChannel.mutate(newChannel.trim(), {
      onSuccess: channel => { setNewChannel(null); select(channel.id); },
      onError: error => toast.error((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("conversations.channelFailed")),
    });
  };

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-wrap overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <nav aria-label={t("conversations.title")} className="flex max-h-[calc(100dvh-6rem)] min-w-0 flex-[1_1_240px] flex-col border-e border-border bg-muted/20 md:max-w-[280px]">
        <div className="flex items-center gap-2 px-4 pb-2 pt-4">
          <h1 className="flex items-center gap-2 text-xl font-bold"><MessagesSquare className="size-5 text-[#1797b9]" aria-hidden="true" />{t("conversations.title")}</h1>
          {opening && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} />}
        </div>
        <label className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">{t("conversations.search")}</span>
          <input type="search" value={filter} onChange={event => setFilter(event.target.value)} placeholder={t("conversations.search")} className="h-9 w-full bg-transparent text-sm outline-none" />
        </label>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
          {sidebar.isLoading && <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} />}
          {data && (
            <>
              <Section title={t("conversations.channels")} action={canCreateChannel && (
                <Button size="icon" variant="ghost" className="ms-auto size-6" aria-label={t("conversations.newChannel")} onClick={() => setNewChannel("")}><Plus className="size-3.5" aria-hidden="true" /></Button>
              )}>
                {data.channels.filter(row => match(row.name)).map(row => <Row key={row.conversationId} row={row} label={row.name ?? ""} icon={<Hash className="size-4 text-muted-foreground" aria-hidden="true" />} active={row.conversationId === selectedId} onOpen={() => open(row)} />)}
              </Section>
              {data.projects.length > 0 && (
                <Section title={t("conversations.projects")}>
                  {data.projects.filter(row => match(row.name)).map(row => <Row key={row.projectId} row={row} label={row.name ?? ""} icon={<FolderKanban className="size-4 text-[#1797b9]" aria-hidden="true" />} active={!!row.conversationId && row.conversationId === selectedId} onOpen={() => open(row, { projectId: row.projectId! })} />)}
                </Section>
              )}
              {data.tasks.length > 0 && (
                <Section title={t("conversations.tasks")}>
                  {data.tasks.filter(row => match(row.name)).map(row => <Row key={row.conversationId} row={row} label={row.name ?? ""} icon={<ListTodo className="size-4 text-muted-foreground" aria-hidden="true" />} active={row.conversationId === selectedId} onOpen={() => open(row)} />)}
                </Section>
              )}
              {data.clients.length > 0 && (
                <Section title={t("conversations.clients")}>
                  {data.clients.filter(row => match(row.name)).map(row => <Row key={row.clientId} row={row} label={row.name ?? ""} icon={<Avatar name={row.name ?? "?"} seed={row.clientId ?? ""} size={22} client />} active={!!row.conversationId && row.conversationId === selectedId} onOpen={() => open(row, { clientId: row.clientId! })} />)}
                </Section>
              )}
              <Section title={t("conversations.directs")} action={(
                <Popover>
                  <PopoverTrigger asChild><Button size="icon" variant="ghost" className="ms-auto size-6" aria-label={t("conversations.newDirect")}><Plus className="size-3.5" aria-hidden="true" /></Button></PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{t("conversations.newDirect")}</p>
                    <ul className="max-h-64 overflow-y-auto">
                      {others.map(member => (
                        <li key={member.user!.id}><button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-sm hover:bg-muted"
                          onClick={() => openDirect.mutate(member.user!.id, { onSuccess: conversation => select(conversation.id) })}>
                          <Avatar name={member.user!.name} seed={member.user!.id} size={22} />{member.user!.name}</button></li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              )}>
                {data.directs.filter(row => match(row.name)).map(row => <Row key={row.conversationId} row={row} label={row.name ?? ""} icon={<Avatar name={row.name ?? "?"} image={row.image} seed={row.userId ?? ""} size={22} />} active={row.conversationId === selectedId} onOpen={() => open(row)} />)}
              </Section>
            </>
          )}
        </div>
      </nav>

      <main className="flex max-h-[calc(100dvh-6rem)] min-w-0 flex-[999_1_480px] flex-col">
        {!selectedId ? (
          <div className="m-auto flex max-w-sm flex-col items-center gap-2 p-8 text-center">
            <MessagesSquare className="size-10 text-[#1797b9]" aria-hidden="true" />
            <p className="font-semibold">{t("conversations.pickTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("conversations.pickText")}</p>
          </div>
        ) : !selected.data ? (
          selected.isError ? <p className="m-auto p-8 text-sm text-muted-foreground">{t("conversations.unavailable")}</p> : <Loader2 className="m-auto size-6 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} />
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
              {selected.data.kind === "channel" ? <Hash className="size-5 text-muted-foreground" aria-hidden="true" />
                : selected.data.kind === "direct" ? <Avatar name={selected.data.title ?? "?"} image={selected.data.other?.image} seed={selected.data.other?.id ?? ""} size={32} />
                : selected.data.kind === "client" ? <UserRound className="size-5 text-amber-600" aria-hidden="true" />
                : <FolderKanban className="size-5 text-[#1797b9]" aria-hidden="true" />}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{selected.data.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {t(`conversations.kinds.${selected.data.kind}`)}{selected.data.clientName ? ` · ${t("conversations.clientIs", { name: selected.data.clientName })}` : ""}
                  {hasClientSide(selected.data) ? ` · ${t("conversations.twoAudiences")}` : ""}
                </p>
              </div>
              {selected.data.projectId && (
                <Button size="sm" variant="link" className="ms-auto" onClick={() => navigate(selected.data.taskId ? `/dashboard/task-management?task=${selected.data.taskId}` : `/dashboard/project/view/${selected.data.projectId}`)}>
                  {selected.data.taskId ? t("conversations.openTask") : t("conversations.openProject")}
                </Button>
              )}
            </header>
            <div className="min-h-0 flex-1">
              <ConversationView key={selected.data.id} conversation={selected.data} onOpenThread={setThread}
                onOpenTask={taskId => navigate(`/dashboard/task-management?task=${taskId}`)} />
            </div>
          </>
        )}
      </main>

      {thread && selected.data && (
        <aside aria-label={t("conversations.thread")} className="max-h-[calc(100dvh-6rem)] min-w-0 flex-[1_1_300px] overflow-y-auto border-s border-border bg-muted/10 md:max-w-[360px]">
          <ThreadView messageId={thread} conversation={selected.data} onClose={() => setThread(null)} />
        </aside>
      )}

      {newChannel !== null && (
        <Dialog open onOpenChange={open => { if (!open) setNewChannel(null); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>{t("conversations.newChannel")}</DialogTitle><DialogDescription>{t("conversations.newChannelHint")}</DialogDescription></DialogHeader>
            <form onSubmit={event => { event.preventDefault(); submitChannel(); }} className="space-y-3">
              <label className="flex flex-col gap-1 text-sm font-medium">{t("conversations.channelName")}
                <Input autoFocus value={newChannel} maxLength={40} placeholder="design" onChange={event => setNewChannel(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
              </label>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewChannel(null)}>{t("conversations.cancel")}</Button>
                <Button type="submit" disabled={!newChannel.trim() || createChannel.isPending}>{t("conversations.create")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
