import { useState } from "react";
import { format } from "date-fns";
import { MessageCircleMore, Send, Trash2, Pencil, X, Check, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { useFetchProjectComments, ProjectComment } from "@/hooks/usefetchprojectcomments";
import { useCreateProjectComment } from "@/hooks/usecreateprojectcomment";
import { useDeleteProjectComment } from "@/hooks/usedeleteprojectcomment";
import { useUpdateProjectComment } from "@/hooks/useupdateprojectcomment";
import { useUser } from "@/providers/user.provider";

interface CommentThreadProps {
  projectId: string;
  taskId?: string;
  canComment?: boolean;
  maxHeight?: string;
  /** Show section header "Comments (n)" */
  showHeader?: boolean;
}

interface CommentItemProps {
  comment: ProjectComment;
  projectId: string;
  taskId?: string;
  canComment: boolean;
  currentUserId: string;
  depth?: number;
}

function CommentItem({
  comment,
  projectId,
  taskId,
  canComment,
  currentUserId,
  depth = 0,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const createComment = useCreateProjectComment();
  const deleteComment = useDeleteProjectComment();
  const updateComment = useUpdateProjectComment();

  const isOwner = currentUserId === comment.userId;

  const handleReply = () => {
    const text = replyContent.trim();
    if (!text || createComment.isPending) return;
    createComment.mutate(
      { projectId, taskId, content: text, parentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyOpen(false);
        },
      }
    );
  };

  const handleEdit = () => {
    const text = editContent.trim();
    if (!text || updateComment.isPending) return;
    updateComment.mutate(
      { commentId: comment.id, content: text, projectId, taskId },
      { onSuccess: () => setEditing(false) }
    );
  };

  const handleDelete = () => {
    deleteComment.mutate(comment.id);
  };

  return (
    <Box className={depth > 0 ? "ms-5 border-s-2 border-border ps-3" : ""}>
      <Box className="bg-card rounded-lg p-3 border border-border group">
        {/* Author row */}
        <Flex className="justify-between items-start mb-1.5">
          <Flex className="gap-2 items-center">
            <Box className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {comment.userName.charAt(0).toUpperCase()}
            </Box>
            <span className="text-xs font-semibold text-foreground">
              {comment.userName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(comment.createdAt), "MMM d, yyyy · h:mm a")}
              {comment.updatedAt !== comment.createdAt && (
                <span className="ms-1 italic">(edited)</span>
              )}
            </span>
          </Flex>

          {/* Actions — only visible on hover */}
          <Flex className="gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isOwner && canComment && (
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 text-muted-foreground hover:text-blue-600"
                onClick={() => {
                  setEditContent(comment.content);
                  setEditing(true);
                }}
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 text-muted-foreground hover:text-red-600"
                onClick={handleDelete}
                disabled={deleteComment.isPending}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Content */}
        {editing ? (
          <Flex className="gap-1.5 mt-1">
            <textarea
              className="flex-1 text-xs bg-muted rounded-lg px-2.5 py-1.5 border border-border focus:outline-none focus:border-[#0c89af] resize-none leading-relaxed"
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                }
                if (e.key === "Escape") setEditing(false);
              }}
              autoFocus
            />
            <Flex className="flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 text-green-600 hover:text-green-700"
                onClick={handleEdit}
                disabled={updateComment.isPending}
                title="Save"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 text-muted-foreground"
                onClick={() => setEditing(false)}
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </Button>
            </Flex>
          </Flex>
        ) : (
          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {/* Reply button — only for top-level comments */}
        {canComment && depth === 0 && !editing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1 text-[10px] text-blue-500 hover:text-blue-700 mt-1.5 gap-1"
            onClick={() => {
              setReplyOpen((v) => !v);
              setReplyContent("");
            }}
          >
            <CornerDownRight className="w-3 h-3" />
            {replyOpen ? "Cancel" : "Reply"}
          </Button>
        )}
      </Box>

      {/* Reply input */}
      {replyOpen && canComment && (
        <Box className="mt-1.5 ms-5">
          <Flex className="gap-1.5">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 text-xs bg-muted rounded-lg px-2.5 py-1.5 border border-border focus:outline-none focus:border-[#0c89af] placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReply();
                if (e.key === "Escape") setReplyOpen(false);
              }}
              autoFocus
            />
            <button
              onClick={handleReply}
              disabled={!replyContent.trim() || createComment.isPending}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0c89af] text-white disabled:opacity-40 hover:bg-[#0a7a9e] transition-colors shrink-0"
            >
              <Send className="w-3 h-3" />
            </button>
          </Flex>
        </Box>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box className="mt-1.5 space-y-1.5">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              projectId={projectId}
              taskId={taskId}
              canComment={canComment}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export function CommentThread({
  projectId,
  taskId,
  canComment = true,
  maxHeight = "16rem",
  showHeader = true,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const { data: userData } = useUser();
  const currentUserId = userData?.user?.id ?? "";

  const { data: commentsResponse, isLoading, isError, refetch } = useFetchProjectComments(
    projectId,
    taskId
  );
  const createComment = useCreateProjectComment();

  const comments = commentsResponse?.data ?? [];
  const topLevel = comments.filter((c) => !c.parentId);

  const handleAdd = () => {
    const text = newComment.trim();
    if (!text || createComment.isPending || !projectId) return;
    createComment.mutate(
      { projectId, taskId, content: text },
      { onSuccess: () => setNewComment("") }
    );
  };

  if (!projectId) return null;

  return (
    <Box className="flex flex-col gap-3">
      {showHeader && (
        <Flex className="gap-2 items-center">
          <MessageCircleMore className="w-4 h-4 text-[#0c89af]" />
          <span className="text-sm font-semibold text-foreground">
            Comments
            {comments.length > 0 && (
              <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                ({comments.length})
              </span>
            )}
          </span>
        </Flex>
      )}

      {/* List */}
      <Box
        className="space-y-2 overflow-y-auto pe-0.5"
        style={{ maxHeight }}
      >
        {isLoading ? (
          <Box className="space-y-2">
            {[1, 2].map((i) => (
              <Box key={i} className="animate-pulse bg-muted rounded-lg h-14" />
            ))}
          </Box>
        ) : isError ? (
          <Box className="py-6 text-center">
            <MessageCircleMore className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-2">Could not load comments.</p>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => refetch()}>
              Try again
            </Button>
          </Box>
        ) : topLevel.length === 0 ? (
          <Box className="py-6 text-center">
            <MessageCircleMore className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No comments yet. {canComment && "Be the first to comment!"}
            </p>
          </Box>
        ) : (
          topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
              taskId={taskId}
              canComment={canComment}
              currentUserId={currentUserId}
            />
          ))
        )}
      </Box>

      {/* Add comment input */}
      {canComment && (
        <Flex className="gap-1.5 pt-1 border-t border-border">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-[#0c89af] placeholder:text-muted-foreground transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newComment.trim() || createComment.isPending}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0c89af] text-white disabled:opacity-40 hover:bg-[#0a7a9e] transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </Flex>
      )}
    </Box>
  );
}
