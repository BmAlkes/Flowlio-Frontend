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
import { format } from "date-fns";
import { useFetchProjectComments } from "@/hooks/usefetchprojectcomments";

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

// Draggable Task Card
function DraggableTask({
  task,
  onTaskClick,
}: {
  task: Task;
  onTaskClick?: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const [showComments, setShowComments] = useState(false);

  // Fetch project comments if projectId is available
  const { data: commentsResponse } = useFetchProjectComments(
    task.projectId || ""
  );

  // Map project comments to task comments format
  const projectComments =
    commentsResponse?.data?.map((comment) => ({
      id: comment.id,
      text: comment.content,
      timestamp: new Date(comment.createdAt),
    })) || [];

  // Use project comments if available, otherwise use task comments
  const displayComments =
    projectComments.length > 0 ? projectComments : task.comments || [];
  return (
    <Box className="relative">
      <Box
        className={cn(
          "bg-[#F6F6F6] rounded-lg border border-gray-200 p-4  min-w-[240px] mb-3 mx-2 transition-all duration-200",
          "hover:shadow-md hover:border-gray-300 cursor-pointer",
          isDragging && "opacity-50 shadow-lg scale-105"
        )}
        style={{
          transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
        }}
        ref={setNodeRef}
        onClick={(e) => {
          // Don't open modal if dragging or clicking on drag handle
          if (!isDragging && !e.defaultPrevented && onTaskClick) {
            onTaskClick(task);
          }
        }}
      >
        <Flex className="flex-col w-full items-start gap-2">
          <Flex className="w-full justify-between items-center">
            {/* Drag handle */}
            <Flex
              className="font-semibold text-gray-800 text-md leading-tight cursor-grab"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="text-gray-400 size-4" />

              {task.title}
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
                    variant="outline"
                    className="bg-[#40aeed] hover:bg-[#40aeed]/80 w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center text-center"
                  >
                    <MessageCircleMore className="text-white size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="mb-2">
                  <p>View Comments</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Flex>

          <Flex
            className="mt-4 flex-col items-start gap-1 pointer-events-none"
            style={{
              userSelect: "none",
            }}
          >
            <Flex className="text-gray-600">
              <Flex className="gap-1 text-sm font-normal">
                <img
                  src="/dashboard/analytics.svg"
                  className="size-4"
                  alt="calendericon"
                />
                Project:
              </Flex>

              <span className="font-nromal text-black text-sm ml-4">
                {task.project}
              </span>
            </Flex>

            <Flex className="mt-1 text-gray-600">
              <Flex className="gap-1 text-sm">
                <img
                  src="/dashboard/calendericonfordraging.svg"
                  className="size-4"
                  alt="calendericon"
                />
                Deadline:
              </Flex>
              <Box className="text-red-500 text-xs font-medium rounded ml-2">
                {task.dueDate}
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      {showComments && (
        <Box className="absolute top-0 left-0 w-full h-full z-50 flex flex-col bg-black/50 rounded">
          <Button
            onClick={() => setShowComments(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full cursor-pointer self-end m-2"
          >
            Close Comments
          </Button>
          <Box className="flex-1 flex flex-col gap-2 max-h-70 overflow-y-auto bg-gray-50 p-2 rounded">
            {displayComments && displayComments.length > 0 ? (
              displayComments.map((comment) => (
                <Box
                  key={comment.id}
                  className="bg-white p-2 rounded shadow text-sm"
                >
                  <Box>{comment.text}</Box>
                  <Box className="text-xs text-gray-400 mt-1">
                    {format(comment.timestamp, "MMM d, yyyy hh:mm a")}
                  </Box>
                </Box>
              ))
            ) : (
              <Box className="text-gray-400 text-center">No comments yet.</Box>
            )}
          </Box>
        </Box>
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
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Flex
      className={cn(
        "flex-col flex-1 min-w-[280px] bg-white rounded-xl border-1 border-gray-200",
        "overflow-hidden max-h-[700px] transition-all duration-200",
        isOver && "border-dashed border-blue-400 bg-blue-50/30"
      )}
      ref={setNodeRef}
    >
      <Box
        className="text-base font-semibold text-white w-full px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: STATUS_COLORS[status] }}
      >
        <span>{status}</span>
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
}

export default function KanbanBoard({
  tasks,
  setTasks,
  filteredTasks,
  onStatusUpdate,
  onTaskClick,
}: KanbanBoardProps) {
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
            <DroppableColumn key={status} status={status}>
              {filteredTasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    onTaskClick={onTaskClick}
                  />
                ))}
            </DroppableColumn>
          ))}
          <DragOverlay>
            {activeTask ? (
              <Box className="bg-white rounded-lg border-2 border-blue-400 p-4 min-w-[240px] shadow-xl">
                <Flex className="flex-col w-full items-start gap-2">
                  <Box className="font-semibold text-gray-800 text-sm leading-tight">
                    {activeTask.title}
                  </Box>
                  <Box className="text-gray-600 text-xs">
                    Project:{" "}
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
      </Flex>
    </Box>
  );
}
