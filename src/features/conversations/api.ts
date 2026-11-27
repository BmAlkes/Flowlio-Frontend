import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";

export type Audience = "internal" | "client";
export type Access = { read: boolean; post: boolean; postToClient: boolean; clientOnly: boolean; manage: boolean };
export type Conversation = {
  id: string; kind: "channel" | "project" | "task" | "client" | "direct"; name: string | null; title: string | null;
  projectId: string | null; taskId: string | null; clientId: string | null; clientName: string | null; access: Access;
  other?: { id: string; name: string; image: string | null };
};
export type SidebarRow = { conversationId: string | null; name: string | null; unread: number; fromClient: boolean; lastMessageAt: string | null;
  projectId?: string; clientId?: string; taskId?: string; userId?: string; image?: string | null; projectName?: string };
export type Sidebar = { channels: SidebarRow[]; projects: SidebarRow[]; clients: SidebarRow[]; directs: SidebarRow[]; tasks: SidebarRow[] };
export type Approval = { status: "pending" | "approved" | "changes"; requestedBy: string; decidedAt?: string; note?: string | null };
export type Message = {
  id: string; conversationId: string; authorId: string | null; authorKind: "member" | "client" | "system"; authorName: string | null; authorImage: string | null;
  visibility: Audience; body: string; parentId: string | null; mentions: string[]; approval: Approval | null;
  editedAt: string | null; deletedAt: string | null; createdAt: string;
  replies: { count: number; lastAt: string | null }; reactions: { emoji: string; count: number; mine: boolean }[];
  tasks: { id: string; title: string; status: string; endDate: string | null; assigneeName: string | null }[];
};
export type Context = { projectId: string } | { taskId: string } | { clientId: string };

const unwrap = <T,>(response: { data: { data: T } }) => response.data.data;
const base = "/conversations";

export function useSidebar() {
  const scope = useDataScope();
  return useQuery({ queryKey: ["conversations", scope], queryFn: async () => unwrap<Sidebar>(await axios.get(base)), refetchInterval: 30000 });
}

export function useConversation(id: string | null) {
  const scope = useDataScope();
  return useQuery({ queryKey: ["conversation", scope, id], enabled: !!id, queryFn: async () => unwrap<Conversation>(await axios.get(`${base}/${encodeURIComponent(id!)}`)) });
}

/** Finds or creates the conversation of a project, task or client. */
export function useContextConversation(context: Context | null) {
  const scope = useDataScope();
  return useQuery({
    queryKey: ["conversation-context", scope, context],
    enabled: !!context,
    queryFn: async () => unwrap<Conversation>(await axios.post(`${base}/context`, context)),
    staleTime: 5 * 60_000,
  });
}

export function useMessages(conversationId: string | null, audience: Audience | null, before?: string) {
  const scope = useDataScope();
  return useQuery({
    queryKey: ["conversation-messages", scope, conversationId, audience, before ?? null],
    enabled: !!conversationId,
    queryFn: async () => unwrap<{ messages: Message[]; hasMore: boolean }>(await axios.get(`${base}/${encodeURIComponent(conversationId!)}/messages`, { params: { audience: audience ?? undefined, before } })),
    // Socket events refresh this right away; the interval is the fallback when the socket is down.
    refetchInterval: 15000,
  });
}

export function useThread(messageId: string | null) {
  const scope = useDataScope();
  return useQuery({
    queryKey: ["conversation-thread", scope, messageId],
    enabled: !!messageId,
    queryFn: async () => unwrap<{ parent: Message; replies: Message[] }>(await axios.get(`${base}/messages/${encodeURIComponent(messageId!)}/thread`)),
    refetchInterval: 15000,
  });
}

function useRefresh() {
  const cache = useQueryClient();
  return () => {
    void cache.invalidateQueries({ queryKey: ["conversation-messages"] });
    void cache.invalidateQueries({ queryKey: ["conversation-thread"] });
    void cache.invalidateQueries({ queryKey: ["conversations"] });
  };
}

export type PostInput = { body: string; visibility: Audience; parentId?: string | null; mentions?: string[]; taskRefs?: string[]; requestApproval?: boolean };
export function usePostMessage(conversationId: string | null) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (input: PostInput) => unwrap<Message>(await axios.post(`${base}/${encodeURIComponent(conversationId!)}/messages`, input)),
    onSuccess: refresh,
  });
}

export function useMessageActions() {
  const refresh = useRefresh();
  const edit = useMutation({ mutationFn: async ({ id, body }: { id: string; body: string }) => axios.patch(`${base}/messages/${encodeURIComponent(id)}`, { body }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: async (id: string) => axios.delete(`${base}/messages/${encodeURIComponent(id)}`), onSuccess: refresh });
  const react = useMutation({ mutationFn: async ({ id, emoji }: { id: string; emoji: string }) => axios.post(`${base}/messages/${encodeURIComponent(id)}/reactions`, { emoji }), onSuccess: refresh });
  const decide = useMutation({
    mutationFn: async ({ id, decision, note }: { id: string; decision: "approved" | "changes"; note?: string }) => axios.post(`${base}/messages/${encodeURIComponent(id)}/approval`, { decision, note }),
    onSuccess: refresh,
  });
  return { edit, remove, react, decide };
}

export function useMarkRead() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => axios.post(`${base}/${encodeURIComponent(conversationId)}/read`),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useCreateChannel() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => unwrap<Conversation>(await axios.post(`${base}/channels`, { name })),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useOpenDirect() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => unwrap<Conversation>(await axios.post(`${base}/direct`, { userId })),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export const REACTIONS = ["👍", "❤️", "🎉", "😄", "👀", "✅"];
