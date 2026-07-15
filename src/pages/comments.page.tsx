import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { format } from "date-fns";
import {
  Search,
  MessageCircleMore,
  FolderOpen,
  CheckSquare,
  CornerDownRight,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
  Reply,
  Send,
  Trash2,
  Pencil,
  X,
  Check,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flex } from "@/components/ui/flex";
import { Box } from "@/components/ui/box";
import {
  useFetchAllOrgComments,
  OrgComment,
} from "@/hooks/usefetchallorgcomments";
import {
  useFetchOrgInteractions,
  OrgInteraction,
} from "@/hooks/useFetchOrgInteractions";
import { useDeleteProjectComment } from "@/hooks/usedeleteprojectcomment";
import { useUpdateProjectComment } from "@/hooks/useupdateprojectcomment";
import { useReplyToInteraction } from "@/hooks/useReplyToInteraction";
import { useDeleteOrgInteraction } from "@/hooks/useDeleteOrgInteraction";
import { useCreateOrgInteraction } from "@/hooks/useCreateOrgInteraction";
import { useFetchOrganizationClients } from "@/hooks/usefetchclients";
import { useUser } from "@/providers/user.provider";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

// ── Project comment row ───────────────────────────────────────────────────────
function CommentRow({ comment }: { comment: OrgComment }) {
  const { data: userData } = useUser();
  const currentUserId = userData?.user?.id ?? "";
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const deleteComment = useDeleteProjectComment();
  const updateComment = useUpdateProjectComment();
  const isOwner = currentUserId === comment.userId;

  const handleSave = () => {
    const text = editContent.trim();
    if (!text || updateComment.isPending) return;
    updateComment.mutate(
      { commentId: comment.id, content: text, projectId: comment.projectId, taskId: comment.taskId },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <Box className={cn(
      "bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow",
      comment.parentId && "ms-6 border-s-4 border-s-blue-200"
    )}>
      <Flex className="justify-between items-start gap-3">
        <Flex className="gap-3 items-start flex-1 min-w-0">
          <Box className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {comment.userName.charAt(0).toUpperCase()}
          </Box>
          <Box className="flex-1 min-w-0">
            <Flex className="gap-2 items-center flex-wrap mb-1">
              <span className="font-semibold text-sm text-foreground">{comment.userName}</span>
              {comment.parentId && (
                <Flex className="gap-1 items-center text-xs text-blue-500">
                  <CornerDownRight className="w-3 h-3" />
                  <span>Reply</span>
                </Flex>
              )}
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.createdAt), "MMM d, yyyy · h:mm a")}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-xs italic text-muted-foreground">(edited)</span>
              )}
            </Flex>
            <Flex className="gap-2 mb-2 flex-wrap">
              <Flex className="gap-1 items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
                <FolderOpen className="w-3 h-3" />
                {comment.projectName}
              </Flex>
              {comment.taskTitle && (
                <Flex className="gap-1 items-center bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium px-2 py-0.5 rounded-full">
                  <CheckSquare className="w-3 h-3" />
                  {comment.taskTitle}
                </Flex>
              )}
            </Flex>
            {editing ? (
              <Flex className="gap-2 mt-1">
                <textarea
                  className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-[#0c89af] resize-none"
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); }
                    if (e.key === "Escape") setEditing(false);
                  }}
                  autoFocus
                />
                <Flex className="flex-col gap-1">
                  <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-green-600" onClick={handleSave} disabled={updateComment.isPending}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-muted-foreground" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </Box>
        </Flex>
        {isOwner && !editing && (
          <Flex className="gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-muted-foreground hover:text-blue-600" onClick={() => { setEditContent(comment.content); setEditing(true); }} title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-muted-foreground hover:text-red-600" onClick={() => deleteComment.mutate(comment.id)} disabled={deleteComment.isPending} title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

// ── Client message row ────────────────────────────────────────────────────────
function InteractionRow({ item }: { item: OrgInteraction }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyMutation = useReplyToInteraction();
  const deleteMutation = useDeleteOrgInteraction();

  const handleReply = () => {
    const text = replyText.trim();
    if (!text || replyMutation.isPending) return;
    replyMutation.mutate(
      { interactionId: item.id, content: text },
      { onSuccess: () => { setReplyText(""); setShowReply(false); } }
    );
  };

  return (
    <Box className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
      <Flex className="gap-3 items-start">
        <Box className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {item.clientName.charAt(0).toUpperCase()}
        </Box>
        <Box className="flex-1 min-w-0">
          <Flex className="justify-between items-start gap-2">
            <Flex className="gap-2 items-center flex-wrap mb-1">
              <span className="font-semibold text-sm text-foreground">{item.clientName}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
              </span>
            </Flex>
            <Button
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-red-600 shrink-0"
              onClick={() => deleteMutation.mutate(item.id)}
              disabled={deleteMutation.isPending}
              title="Delete message"
            >
              {deleteMutation.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
            </Button>
          </Flex>
          <Flex className="gap-2 mb-2">
            <Flex className="gap-1 items-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full">
              <UserCircle2 className="w-3 h-3" />
              Client Message
            </Flex>
          </Flex>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {item.content}
          </p>

          {/* Replies */}
          {item.replies && item.replies.length > 0 && (
            <Box className="mt-3 space-y-2 border-s-2 border-indigo-200 ps-3">
              {item.replies.map((reply) => (
                <Box key={reply.id} className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-3">
                  <Flex className="gap-2 items-center mb-1 flex-wrap">
                    <Box className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {reply.userName.charAt(0).toUpperCase()}
                    </Box>
                    <span className="text-xs font-semibold text-foreground">{reply.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reply.createdAt), "MMM d, yyyy · h:mm a")}
                    </span>
                    <Flex className="gap-1 items-center text-xs text-teal-600 dark:text-teal-400">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Reply to client</span>
                    </Flex>
                  </Flex>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {reply.content}
                  </p>
                </Box>
              ))}
            </Box>
          )}

          {/* Reply form */}
          {showReply ? (
            <Box className="mt-3">
              <Flex className="gap-2 items-end">
                <textarea
                  className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-[#0c89af] resize-none"
                  rows={2}
                  placeholder="Write a reply to the client..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }
                    if (e.key === "Escape") { setShowReply(false); setReplyText(""); }
                  }}
                  autoFocus
                />
                <Flex className="flex-col gap-1 shrink-0">
                  <Button size="sm" className="w-8 h-8 p-0 bg-indigo-600 hover:bg-indigo-500" onClick={handleReply} disabled={!replyText.trim() || replyMutation.isPending} title="Send reply">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground" onClick={() => { setShowReply(false); setReplyText(""); }} title="Cancel">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 gap-1"
              onClick={() => setShowReply(true)}
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </Button>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

// ── New Message form ──────────────────────────────────────────────────────────
function NewMessageForm({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("");
  const [content, setContent] = useState("");
  const { data: clientsData } = useFetchOrganizationClients();
  const clients = clientsData?.data ?? [];
  const createMsg = useCreateOrgInteraction();

  const handleSend = () => {
    if (!clientId || !content.trim() || createMsg.isPending) return;
    createMsg.mutate(
      { clientId, content: content.trim() },
      { onSuccess: () => { setClientId(""); setContent(""); onClose(); } }
    );
  };

  return (
    <Box className="bg-card rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 mb-4 shadow-sm">
      <Flex className="justify-between items-center mb-3">
        <span className="text-sm font-semibold text-foreground">New Message to Client</span>
        <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-muted-foreground" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </Flex>
      <Box className="space-y-3">
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full text-sm bg-muted rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-indigo-400 text-foreground"
        >
          <option value="">Select a client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
          ))}
        </select>
        <textarea
          className="w-full text-sm bg-muted rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-indigo-400 resize-none"
          rows={3}
          placeholder="Write your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            if (e.key === "Escape") onClose();
          }}
        />
        <Flex className="justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 gap-1.5"
            onClick={handleSend}
            disabled={!clientId || !content.trim() || createMsg.isPending}
          >
            {createMsg.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send Message
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Tab = "comments" | "messages";

export const CommentsPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() =>
    searchParams.get("tab") === "messages" ? "messages" : "comments"
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "messages") setTab("messages");
  }, [searchParams]);

  // Project comments
  const { data: commentsData, isLoading: commentsLoading, isError: commentsError, error: commentsErrorObj } = useFetchAllOrgComments({ page, limit: PAGE_SIZE });
  const hasCommentsApiError = !commentsLoading && commentsData !== undefined && !Array.isArray(commentsData?.data);
  const allComments: OrgComment[] = Array.isArray(commentsData?.data) ? commentsData.data : [];
  const commentsTotalPages = typeof commentsData?.totalPages === "number" ? commentsData.totalPages : 1;

  // Client interactions
  const { data: interactionsData, isLoading: interactionsLoading, isError: interactionsError } = useFetchOrgInteractions({ page, limit: PAGE_SIZE });
  const allInteractions: OrgInteraction[] = Array.isArray(interactionsData?.data) ? interactionsData.data : [];
  const interactionsTotalPages = typeof interactionsData?.totalPages === "number" ? interactionsData.totalPages : 1;

  const filteredComments = useMemo(() => {
    if (!search.trim()) return allComments;
    const q = search.toLowerCase();
    return allComments.filter((c) =>
      c.content.toLowerCase().includes(q) ||
      c.userName.toLowerCase().includes(q) ||
      c.projectName.toLowerCase().includes(q) ||
      (c.taskTitle && c.taskTitle.toLowerCase().includes(q))
    );
  }, [allComments, search]);

  const filteredInteractions = useMemo(() => {
    if (!search.trim()) return allInteractions;
    const q = search.toLowerCase();
    return allInteractions.filter((i) =>
      i.content.toLowerCase().includes(q) ||
      i.clientName.toLowerCase().includes(q) ||
      i.userName.toLowerCase().includes(q)
    );
  }, [allInteractions, search]);

  const isLoading = tab === "comments" ? commentsLoading : interactionsLoading;
  const isError = tab === "comments" ? (commentsError || hasCommentsApiError) : interactionsError;
  const errorMsg = tab === "comments"
    ? ((commentsErrorObj as any)?.response?.data?.message || (commentsErrorObj as any)?.message || (commentsData as any)?.message || "API endpoint may not be available yet.")
    : "Failed to load client messages.";
  const items = tab === "comments" ? filteredComments : filteredInteractions;
  const totalPages = tab === "comments" ? commentsTotalPages : interactionsTotalPages;

  return (
    <ComponentWrapper className="p-6 mt-6">
      {/* Header */}
      <Box className="mb-6">
        <h1 className="text-3xl font-medium capitalize">Comments Feed</h1>
        <p className="text-muted-foreground mt-1">
          All comments and client messages across your organization.
        </p>
      </Box>

      {/* Tabs */}
      <Flex className="gap-1 mb-5 border-b border-border">
        <button
          onClick={() => { setTab("comments"); setPage(1); setSearch(""); setShowNewMessage(false); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === "comments"
              ? "border-[#0c89af] text-[#0c89af]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Flex className="gap-2 items-center">
            <MessageCircleMore className="w-4 h-4" />
            Project Comments
            {allComments.length > 0 && (
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {commentsData?.total ?? allComments.length}
              </span>
            )}
          </Flex>
        </button>
        <button
          onClick={() => { setTab("messages"); setPage(1); setSearch(""); }}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            tab === "messages"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Flex className="gap-2 items-center">
            <UserCircle2 className="w-4 h-4" />
            Client Messages
            {allInteractions.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {interactionsData?.total ?? allInteractions.length}
              </span>
            )}
          </Flex>
        </button>
      </Flex>

      {/* Search + New Message button */}
      <Flex className="gap-3 mb-6 items-center">
        <Box className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tab === "comments" ? "Search by content, author, project or task..." : "Search by content or client..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="ps-9 bg-background"
          />
        </Box>
        {tab === "messages" && (
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 gap-1.5 shrink-0"
            onClick={() => setShowNewMessage((v) => !v)}
          >
            <PlusCircle className="w-4 h-4" />
            New Message
          </Button>
        )}
      </Flex>

      {/* New Message form */}
      {tab === "messages" && showNewMessage && (
        <NewMessageForm onClose={() => setShowNewMessage(false)} />
      )}

      {/* List */}
      {isLoading ? (
        <Box className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} className="animate-pulse bg-muted rounded-xl h-20" />
          ))}
        </Box>
      ) : isError ? (
        <Box className="py-16 text-center">
          <MessageCircleMore className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-red-500 font-medium">Failed to load.</p>
          <p className="text-xs text-muted-foreground mt-1">{errorMsg}</p>
        </Box>
      ) : items.length === 0 ? (
        <Box className="py-16 text-center">
          <MessageCircleMore className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search
              ? "No results match your search."
              : tab === "comments" ? "No comments yet." : "No client messages yet."}
          </p>
        </Box>
      ) : (
        <Box className="space-y-3">
          {tab === "comments"
            ? (items as OrgComment[]).map((c) => <CommentRow key={c.id} comment={c} />)
            : (items as OrgInteraction[]).map((i) => <InteractionRow key={i.id} item={i} />)
          }
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && !search && (
        <Flex className="justify-center items-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="gap-1">
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="gap-1">
            Next
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </Flex>
      )}
    </ComponentWrapper>
  );
};
