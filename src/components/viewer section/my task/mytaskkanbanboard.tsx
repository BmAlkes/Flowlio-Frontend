import React, { useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { cn } from "@/lib/utils";
import { useFetchViewerTasks, ViewerTask } from "@/hooks/useFetchViewerTasks";
import { useUpdateTaskStatus } from "@/hooks/useupdatetask";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Download, Eye, File, FileText, Image, X } from "lucide-react";

// Status keys for consistency
type StatusType =
  | "todo"
  | "in_progress"
  | "delay"
  | "changes"
  | "updated"
  | "completed";

// Task type for display
export type Task = {
  id: string;
  title: string;
  project: string;
  comments?: string;
  endDate: string;
  status: StatusType;
  creatorName?: string;
  creatorEmail?: string;
  description?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
};

const STATUS_COLORS: Record<StatusType, string> = {
  todo: "#5B60FE",
  in_progress: "#FFA632",
  delay: "#FF0080",
  changes: "#4DCDC9",
  updated: "#A94DCD",
  completed: "#CD4D4F",
};

const STATUS_COLUMNS: StatusType[] = [
  "todo",
  "in_progress",
  "delay",
  "changes",
  "updated",
  "completed",
];

// Helpers
const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
  if (type === "application/pdf") return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Draggable Task Card
function DraggableTask({
  task,
  onView,
}: {
  task: Task;
  onView: (task: Task) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  return (
    <Box
      className={cn(
        "bg-card rounded-lg border border-border p-4 min-w-[240px] mb-3 mx-2 transition-all duration-200 shadow-sm",
        "hover:shadow-md hover:border-border",
        isDragging && "opacity-50 shadow-lg scale-105"
      )}
    >
      {/* Drag handle area */}
      <Box
        ref={setNodeRef}
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        {...attributes}
        {...listeners}
      >
        <Flex className="flex-col w-full items-start gap-3">
          {/* Task Title */}
          <Box className="font-semibold text-gray-800 text-sm leading-tight w-full">
            {task.title}
          </Box>

          {/* Project and Due Date */}
          <Flex className="flex-col items-start gap-2 w-full">
            <Flex className="text-muted-foreground items-center gap-2">
              <Box className="w-2 h-2 bg-blue-500 rounded-full"></Box>
              <span className="text-xs font-medium text-foreground">
                {task.project}
              </span>
            </Flex>

            {task.endDate && (
              <Flex className="text-muted-foreground items-center gap-2">
                <Box className="w-2 h-2 bg-red-500 rounded-full"></Box>
                <span className="text-xs text-red-600 font-medium">
                  {t("tasks.dueDate")}: {task.endDate}
                </span>
              </Flex>
            )}

            {task.creatorName && (
              <Flex className="text-muted-foreground items-center gap-2">
                <Box className="w-2 h-2 bg-green-500 rounded-full"></Box>
                <span className="text-xs font-medium text-foreground">
                  {t("support.sentBy")}: {task.creatorName}
                </span>
              </Flex>
            )}

            {task.comments && (
              <Flex className="text-muted-foreground items-center gap-2">
                <Box className="w-2 h-2 bg-gray-400 rounded-full"></Box>
                <span className="text-xs italic line-clamp-2">{task.comments}</span>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* View Details link — outside drag listeners so it's always clickable */}
      <Flex className="mt-3 justify-end">
        <button
          type="button"
          className="text-xs text-blue-500 underline cursor-pointer hover:text-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onView(task);
          }}
        >
          {t("projects.viewDetails")}
        </button>
        {task.attachments && task.attachments.length > 0 && (
          <span className="text-xs text-muted-foreground ml-3 flex items-center gap-1">
            <File className="w-3 h-3" />
            {task.attachments.length}
          </span>
        )}
      </Flex>
    </Box>
  );
}

// Droppable Column
function DroppableColumn({
  status,
  children,
  highlight,
}: {
  status: StatusType;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Flex
      className={cn(
        "flex-col flex-1 min-w-[280px] bg-card rounded-xl border-1 border-border",
        "overflow-hidden max-h-[700px] transition-all duration-200",
        isOver && "border-dashed border-blue-400 bg-blue-50/30",
        highlight && "border-green-300 bg-green-50"
      )}
      ref={setNodeRef}
    >
      <Box
        className="text-base font-semibold text-white w-full px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      >
        <span>{t(`tasks.statusValue.${status}`)}</span>
        <span className="text-xs opacity-80">
          {React.Children.count(children)}
        </span>
      </Box>
      <Box className="flex-1 overflow-y-auto p-2">{children}</Box>
    </Flex>
  );
}

// Task Detail Modal Content
function TaskDetailModalContent({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <Stack className="gap-4">
      {/* Header */}
      <Stack className="gap-1">
        <p className="text-sm text-muted-foreground">{t("tasks.project")}</p>
        <h2 className="text-lg font-semibold text-foreground">{task.project}</h2>
      </Stack>

      <Stack className="gap-5">
        {/* Title */}
        <Stack className="gap-1">
          <p className="text-sm text-muted-foreground">{t("tasks.taskTitle")}</p>
          <h3 className="text-base font-medium text-foreground">{task.title}</h3>
        </Stack>

        {/* Description */}
        {task.description && (
          <Stack className="gap-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {t("support.description")}
            </p>
            <Box className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </Box>
          </Stack>
        )}

        {/* Attachments */}
        {task.attachments && task.attachments.length > 0 && (
          <Stack className="gap-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <File className="w-4 h-4" />
              Attachments ({task.attachments.length})
            </p>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {task.attachments.map((attachment) => (
                <Box
                  key={attachment.id}
                  className="bg-card rounded-lg p-3 border border-border hover:border-blue-300 transition-colors group"
                >
                  <Flex className="gap-3 items-center">
                    <Center className="w-10 h-10 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                      {getFileIcon(attachment.type)}
                    </Center>
                    <Box className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </Box>
                    <Flex className="gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 cursor-pointer"
                        title="View"
                        onClick={() => setPreviewUrl(attachment.url)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 cursor-pointer"
                        title="Download"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = attachment.url;
                          link.download = attachment.name;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Box>
          </Stack>
        )}

        <hr className="border-border" />

        {/* Meta grid */}
        <Center className="grid grid-cols-2 gap-4">
          <Stack className="bg-[#FFFEE8] text-center p-3 rounded-lg">
            <p className="text-xs text-[#929292]">{t("tasks.status")}</p>
            <p className="text-sm font-medium capitalize text-foreground">
              {task.status.replace("_", " ")}
            </p>
          </Stack>
          <Stack className="bg-[#FFFEE8] text-center p-3 rounded-lg">
            <p className="text-xs text-[#929292]">{t("tasks.dueDate")}</p>
            <p className="text-sm font-medium text-foreground">
              {task.endDate || "N/A"}
            </p>
          </Stack>
          {task.creatorName && (
            <Stack className="bg-[#FFFEE8] text-center p-3 rounded-lg col-span-2">
              <p className="text-xs text-[#929292]">{t("support.sentBy")}</p>
              <p className="text-sm font-medium text-foreground">{task.creatorName}</p>
            </Stack>
          )}
        </Center>

        {/* Close */}
        <Flex className="justify-end">
          <Button
            variant="outline"
            className="rounded-full px-6 cursor-pointer"
            onClick={onClose}
          >
            {t("common.close")}
          </Button>
        </Flex>
      </Stack>

      {/* Attachment Preview overlay */}
      {previewUrl && (
        <Box className="fixed inset-0 z-[200] flex items-center justify-center">
          <Box
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewUrl(null)}
          />
          <Box className="relative bg-card rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <Flex className="justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Attachment Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={() => setPreviewUrl(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </Flex>
            <Box className="p-4">
              {previewUrl.includes(".pdf") || previewUrl.includes("pdf") ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Attachment Preview"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Stack>
  );
}

interface KanbanBoardProps {
  filteredTasks?: Task[];
}

export default function KanbanBoard({ filteredTasks }: KanbanBoardProps) {
  const { t } = useTranslation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const modalProps = useGeneralModalDisclosure();

  const { data: tasksResponse, isLoading, error } = useFetchViewerTasks();
  const updateTaskStatus = useUpdateTaskStatus();

  // Convert backend tasks to display format
  const convertTasksToDisplay = (viewerTasks: ViewerTask[]): Task[] => {
    return viewerTasks.map((task) => ({
      id: task.id,
      title: task.title,
      project: task.projectName,
      endDate: task.endDate
        ? format(new Date(task.endDate), "MMM dd, yyyy")
        : "",
      status: task.status as StatusType,
      comments: task.description,
      description: task.description,
      creatorName: task.creatorName,
      creatorEmail: task.creatorEmail,
      attachments: task.attachments || [],
    }));
  };

  const tasks = tasksResponse?.data
    ? convertTasksToDisplay(tasksResponse.data)
    : [];
  const displayTasks = filteredTasks || tasks;

  const handleViewTask = (task: Task) => {
    setViewTask(task);
    modalProps.onOpenChange(true);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }
    if (active.id === over.id) {
      console.log("❌ Dropped on same element");
      return;
    }

    // If dropped on a column, update status
    const overStatus = STATUS_COLUMNS.find((col) => col === over.id);

    if (overStatus) {
      updateTaskStatus.mutate({
        taskId: active.id as string,
        status: overStatus as any,
      });
    } else {
      console.log("❌ No valid status column found");
    }
  };

  if (isLoading) {
    return (
      <Box className="w-full">
        <Flex className="w-full items-start gap-4 min-h-[600px] overflow-x-auto mt-5 p-4 bg-gray-100/50 rounded-lg">
          {STATUS_COLUMNS.map((status) => (
            <Flex
              key={status}
              className="flex-col flex-1 min-w-[280px] bg-card rounded-xl border border-border overflow-hidden max-h-[700px]"
            >
              <Box
                className="text-base font-semibold text-white w-full px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              >
                <span>{t(`tasks.statusValue.${status}`)}</span>
                <span className="text-xs opacity-80">0</span>
              </Box>
              <Box className="flex-1 overflow-y-auto p-2">
                <Box className="animate-pulse space-y-3">
                  <Box className="bg-muted h-20 rounded-lg"></Box>
                  <Box className="bg-muted h-20 rounded-lg"></Box>
                </Box>
              </Box>
            </Flex>
          ))}
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="w-full text-center py-8">
        <p className="text-red-600">{t("tasks.loadingError")} {error.message}</p>
      </Box>
    );
  }

  return (
    <>
      <Box className="w-full">
        <Flex className="w-full items-start gap-4 min-h-[600px] overflow-x-auto mt-5 p-0 bg-gray-100/50 rounded-lg">
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={(event) => {
              const task = tasks.find((t) => t.id === event.active.id);
              setActiveTask(task || null);
            }}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveTask(null)}
          >
            {STATUS_COLUMNS.map((status) => (
              <DroppableColumn
                key={status}
                status={status}
                highlight={status === "completed"}
              >
                {displayTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <DraggableTask
                      key={task.id}
                      task={task}
                      onView={handleViewTask}
                    />
                  ))}
              </DroppableColumn>
            ))}
            <DragOverlay>
              {activeTask ? (
                <Box className="bg-card rounded-lg border-2 border-blue-400 p-4 min-w-[240px] shadow-xl">
                  <Flex className="flex-col w-full items-start gap-2">
                    <Box className="font-semibold text-gray-800 text-sm leading-tight">
                      {activeTask.title}
                    </Box>
                    <Box className="text-muted-foreground text-xs">
                      {t("tasks.project")}:{" "}
                      <span className="font-medium">{activeTask.project}</span>
                    </Box>
                    {activeTask.creatorName && (
                      <Box className="text-muted-foreground text-xs">
                        {t("support.sentBy")}:{" "}
                        <span className="font-medium">
                          {activeTask.creatorName}
                        </span>
                      </Box>
                    )}
                    {activeTask.comments && (
                      <Box className="text-muted-foreground text-xs italic">
                        {activeTask.comments}
                      </Box>
                    )}
                  </Flex>
                  <Flex className="justify-end mt-3">
                    <Box className="text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                      {activeTask.endDate}
                    </Box>
                  </Flex>
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Flex>
      </Box>

      {/* Task Detail Modal */}
      <GeneralModal
        {...modalProps}
        contentProps={{ className: "max-w-2xl max-sm:w-full" }}
      >
        {viewTask && (
          <TaskDetailModalContent
            task={viewTask}
            onClose={() => {
              modalProps.onOpenChange(false);
              setViewTask(null);
            }}
          />
        )}
      </GeneralModal>
    </>
  );
}
