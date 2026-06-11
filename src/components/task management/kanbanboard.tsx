import React, { useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { TooltipContent } from "../ui/tooltip";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { GripVertical, MessageCircleMore } from "lucide-react";
import { CommentThread } from "@/components/common/CommentThread";
import { useTranslation } from "react-i18next";

// Task type
export type Task = {
  id: string;
  title: string;
  project: string;
  projectId?: string; // Add projectId for fetching comments
  dueDate: string;
  status: StatusType;
  comments?: { id: string; text: string; timestamp: Date }[];
  // Additional fields for modal
  description?: string;
  assigneeName?: string;
  assigneeImage?: string;
  creatorName?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  parentId?: string;
  parentTitle?: string;
  startAfter?: string | null;
  finishBefore?: string | null;
  projectCustomFields?: Record<string, any>;
};

export type CustomFieldDefinition = {
  id: string;
  name: string;
  type: string;
  options?: Array<{ label: string; color: string }>;
};

export const initialTasks: Task[] = [];

type StatusType =
  | "To Do"
  | "In Progress"
  | "Delay"
  | "Changes"
  | "Updated"
  | "Completed";

const STATUS_COLORS: Record<StatusType, string> = {
  "To Do": "#5B60FE",
  "In Progress": "#FFA632",
  Delay: "#FF0080",
  Changes: "#4DCDC9",
  Updated: "#A94DCD",
  Completed: "#CD4D4F",
};

const STATUS_COLUMNS: StatusType[] = [
  "To Do",
  "In Progress",
  "Delay",
  "Changes",
  "Updated",
  "Completed",
];

const KANBAN_STATUS_I18N_KEY: Record<StatusType, string> = {
  "To Do": "taskManagement.statusColumns.toDo",
  "In Progress": "taskManagement.statusColumns.inProgress",
  Delay: "taskManagement.statusColumns.delay",
  Changes: "taskManagement.statusColumns.changes",
  Updated: "taskManagement.statusColumns.updated",
  Completed: "taskManagement.statusColumns.completed",
};

// Draggable Task Card
function DraggableTask({
  task,
  onTaskClick,
  projectCustomFieldsDefinitions,
}: {
  task: Task;
  onTaskClick?: (task: Task) => void;
  projectCustomFieldsDefinitions?: CustomFieldDefinition[];
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const [showComments, setShowComments] = useState(false);

  const commentCount = task.comments?.length ?? 0;
  const statusColor = STATUS_COLORS[task.status] ?? "#5B60FE";

  return (
    <Box className="relative mb-3 w-full">
      <Box
        className={cn(
          "bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-200 w-full",
          "hover:shadow-md hover:border-border/80 cursor-pointer",
          isDragging && "opacity-50 shadow-xl scale-105"
        )}
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        }}
        ref={setNodeRef}
        onClick={(e) => {
          if (!isDragging && !e.defaultPrevented && onTaskClick) {
            onTaskClick(task);
          }
        }}
      >
        {/* Status accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: statusColor }} />

        <div className="p-3">
          {/* Title row */}
          <Flex className="w-full justify-between items-start gap-2 mb-3">
            <Flex
              className="font-semibold text-foreground text-sm leading-snug cursor-grab gap-1.5 flex-1 min-w-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="text-muted-foreground size-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{task.title}</span>
            </Flex>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowComments(!showComments);
                    }}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "relative w-7 h-7 p-0 rounded-full shrink-0 border transition-colors",
                      showComments
                        ? "bg-[#0c89af] border-[#0c89af] text-white"
                        : "border-border text-muted-foreground hover:border-[#0c89af] hover:text-[#0c89af]"
                    )}
                  >
                    <MessageCircleMore className="size-3.5" />
                    {commentCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#0c89af] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {commentCount > 9 ? "9+" : commentCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {t("taskManagement.viewComments")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Flex>

          {/* Meta info */}
          <div
            className="flex flex-col gap-1.5 pointer-events-none"
            style={{ userSelect: "none" }}
          >
            <Flex className="gap-1.5 text-xs text-muted-foreground items-center">
              <img src="/dashboard/analytics.svg" className="size-3.5 shrink-0" alt="" />
              <span className="text-foreground font-medium truncate">{task.project}</span>
            </Flex>

            <Flex className="gap-1.5 text-xs text-muted-foreground items-center">
              <img src="/dashboard/calendericonfordraging.svg" className="size-3.5 shrink-0" alt="" />
              <span className="text-red-500 font-medium">{task.dueDate}</span>
            </Flex>
          </div>

          {/* Custom Field Colors */}
          {task.projectCustomFields &&
            projectCustomFieldsDefinitions &&
            projectCustomFieldsDefinitions.length > 0 && (
              <Flex className="mt-2.5 gap-1.5 flex-wrap pointer-events-none">
                {projectCustomFieldsDefinitions.map((field) => {
                  if (field.type !== "select") return null;
                  const value = task.projectCustomFields?.[field.id];
                  if (!value) return null;
                  const option = field.options?.find((opt) => opt.label === value);
                  if (!option) return null;
                  return (
                    <TooltipProvider key={field.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="w-3 h-3 rounded-full border border-white shadow-sm pointer-events-auto"
                            style={{ backgroundColor: option.color }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
                          {field.name}: {value}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </Flex>
            )}
        </div>
      </Box>

      {/* Comments panel — positioned below the card */}
      {showComments && task.projectId && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
            <Flex className="gap-1.5 items-center">
              <MessageCircleMore className="size-3.5 text-[#0c89af]" />
              <span className="text-xs font-semibold text-foreground">
                {t("taskManagement.viewComments")}
              </span>
            </Flex>
            <button
              onClick={() => setShowComments(false)}
              className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-xs">✕</span>
            </button>
          </div>

          <div className="p-3">
            <CommentThread
              projectId={task.projectId}
              taskId={task.id}
              canComment
              maxHeight="11rem"
              showHeader={false}
            />
          </div>
        </div>
      )}
    </Box>
  );
}

// Droppable Column
function DroppableColumn({
  status,
  children,
}: {
  status: StatusType;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Flex
      className={cn(
        "flex-col w-[280px] shrink-0 bg-card rounded-xl border-1 border-border",
        "overflow-hidden max-h-[700px] transition-all duration-200",
        isOver && "border-dashed border-blue-400 bg-blue-50/30"
      )}
      ref={setNodeRef}
    >
      <Box
        className="text-base font-semibold text-white w-full px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      >
        <span>{t(KANBAN_STATUS_I18N_KEY[status])}</span>
        <span className="text-xs opacity-80">
          {React.Children.count(children)}
        </span>
      </Box>
      <Box className="flex-1 overflow-y-auto p-2">{children}</Box>
    </Flex>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  filteredTasks: Task[];
  onStatusUpdate?: (taskId: string, status: string) => void;
  onTaskClick?: (task: Task) => void;
  projectCustomFieldsData?: CustomFieldDefinition[];
}

export default function KanbanBoard({
  tasks,
  setTasks,
  filteredTasks,
  onStatusUpdate,
  onTaskClick,
  projectCustomFieldsData,
}: KanbanBoardProps) {
  const { t } = useTranslation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;
    if (active.id === over.id) return;

    // If dropped on a column, update status
    const overStatus = STATUS_COLUMNS.find((col) => col === over.id);

    if (overStatus) {
      // Update local state immediately for better UX
      setTasks(
        tasks.map((task: Task) =>
          task.id === active.id ? { ...task, status: overStatus } : task
        )
      );

      // Call API to update status
      if (onStatusUpdate) {
        // Convert KanbanBoard status back to API status
        const apiStatus = mapKanbanToApiStatus(overStatus);
        onStatusUpdate(active.id as string, apiStatus);
      }
    }
  };

  // Helper function to map KanbanBoard status to API status
  const mapKanbanToApiStatus = (kanbanStatus: string) => {
    const statusMap: Record<string, string> = {
      "To Do": "todo",
      "In Progress": "in_progress",
      Updated: "updated",
      Delay: "delay",
      Changes: "changes",
      Completed: "completed",
    };
    return statusMap[kanbanStatus] || "todo";
  };

  return (
    <Box className="w-full">
      <div className="w-full overflow-x-auto mt-5 bg-muted/20 rounded-lg">
      <div className="inline-flex items-start gap-4 min-h-[600px] p-3">
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
            <DroppableColumn key={status} status={status}>
              {filteredTasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    onTaskClick={onTaskClick}
                    projectCustomFieldsDefinitions={projectCustomFieldsData}
                  />
                ))}
            </DroppableColumn>
          ))}
          <DragOverlay>
            {activeTask ? (
              <Box className="bg-card rounded-lg border-2 border-blue-400 p-4 min-w-[240px] shadow-xl">
                <Flex className="flex-col w-full items-start gap-2">
                  <Box className="font-semibold text-foreground text-sm leading-tight">
                    {activeTask.title}
                  </Box>
                  <Box className="text-muted-foreground text-sm">
                    {t("taskManagement.dragOverlayProject")}{" "}
                    <span className="font-medium">{activeTask.project}</span>
                  </Box>
                </Flex>
                <Flex className="justify-end mt-3">
                  <Box className="text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                    {activeTask.dueDate}
                  </Box>
                </Flex>
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      </div>
    </Box>
  );
}
