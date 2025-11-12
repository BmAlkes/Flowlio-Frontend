import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import {
  ArrowUp,
  Eye,
  MessageCircleReply,
  PencilLine,
  Trash2,
} from "lucide-react";
import { ReusableTable } from "../reusable/reusabletable";
import { format, isWithinInterval } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "../common/generalmodal";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Stack } from "../ui/stack";
import { useNavigate } from "react-router";
import { FaRegTrashAlt } from "react-icons/fa";
import { useFetchProjects, type Project } from "@/hooks/usefetchprojects";
import { toast } from "sonner";
import { useDeleteProject } from "@/hooks/usedeleteproject";
import { useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { useFetchProjectComments } from "@/hooks/usefetchprojectcomments";
import { useCreateProjectComment } from "@/hooks/usecreateprojectcomment";
import { useDeleteProjectComment } from "@/hooks/usedeleteprojectcomment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// Use the Project interface from the hook
export type Data = Project;

export const ProjectTable = () => {
  // Fetch projects from API
  const { data: projectsData, isLoading, error } = useFetchProjects();
  const queryClient = useQueryClient();

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch projects");
    }
  }, [error]);

  // Transform API data to match table expectations
  const transformedData: Data[] =
    projectsData?.data?.map((project) => ({
      ...project,
      startDate: project.startDate ? new Date(project.startDate) : null,
      endDate: project.endDate ? new Date(project.endDate) : null,
    })) || [];

  const props = useGeneralModalDisclosure();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // API hooks for comments
  const { data: commentsData, isLoading: commentsLoading } =
    useFetchProjectComments(activeProjectId || "");
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateProjectComment();
  const { mutate: deleteComment, isPending: isDeletingComment } =
    useDeleteProjectComment();

  // Add comment handler - now supports nested comments
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

  // Add reply handler
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

  // Delete comment handler
  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId);
  };

  // Open comment modal for a project
  const openCommentModal = (projectId: string) => {
    setActiveProjectId(projectId);
    props.onOpenChange(true);
    setInput("");
    setReplyTo(null);
    setReplyContent("");
  };

  const navigate = useNavigate();

  // Prefetch project data on hover
  const prefetchProject = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["project", projectId],
      queryFn: async () => {
        const response = await axios.get<{
          success: boolean;
          message: string;
          data: Project;
        }>(`/projects/${projectId}`);
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get comments for the active project from API
  const commentsWithReplies = commentsData?.data || [];
  const { mutate: handleDeleteProject, isPending: isDeletingProject } =
    useDeleteProject();

  // Delete confirmation handler
  const handleDeleteClick = (project: { id: string; name: string }) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      handleDeleteProject(projectToDelete.id, {
        onSuccess: () => {
          toast.success("Project deleted successfully");
          setDeleteConfirmOpen(false);
          setProjectToDelete(null);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete project");
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
  };

  const columns: ColumnDef<Data>[] = [
    {
      id: "select",
      header: () => <Box className="text-center text-black">#</Box>,
      cell: ({ row }) => <Box className="text-center">{row.index + 1}</Box>,
      enableSorting: false,
    },

    {
      accessorKey: "projectName",
      header: () => <Box className="text-black p-1">Project Name</Box>,
      cell: ({ row }) => (
        <Box className="capitalize p-1 w-30 max-sm:w-full">
          {row.original.projectName.length > 28
            ? row.original.projectName.slice(0, 28) + "..."
            : row.original.projectName}
        </Box>
      ),
    },
    {
      accessorKey: "clientName",
      header: () => <Box className="text-black text-center">Client</Box>,
      cell: ({ row }) => (
        <Box className="capitalize text-center">{row.original.clientName}</Box>
      ),
    },
    {
      accessorKey: "assignedProject",
      header: () => <Box className="text-black text-center">Assigned To</Box>,
      cell: ({ row }) => (
        <Box className="capitalize text-center">
          {row.original.assignedProject}
        </Box>
      ),
    },

    {
      accessorKey: "startDate",
      header: () => <Box className="text-center text-black">Start Date</Box>,
      cell: ({ row }) => {
        const startDate = row.original.startDate;
        try {
          return (
            <Box className="text-center">
              {startDate ? format(startDate, "MMM d, yyyy") : "Not set"}
            </Box>
          );
        } catch (error) {
          console.log(error);
          return <Box className="text-center">Invalid Date</Box>;
        }
      },
      filterFn: (row, __columnId, filterValue: { from?: Date; to?: Date }) => {
        try {
          const { from, to } = filterValue || {};
          if (!from || !to) return true;
          const startDate = row.original.startDate;
          const endDate = row.original.endDate;
          if (!startDate || !endDate) return false;
          return (
            isWithinInterval(startDate, { start: from, end: to }) ||
            isWithinInterval(endDate, { start: from, end: to }) ||
            (startDate <= from && endDate >= to)
          );
        } catch (error) {
          console.error("Date comparison error:", error);
          return false;
        }
      },
    },

    {
      accessorKey: "endDate",
      header: () => <Box className="text-center text-black">End Date</Box>,
      cell: ({ row }) => {
        const endDate = row.original.endDate;
        try {
          return (
            <Box className="text-center">
              {endDate ? format(endDate, "MMM d, yyyy") : "Not set"}
            </Box>
          );
        } catch (error) {
          console.error("Invalid date:", endDate);
          console.log(error);
          return <Box className="text-center">Invalid Date</Box>;
        }
      },
    },

    {
      accessorKey: "progress",
      header: () => <Box className="text-center text-black">Progress</Box>,
      cell: ({ row }) => {
        return (
          <Center className="text-center">
            {row.original.progress + "%"}{" "}
            <ArrowUp className="size-4 text-green-600 font-semibold" />
          </Center>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-black">Status</Box>,
      cell: ({ row }) => {
        const status = row.original.status as
          | "pending"
          | "completed"
          | "ongoing";

        const statusStyles: Record<
          typeof status,
          { text: string; dot: string }
        > = {
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
        };

        return (
          <Center>
            <Flex
              className={`rounded-md capitalize w-32 h-10 gap-2 border items-center ${statusStyles[status].text}`}
            >
              <Flex className="ml-5.5">
                <Flex
                  className={`w-2 h-2 rounded-full ${statusStyles[status].dot}`}
                />
                <span>{status}</span>
              </Flex>
            </Flex>
          </Center>
        );
      },
    },

    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-black">Actions</Box>,
      cell: ({ row }) => {
        return (
          <Center className="space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-black border-none w-10 h-9 hover:bg-black cursor-pointer rounded-md "
                    onClick={() => {
                      navigate(`/dashboard/project/view/${row.original.id}`);
                    }}
                    onMouseEnter={() => prefetchProject(row.original.id)}
                  >
                    <Eye className="fill-white size-7 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>View Project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#23B95D] hover:bg-[#23B95D]/80 rounded-md border-none cursor-pointer"
                    onClick={() => {
                      navigate(`/dashboard/project/edit/${row.original.id}`);
                    }}
                  >
                    <PencilLine className="fill-white text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>Edit Project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#40aeed] hover:bg-[#40aeed]/80 rounded-md border-none cursor-pointer"
                    onClick={() => openCommentModal(row.original.id)}
                  >
                    <MessageCircleReply className="text-white size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>Add Comment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#A50403] border-none w-9 h-9 hover:bg-[#A50403]/80 cursor-pointer rounded-md "
                    onClick={() =>
                      handleDeleteClick({
                        id: row.original.id,
                        name: row.original.projectName,
                      })
                    }
                    disabled={isDeletingProject}
                  >
                    <FaRegTrashAlt className="text-white fill-white size-4 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>Delete Project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Center>
        );
      },
    },
  ];

  return (
    <>
      {isLoading ? (
        <Box className="flex items-center justify-center p-8">
          <Box className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></Box>
          <Box className="ml-2">Loading projects...</Box>
        </Box>
      ) : (
        <>
          <ReusableTable
            data={transformedData}
            columns={columns}
            // searchInput={false}
            enablePaymentLinksCalender={true}
            onRowClick={(row) => {
              console.log("Row clicked:", row.original);
            }}
          />
        </>
      )}

      <GeneralModal
        {...props}
        contentProps={{ className: "overflow-hidden max-sm:p-3" }}
      >
        <Box>
          <Box className="mb-4 text-lg font-semibold">Project Comments</Box>

          {/* Comments list with nested replies */}
          <Box className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4 bg-gray-50 p-3 rounded">
            {commentsLoading ? (
              <Box className="text-gray-400 text-center py-4">
                Loading comments...
              </Box>
            ) : activeProjectId && commentsWithReplies.length === 0 ? (
              <Box className="text-gray-400 text-center py-4">
                No comments yet.
              </Box>
            ) : (
              commentsWithReplies.map((comment) => (
                <Box key={comment.id} className="space-y-2">
                  {/* Main comment */}
                  <Box className="flex items-start gap-2 group">
                    <Flex className="flex-1 items-start justify-between bg-white p-3 rounded shadow-sm text-sm">
                      <Stack className="flex-1">
                        <Flex className="justify-between">
                          <Box className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-gray-900">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(
                                new Date(comment.createdAt),
                                "MMM d, yyyy hh:mm a"
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

                  {/* Reply input for this comment */}
                  {replyTo === comment.id && (
                    <Box className="ml-6 bg-white p-2 rounded border">
                      <Input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
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
                          {isCreatingComment ? "Adding..." : "Reply"}
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
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Render replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box className="ml-6 space-y-2">
                      {comment.replies.map((reply) => (
                        <Box key={reply.id} className="flex items-start gap-2">
                          <Flex className="flex-1 items-start justify-between bg-white p-2 rounded shadow-sm text-sm border-l-2 border-blue-200">
                            <Stack className="flex-1">
                              <Box className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-xs text-gray-900">
                                  {reply.userName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {format(
                                    new Date(reply.createdAt),
                                    "MMM d, yyyy hh:mm a"
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
                                title="Delete"
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

          {/* Add new comment */}
          <Flex className="items-center justify-between">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a comment..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
              className="bg-white rounded-full placeholder:text-gray-400 h-11 border border-gray-400"
            />

            <Button
              onClick={() => handleAddComment()}
              disabled={!input.trim() || isCreatingComment}
              className="rounded-full h-11 cursor-pointer"
            >
              {isCreatingComment ? "Sending..." : "Send"}
            </Button>
          </Flex>
        </Box>
      </GeneralModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the project "
              {projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeletingProject}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingProject}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingProject ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
