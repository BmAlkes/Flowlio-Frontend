import React, { useState, useMemo } from "react";
import {
  X,
  Calendar,
  User,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  Edit,
  Link2,
  Clock,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useFetchProjectComments } from "@/hooks/usefetchprojectcomments";
import { useFetchSubtasks } from "@/hooks/usefetchtasks";
import { useDeleteTask } from "@/hooks/usedeletetask";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { Center } from "../ui/center";
import { CreateTask } from "./createtask";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { FileVersionHistoryModal } from "../common/fileversionhistorymodal";
import { useUploadFileVersion } from "@/hooks/useuploadfileversion";
import { toast } from "sonner";
import { Attachment } from "@/types";

type TaskForMap = {
  id: string;
  title: string;
  status: string;
  startAfter?: string | null;
  finishBefore?: string | null;
};

interface TaskDetailsModalProps {
  task: {
    id: string;
    title: string;
    description?: string;
    project: string;
    projectId?: string;
    dueDate: string;
    status: string;
    assigneeName?: string;
    assigneeImage?: string;
    creatorName?: string;
    attachments?: Array<Attachment>;
    parentId?: string;
    parentTitle?: string;
    startAfter?: string | null;
    finishBefore?: string | null;
  };
  allTasks: TaskForMap[];
  onOpenTask: (taskId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  allTasks,
  onOpenTask,
  isOpen,
  onClose,
}) => {
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateSubtaskModal, setShowCreateSubtaskModal] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadVersion = useUploadFileVersion();
  const { data: commentsResponse } = useFetchProjectComments(
    task.projectId || ""
  );
  const { data: subtasksResponse } = useFetchSubtasks(
    !task.parentId ? task.id : undefined
  );
  const { data: membersData } = useGetCurrentOrgUserMembers();
  const members = membersData?.data?.userMembers || [];

  const subtasks = useMemo(() => {
    const rawSubtasks = subtasksResponse?.data ?? [];
    return rawSubtasks.map((st) => {
      const member = members.find((m: any) => m.user?.id === st.assigneeId || m.id === st.assigneeId);
      return {
        ...st,
        assigneeName: member?.user?.name || st.assigneeName,
      };
    });
  }, [subtasksResponse, members]);

  const deleteTask = useDeleteTask();

  const mapSubtaskStatus = (apiStatus: string) => {
    const m: Record<string, string> = {
      todo: "To Do",
      in_progress: "In Progress",
      updated: "Updated",
      delay: "Delay",
      changes: "Changes",
      completed: "Completed",
    };
    return m[apiStatus] ?? apiStatus;
  };

  const taskMap = useMemo(() => {
    const map: Record<string, TaskForMap> = {};
    for (const t of allTasks) {
      map[t.id] = t;
    }
    return map;
  }, [allTasks]);

  const startAfterTask = task.startAfter
    ? taskMap[task.startAfter] ?? null
    : null;
  const finishBeforeTask = task.finishBefore
    ? taskMap[task.finishBefore] ?? null
    : null;
  const hasDependencies = !!startAfterTask || !!finishBeforeTask;

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "To Do": "bg-muted text-gray-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Updated: "bg-yellow-100 text-yellow-800",
      Delay: "bg-red-100 text-red-800",
      Changes: "bg-purple-100 text-purple-800",
      Completed: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-muted text-gray-800";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (type === "application/pdf") return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const projectComments = commentsResponse?.data || [];

  const handleDeleteTask = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        onClose();
        setShowDeleteConfirm(false);
      },
    });
  };

  const handleOpenHistory = (attachment: Attachment) => {
    setActiveAttachment(attachment);
    setHistoryModalOpen(true);
  };

  const handleUploadClick = (attachment: Attachment) => {
    setActiveAttachment(attachment);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && activeAttachment) {
      try {
        await uploadVersion.mutateAsync({
          attachmentId: activeAttachment.id,
          file,
        });
        toast.success("New version uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload new version");
      }
    }
    // Reset input
    if (event.target) event.target.value = "";
  };

  return (
    <Box className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <Box
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Box className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <Flex className="gap-0 justify-between p-6 border-b border-border bg-gradient-to-r from-blue-500/5 to-indigo-50">
          <Flex className="gap-4">
            <Center className="w-12 h-12 bg-gradient-to-br from-blue-500/50 to-indigo-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </Center>
            <Box>
              <h2 className="text-2xl font-bold text-foreground">{task.title}</h2>
              <p className="text-muted-foreground">Task Details</p>
            </Box>
          </Flex>
          <Flex className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="w-8 h-8 p-0 hover:bg-blue-100 rounded-full text-blue-600 hover:text-blue-700 cursor-pointer"
              title="Edit Task"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-8 h-8 p-0 hover:bg-red-100 rounded-full text-red-600 hover:text-red-700 cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {!task.parentId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateSubtaskModal(true)}
                className="hover:bg-green-50 border-green-200 text-green-600 hover:text-green-700 cursor-pointer h-8 px-3 rounded-full text-xs font-medium gap-1"
                title="Add Subtask"
              >
                + Subtask
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 hover:bg-muted rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </Flex>
        </Flex>

        {/* Content */}
        <Box className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <Box className="lg:col-span-2 space-y-6">
              {/* Description */}
              {task.description && (
                <Box className="bg-muted/50 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {task.description}
                  </p>
                </Box>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <Box className="bg-muted/50 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <File className="w-4 h-4" />
                    Attachments ({task.attachments.length})
                  </h3>
                  <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {task.attachments.map((attachment) => (
                      <Box
                        key={attachment.id}
                        className="bg-card rounded-lg p-3 border border-border hover:border-blue-300 transition-colors cursor-pointer group"
                      >
                        <Flex className="gap-3" onClick={() => setSelectedAttachment(attachment.url)}>
                          <Center className="w-10 h-10 bg-blue-100 rounded-lg text-blue-600">
                            {getFileIcon(attachment.type)}
                          </Center>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {attachment.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(attachment.size)}
                              {attachment.versions && attachment.versions.length > 1 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-muted text-[10px] font-bold rounded uppercase">
                                  V{attachment.versions[0].versionNumber}
                                </span>
                              )}
                            </p>
                          </div>
                          <Box className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0"
                              title="View History"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenHistory(attachment);
                              }}
                            >
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0"
                              title="Upload New Version"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUploadClick(attachment);
                              }}
                              disabled={uploadVersion.isPending}
                            >
                              <Upload className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(attachment.url, "_blank");
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement("a");
                                link.href = attachment.url;
                                link.download = attachment.name;
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Project Comments */}
              {projectComments.length > 0 && (
                <Box className="bg-muted/50 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Comments ({projectComments.length})
                  </h3>
                  <Box className="space-y-3 max-h-60 overflow-y-auto">
                    {projectComments.map((comment) => (
                      <Box
                        key={comment.id}
                        className="bg-card rounded-lg p-3 border border-border"
                      >
                        <Flex className="mb-2">
                          <Center className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full text-white text-xs font-semibold">
                            {comment.userName.charAt(0).toUpperCase()}
                          </Center>
                          <span className="font-medium text-foreground">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(comment.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </Flex>
                        <p className="text-foreground text-sm">
                          {comment.content}
                        </p>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Subtasks (only for main tasks) */}
              {!task.parentId && (
                <Box className="bg-muted/50 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Subtasks ({subtasks.length})
                  </h3>
                  {subtasks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No subtasks yet</p>
                  ) : (
                    <Box className="space-y-3 max-h-60 overflow-y-auto">
                      {subtasks.map((st) => (
                        <Box
                          key={st.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onOpenTask(st.id)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && onOpenTask(st.id)
                          }
                          className="bg-card rounded-lg p-3 border border-border hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <Flex className="flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="font-medium text-foreground">
                              {st.title}
                            </span>
                            <span
                              className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                                getStatusColor(mapSubtaskStatus(st.status))
                              )}
                            >
                              {mapSubtaskStatus(st.status)}
                            </span>
                            {st.assigneeName && (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {st.assigneeName}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              {st.endDate
                                ? format(new Date(st.endDate), "dd MMM, yyyy")
                                : "No due date"}
                            </span>
                          </Flex>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Sidebar */}
            <Box className="space-y-6">
              {/* Status */}
              <Box className="bg-card rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3">Status</h3>
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    getStatusColor(task.status)
                  )}
                >
                  {task.status}
                </span>
              </Box>

              {/* Task Level */}
              <Box className="bg-card rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3">Task Level</h3>
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    task.parentId
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  )}
                >
                  {task.parentId ? "Subtask" : "Main Task"}
                </span>
                {task.parentId && task.parentTitle && (
                  <Box className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Related to Main Task:</p>
                    <p className="text-sm font-medium text-purple-700">{task.parentTitle}</p>
                  </Box>
                )}
              </Box>

              {/* Project Info */}
              <Box className="bg-card rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3">Project</h3>
                <Flex>
                  <Center className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </Center>
                  <span className="font-medium text-foreground">
                    {task.project}
                  </span>
                </Flex>
              </Box>

              {/* Due Date */}
              <Box className="bg-card rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </h3>
                <p className="text-foreground">{task.dueDate}</p>
              </Box>

              {/* Assignee */}
              {task.assigneeName && (
                <Box className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assigned To
                  </h3>
                  <Flex>
                    {task.assigneeImage ? (
                      <img
                        src={task.assigneeImage}
                        alt={task.assigneeName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <Center className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full text-white text-sm font-semibold">
                        {task.assigneeName.charAt(0).toUpperCase()}
                      </Center>
                    )}
                    <span className="font-medium text-foreground">
                      {task.assigneeName}
                    </span>
                  </Flex>
                </Box>
              )}

              {/* Dependencies */}
              {hasDependencies && (
                <Box className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Dependencies
                  </h3>
                  <Box className="space-y-3 border-t border-border pt-3">
                    {startAfterTask && (
                      <Box>
                        <p className="text-xs text-muted-foreground mb-1">
                          Start After
                        </p>
                        {startAfterTask.status !== "Completed" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onOpenTask(startAfterTask.id)
                                  }
                                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-left"
                                >
                                  {startAfterTask.title}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Complete this task before starting.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenTask(startAfterTask.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-left"
                          >
                            {startAfterTask.title}
                          </button>
                        )}
                      </Box>
                    )}
                    {finishBeforeTask && (
                      <Box>
                        <p className="text-xs text-muted-foreground mb-1">
                          Finish Before
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {finishBeforeTask.title}
                        </p>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Attachment Preview Modal */}
      {selectedAttachment && (
        <Box className="fixed inset-0 z-60 flex items-center justify-center">
          <Box
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedAttachment(null)}
          />
          <Box className="relative bg-card rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <Flex className="gap-0 justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Attachment Preview
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttachment(null)}
                className="w-8 h-8 p-0 hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </Flex>
            <Box className="p-4">
              {selectedAttachment.includes(".pdf") ||
              selectedAttachment.includes("pdf") ? (
                <iframe
                  src={selectedAttachment}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={selectedAttachment}
                  alt="Attachment Preview"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <Box>
          <CreateTask
            taskId={task.id}
            isModal={true}
            onClose={() => {
              setShowEditModal(false);
              // Close the details modal and let parent refresh
              onClose();
            }}
          />
        </Box>
      )}

      {/* Create Subtask Modal */}
      {showCreateSubtaskModal && (
        <Box>
          <CreateTask
            parentId={task.id}
            isModal={true}
            onClose={() => {
              setShowCreateSubtaskModal(false);
              // Close the details modal and let parent refresh
              onClose();
            }}
          />
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-card rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Delete Task
                </h3>
                <p className="text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-foreground mb-6">
              Are you sure you want to delete <strong>"{task.title}"</strong>?
              This will permanently remove the task and all its data.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTask}
                disabled={deleteTask.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700"
              >
                {deleteTask.isPending ? "Deleting..." : "Delete Task"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* File Version History Modal */}
      {activeAttachment && (
        <FileVersionHistoryModal
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setActiveAttachment(null);
          }}
          fileName={activeAttachment.name}
          attachmentId={activeAttachment.id}
        />
      )}

      {/* Hidden File Input for Version Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </Box>
  );
};
