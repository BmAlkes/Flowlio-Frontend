import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  DownloadIcon,
  MessageCircleMore,
  FolderOpen,
  CheckSquare,
  CornerDownRight,
  ChevronLeft,
  ChevronRight,
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
import { useDeleteProjectComment } from "@/hooks/usedeleteprojectcomment";
import { useUpdateProjectComment } from "@/hooks/useupdateprojectcomment";
import { useUser } from "@/providers/user.provider";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

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
      {
        commentId: comment.id,
        content: text,
        projectId: comment.projectId,
        taskId: comment.taskId,
      },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <Box
      className={cn(
        "bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow",
        comment.parentId && "ml-6 border-l-4 border-l-blue-200"
      )}
    >
      <Flex className="justify-between items-start gap-3">
        {/* Left: avatar + meta */}
        <Flex className="gap-3 items-start flex-1 min-w-0">
          <Box className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {comment.userName.charAt(0).toUpperCase()}
          </Box>
          <Box className="flex-1 min-w-0">
            <Flex className="gap-2 items-center flex-wrap mb-1">
              <span className="font-semibold text-sm text-foreground">
                {comment.userName}
              </span>
              {comment.parentId && (
                <Flex className="gap-1 items-center text-[10px] text-blue-500">
                  <CornerDownRight className="w-3 h-3" />
                  <span>Reply</span>
                </Flex>
              )}
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.createdAt), "MMM d, yyyy · h:mm a")}
              </span>
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-[10px] italic text-muted-foreground">
                  (edited)
                </span>
              )}
            </Flex>

            {/* Project / Task tags */}
            <Flex className="gap-2 mb-2 flex-wrap">
              <Flex className="gap-1 items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                <FolderOpen className="w-3 h-3" />
                {comment.projectName}
              </Flex>
              {comment.taskTitle && (
                <Flex className="gap-1 items-center bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  <CheckSquare className="w-3 h-3" />
                  {comment.taskTitle}
                </Flex>
              )}
            </Flex>

            {/* Content or edit form */}
            {editing ? (
              <Flex className="gap-2 mt-1">
                <textarea
                  className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-[#0c89af] resize-none"
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                    if (e.key === "Escape") setEditing(false);
                  }}
                  autoFocus
                />
                <Flex className="flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-7 h-7 p-0 text-green-600"
                    onClick={handleSave}
                    disabled={updateComment.isPending}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-7 h-7 p-0 text-muted-foreground"
                    onClick={() => setEditing(false)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </Box>
        </Flex>

        {/* Actions */}
        {isOwner && !editing && (
          <Flex className="gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-blue-600"
              onClick={() => {
                setEditContent(comment.content);
                setEditing(true);
              }}
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-7 h-7 p-0 text-muted-foreground hover:text-red-600"
              onClick={() => deleteComment.mutate(comment.id)}
              disabled={deleteComment.isPending}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

export const CommentsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useFetchAllOrgComments({ page, limit: PAGE_SIZE });

  const allComments = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filtered = useMemo(() => {
    if (!search.trim()) return allComments;
    const q = search.toLowerCase();
    return allComments.filter(
      (c) =>
        c.content.toLowerCase().includes(q) ||
        c.userName.toLowerCase().includes(q) ||
        c.projectName.toLowerCase().includes(q) ||
        (c.taskTitle && c.taskTitle.toLowerCase().includes(q))
    );
  }, [allComments, search]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    doc.setFontSize(20);
    doc.setTextColor(108, 117, 125);
    doc.text("Comments Report", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(11);
    doc.text(
      `Generated on: ${format(new Date(), "PPP")}`,
      pageWidth / 2,
      yPos,
      { align: "center" }
    );
    yPos += 20;

    autoTable(doc, {
      startY: yPos,
      head: [["Author", "Comment", "Project", "Task", "Date"]],
      body: filtered.map((c) => [
        c.userName,
        c.content.substring(0, 60) + (c.content.length > 60 ? "..." : ""),
        c.projectName,
        c.taskTitle ?? "—",
        format(new Date(c.createdAt), "MMM d, yyyy"),
      ]),
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 70 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
      },
      margin: { left: 15, right: 15 },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save("Comments-Report.pdf");
  };

  return (
    <ComponentWrapper className="p-6 mt-6">
      {/* Header */}
      <Flex className="justify-between max-md:flex-col items-start gap-4 mb-6">
        <Box>
          <h1 className="text-3xl font-medium capitalize">
            Comments Feed
          </h1>
          <p className="text-muted-foreground mt-1">
            All comments across your organization's projects and tasks.
          </p>
        </Box>
        <Button
          className="bg-green-600 cursor-pointer hover:bg-green-500 shrink-0"
          size="lg"
          onClick={generatePDF}
          disabled={filtered.length === 0}
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </Flex>

      {/* Search */}
      <Box className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by content, author, project or task..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 bg-background"
        />
      </Box>

      {/* List */}
      {isLoading ? (
        <Box className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} className="animate-pulse bg-muted rounded-xl h-20" />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box className="py-16 text-center">
          <MessageCircleMore className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search ? "No comments match your search." : "No comments yet."}
          </p>
        </Box>
      ) : (
        <Box className="space-y-3">
          {filtered.map((comment) => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && !search && (
        <Flex className="justify-center items-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Flex>
      )}
    </ComponentWrapper>
  );
};
