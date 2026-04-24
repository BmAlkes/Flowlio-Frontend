import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Input } from "@/components/ui/input";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { useFetchClientProjects } from "@/hooks/useFetchClientProjects";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Center } from "@/components/ui/center";
import {
  ArrowUp,
  Download,
  MessageCircleReply,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useUser } from "@/providers/user.provider";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { useState } from "react";
import { useFetchProjectComments } from "@/hooks/usefetchprojectcomments";
import { useCreateProjectComment } from "@/hooks/usecreateprojectcomment";
import { useDeleteProjectComment } from "@/hooks/usedeleteprojectcomment";
import { useTranslation } from "react-i18next";

const ClientProjectsPage = () => {
  const { t } = useTranslation();
  const { data: userData } = useUser();
  const clientId = userData?.user?.clientId;
  const organizationId = userData?.user?.organizationId;

  const { data: projectsResponse, isLoading } = useFetchClientProjects(
    clientId || undefined,
    organizationId || undefined,
  );

  const props = useGeneralModalDisclosure();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: commentsData, isLoading: commentsLoading } =
    useFetchProjectComments(activeProjectId || "");
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateProjectComment();
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteProjectComment();

  const commentsWithReplies = commentsData?.data || [];

  const handleAddComment = (parentId?: string) => {
    if (!activeProjectId || !input.trim()) return;
    createComment({
      projectId: activeProjectId,
      content: input.trim(),
      parentId: parentId || undefined,
    });
    setInput("");
    setReplyTo(null);
    setReplyContent("");
  };

  const handleAddReply = () => {
    if (!activeProjectId || !replyTo || !replyContent.trim()) return;
    createComment({
      projectId: activeProjectId,
      content: replyContent.trim(),
      parentId: replyTo,
    });
    setReplyTo(null);
    setReplyContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };

  const openCommentModal = (projectId: string) => {
    setActiveProjectId(projectId);
    props.onOpenChange(true);
    setInput("");
    setReplyTo(null);
    setReplyContent("");
  };

  const navigate = useNavigate();

  const projects = projectsResponse?.data?.projects || [];

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "projectNumber",
      header: () => <Box className="text-center text-foreground">#</Box>,
      cell: ({ row }) => (
        <Box className="text-center">{row.original.projectNumber}</Box>
      ),
    },
    {
      accessorKey: "projectName",
      header: () => <Box className="text-center text-foreground">{t("projects.projectName")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">{row.original.projectName}</Box>
      ),
    },
    {
      accessorKey: "clientName",
      header: () => <Box className="text-center text-foreground">{t("projects.client")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">{row.original.clientName}</Box>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: () => <Box className="text-center text-foreground">{t("projects.assignedTo")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          {row.original.assignedProject || t("common.unassigned")}
        </Box>
      ),
    },
    {
      accessorKey: "startDate",
      header: () => <Box className="text-center text-foreground">{t("projects.startDate")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          {row.original.startDate
            ? format(new Date(row.original.startDate), "MMM d, yyyy")
            : t("common.notSet")}
        </Box>
      ),
    },
    {
      accessorKey: "endDate",
      header: () => <Box className="text-center text-foreground">{t("projects.endDate")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          {row.original.endDate
            ? format(new Date(row.original.endDate), "MMM d, yyyy")
            : t("common.notSet")}
        </Box>
      ),
    },
    {
      accessorKey: "progress",
      header: () => <Box className="text-center text-foreground">{t("projects.progress")}</Box>,
      cell: ({ row }) => (
        <Center className="text-center">
          {row.original.progress + "%"}{" "}
          <ArrowUp className="size-4 text-green-600 font-semibold" />
        </Center>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">{t("projects.status")}</Box>,
      cell: ({ row }) => {
        const status = row.original.status as
          | "pending"
          | "completed"
          | "ongoing"
          | "delayed";
        const statusStyles: Record<string, { text: string; dot: string }> = {
          completed: {
            text: "text-white bg-[#00A400] border-none rounded-full",
            dot: "bg-white",
          },
          pending: {
            text: "text-white bg-[#F98618] border-none rounded-full",
            dot: "bg-white",
          },
          ongoing: {
            text: "text-white bg-[#005FA4] border-none rounded-full",
            dot: "bg-white",
          },
          delayed: {
            text: "text-white bg-[#EF5350] border-none rounded-full",
            dot: "bg-white",
          },
        };

        const currentStyle = statusStyles[status] || {
          text: "text-white bg-muted/500 border-none rounded-full",
          dot: "bg-white",
        };

        return (
          <Center>
            <Box
              className={`flex rounded-md capitalize w-32 h-10 gap-2 border justify-center items-center ${currentStyle.text}`}
            >
              <Flex
                className={`w-2 h-2 items-start rounded-full ${currentStyle.dot}`}
              />
              <span>{status || "Unknown"}</span>
            </Box>
          </Center>
        );
      },
    },
    {
      id: "actions",
      header: () => <Box className="text-center text-foreground">{t("common.actions")}</Box>,
      cell: ({ row }) => (
        <Center className="space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-foreground border-none w-10 h-9 hover:bg-foreground/80 cursor-pointer rounded-md p-0"
                  onClick={() =>
                    navigate(`/clients/projects/view/${row.original.id}`)
                  }
                >
                  <Eye className="text-background size-5 fill-background" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                <p>{t("projects.viewProject")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-[#40aeed] hover:bg-[#40aeed]/80 rounded-md border-none cursor-pointer w-10 h-9 p-0"
                  onClick={() => openCommentModal(row.original.id)}
                >
                  <MessageCircleReply className="text-white size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                <p>{t("projects.addComment")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {row.original.contractfile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#23B95D] hover:bg-[#23B95D]/80 rounded-md border-none cursor-pointer w-10 h-9 p-0"
                    onClick={() =>
                      window.open(row.original.contractfile, "_blank")
                    }
                  >
                    <Download className="text-white size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>{t("projects.downloadFile")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Center>
      ),
    },
  ];

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-1 p-6 mb-6">
        <h1 className="text-2xl font-medium text-foreground">{t("projects.myProjects")}</h1>
        <p className="text-muted-foreground">
          {t("projects.myProjectsDesc")}
        </p>
      </Stack>

      {isLoading ? (
        <Box className="flex justify-center p-10">{t("projects.loadingProjects")}</Box>
      ) : (
        <Box className=" rounded-xl   border border-border overflow-hidden">
          <ReusableTable
            data={projects}
            columns={columns}
            searchClassName="rounded-full"
            filterClassName="rounded-full"
          />
        </Box>
      )}

      <GeneralModal
        {...props}
        contentProps={{ className: "overflow-hidden max-sm:p-3" }}
      >
        <Box>
          <Box className="mb-4 text-lg font-semibold">{t("projects.comments")}</Box>

          <Box className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4 bg-muted p-3 rounded">
            {commentsLoading ? (
              <Box className="text-muted-foreground text-center py-4">
                {t("common.loading")}
              </Box>
            ) : activeProjectId && commentsWithReplies.length === 0 ? (
              <Box className="text-muted-foreground text-center py-4">
                {t("projects.noComments")}
              </Box>
            ) : (
              commentsWithReplies.map((comment: any) => (
                <Box key={comment.id} className="space-y-2">
                  <Box className="flex items-start gap-2 group">
                    <Flex className="flex-1 items-start justify-between bg-card border border-border p-3 rounded shadow-sm text-sm">
                      <Stack className="flex-1">
                        <Flex className="justify-between">
                          <Box className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-foreground">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(comment.createdAt),
                                "MMM d, yyyy hh:mm a",
                              )}
                            </span>
                          </Box>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 cursor-pointer p-1 h-auto text-xs"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingComment}
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </Flex>
                        <Box className="w-full max-sm:w-48 overflow-hidden break-words whitespace-pre-line">
                          {comment.content}
                        </Box>
                      </Stack>
                    </Flex>
                  </Box>

                  {replyTo === comment.id && (
                    <Box className="ml-6 bg-card p-2 rounded border border-border">
                      <Input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={t("projects.writeReply")}
                        className="mb-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddReply();
                        }}
                      />
                      <Box className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleAddReply}
                          disabled={!replyContent.trim() || isCreatingComment}
                          className="bg-blue-600 hover:bg-blue-700 text-xs"
                        >
                          {isCreatingComment ? t("projects.replying") : t("projects.reply")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent("");
                          }}
                          className="text-xs"
                        >
                          {t("common.cancel")}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <Box className="ml-6 space-y-2">
                      {comment.replies.map((reply: any) => (
                        <Box key={reply.id} className="flex items-start gap-2">
                          <Flex className="flex-1 items-start justify-between bg-card border border-border p-2 rounded shadow-sm text-sm border-l-2 border-l-blue-200">
                            <Stack className="flex-1">
                              <Box className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-xs text-foreground">
                                  {reply.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(reply.createdAt),
                                    "MMM d, yyyy hh:mm a",
                                  )}
                                </span>
                              </Box>
                              <Box className="w-full max-sm:w-40 overflow-hidden break-words whitespace-pre-line">
                                {reply.content}
                              </Box>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 cursor-pointer p-1 h-auto text-xs mt-1"
                                onClick={() => handleDeleteComment(reply.id)}
                                disabled={isDeletingComment}
                                title={t("common.delete")}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </Stack>
                          </Flex>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>

          <Flex className="items-center justify-between gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("projects.typeComment")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
              className="bg-background rounded-full placeholder:text-muted-foreground h-11 border border-border"
            />
            <Button
              onClick={() => handleAddComment()}
              disabled={!input.trim() || isCreatingComment}
              className="rounded-full h-11 cursor-pointer min-w-20"
            >
              {isCreatingComment ? t("projects.sending") : t("projects.send")}
            </Button>
          </Flex>
        </Box>
      </GeneralModal>
    </PageWrapper>
  );
};

export default ClientProjectsPage;
