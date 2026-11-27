import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FolderKanban, ListTodo, Loader2, MessagesSquare, UsersRound } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { cn } from "@/lib/utils";
import { useConversation, useSidebar, type Context, type Conversation, type SidebarRow } from "@/features/conversations/api";
import { ConversationView } from "@/features/conversations/ConversationView";
import { useConversationSocket } from "@/features/conversations/realtime";

/** Client portal: the client's projects, shared tasks and the general conversation with the agency. Only CLIENT messages exist here. */
export default function ClientConversationsPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("c");
  useConversationSocket();
  const sidebar = useSidebar();
  const selected = useConversation(selectedId);

  useEffect(() => { document.title = `${t("conversations.title")} - Flowlio`; }, [t]);

  const open = async (row: SidebarRow, context: Context | null) => {
    if (row.conversationId) { setParams({ c: row.conversationId }); return; }
    if (!context) return;
    try { setParams({ c: (await axios.post<{ data: Conversation }>("/conversations/context", context)).data.data.id }); }
    catch { toast.error(t("conversations.openFailed")); }
  };
  const item = (row: SidebarRow, label: string, icon: React.ReactNode, context: Context | null) => (
    <li key={row.conversationId ?? label}>
      <button type="button" onClick={() => void open(row, context)} aria-current={row.conversationId === selectedId ? "page" : undefined}
        className={cn("flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-3 text-start", row.conversationId && row.conversationId === selectedId ? "border-[#1797b9] ring-1 ring-[#1797b9]" : "border-border hover:border-[#1797b9]/50")}>
        {icon}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{label}</span>
        {row.unread > 0 && <span className="rounded-full bg-[#1797b9] px-1.5 text-[11px] font-bold text-white">{row.unread}</span>}
      </button>
    </li>
  );
  const data = sidebar.data;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-wrap gap-5 p-4 md:p-6">
      <nav aria-label={t("conversations.title")} className="flex min-w-0 flex-[1_1_260px] flex-col gap-3 md:max-w-[320px]">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><MessagesSquare className="size-6 text-[#1797b9]" aria-hidden="true" />{t("conversations.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("conversations.portalHint")}</p>
        {sidebar.isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} />}
        {data && (
          <ul className="flex flex-col gap-2">
            {data.clients.map(row => item(row, t("conversations.agencyTeam"), <UsersRound className="size-5 text-[#1797b9]" aria-hidden="true" />, row.clientId ? { clientId: row.clientId } : null))}
            {data.projects.map(row => item(row, row.name ?? "", <FolderKanban className="size-5 text-[#1797b9]" aria-hidden="true" />, row.projectId ? { projectId: row.projectId } : null))}
            {data.tasks.map(row => item(row, row.name ?? "", <ListTodo className="size-5 text-muted-foreground" aria-hidden="true" />, null))}
          </ul>
        )}
      </nav>
      <main className="flex h-[calc(100dvh-9rem)] min-h-[480px] min-w-0 flex-[999_1_480px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
        {!selectedId ? (
          <p className="m-auto p-8 text-center text-sm text-muted-foreground">{t("conversations.portalPick")}</p>
        ) : !selected.data ? (
          selected.isError ? <p className="m-auto p-8 text-sm text-muted-foreground">{t("conversations.unavailable")}</p> : <Loader2 className="m-auto size-6 animate-spin text-muted-foreground" aria-label={t("conversations.loading")} />
        ) : (
          <>
            <header className="border-b border-border px-5 py-3">
              <h2 className="text-lg font-semibold">{selected.data.kind === "client" ? t("conversations.agencyTeam") : selected.data.title}</h2>
              <p className="text-xs text-muted-foreground">{t("conversations.portalHeader")}</p>
            </header>
            <div className="min-h-0 flex-1"><ConversationView key={selected.data.id} conversation={selected.data} /></div>
          </>
        )}
      </main>
    </div>
  );
}
