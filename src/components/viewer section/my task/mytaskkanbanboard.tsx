import React, { useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { cn } from "@/lib/utils";
import { useFetchViewerTasks, ViewerTask } from "@/hooks/useFetchViewerTasks";
import { useUpdateTaskStatus } from "@/hooks/useupdatetask";
import { format } from "date-fns";

// Map backend status to frontend status
const mapStatusToDisplay = (status: string): StatusType => {
  switch (status) {
    case "todo":
      return "To Do";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "updated":
      return "Updated";
    case "delay":
      return "Delay";
    case "changes":
      return "Changes";
    default:
      return "To Do";
  }
};

// Map frontend status to backend status
const mapStatusToBackend = (status: StatusType): string => {
  switch (status) {
    case "To Do":
      return "todo";
    case "In Progress":
      return "in_progress";
    case "Completed":
      return "completed";
    case "Updated":
      return "updated";
    case "Delay":
      return "delay";
    case "Changes":
      return "changes";
    default:
      return "todo";
  }
};

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
};

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
function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  return (
    <Box
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 cursor-grab min-w-[240px] mb-3 mx-2 transition-all duration-200 shadow-sm",
        "hover:shadow-md hover:border-gray-300 active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg scale-105"
      )}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
      ref={setNodeRef}
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
          <Flex className="text-gray-600 items-center gap-2">
            <Box className="w-2 h-2 bg-blue-500 rounded-full"></Box>
            <span className="text-xs font-medium text-gray-700">
              {task.project}
            </span>
          </Flex>

          {task.endDate && (
            <Flex className="text-gray-600 items-center gap-2">
              <Box className="w-2 h-2 bg-red-500 rounded-full"></Box>
              <span className="text-xs text-red-600 font-medium">
                Due: {task.endDate}
              </span>
            </Flex>
          )}

          {task.creatorName && (
            <Flex className="text-gray-600 items-center gap-2">
              <Box className="w-2 h-2 bg-green-500 rounded-full"></Box>
              <span className="text-xs font-medium text-gray-700">
                Assigned by: {task.creatorName}
              </span>
            </Flex>
          )}

          {task.comments && (
            <Flex className="text-gray-500 items-center gap-2">
              <Box className="w-2 h-2 bg-gray-400 rounded-full"></Box>
              <span className="text-xs italic">{task.comments}</span>
            </Flex>
          )}
        </Flex>
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
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Flex
      className={cn(
        "flex-col flex-1 min-w-[280px] bg-white rounded-xl border-1 border-gray-200",
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
  filteredTasks?: Task[];
}

export default function KanbanBoard({ filteredTasks }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
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
      status: mapStatusToDisplay(task.status),
      comments: task.description,
      creatorName: task.creatorName,
      creatorEmail: task.creatorEmail,
    }));
  };

  const tasks = tasksResponse?.data
    ? convertTasksToDisplay(tasksResponse.data)
    : [];
  const displayTasks = filteredTasks || tasks;

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
      const backendStatus = mapStatusToBackend(overStatus);

      updateTaskStatus.mutate({
        taskId: active.id as string,
        status: backendStatus as any,
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
              className="flex-col flex-1 min-w-[280px] bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[700px]"
            >
              <Box
                className="text-base font-semibold text-white w-full px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              >
                <span>{status}</span>
                <span className="text-xs opacity-80">0</span>
              </Box>
              <Box className="flex-1 overflow-y-auto p-2">
                <Box className="animate-pulse space-y-3">
                  <Box className="bg-gray-200 h-20 rounded-lg"></Box>
                  <Box className="bg-gray-200 h-20 rounded-lg"></Box>
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
        <p className="text-red-600">Error loading tasks: {error.message}</p>
      </Box>
    );
  }

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
            <DroppableColumn
              key={status}
              status={status}
              highlight={status === "Completed"}
            >
              {displayTasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <DraggableTask key={task.id} task={task} />
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
                  {activeTask.creatorName && (
                    <Box className="text-gray-600 text-xs">
                      Assigned by:{" "}
                      <span className="font-medium">
                        {activeTask.creatorName}
                      </span>
                    </Box>
                  )}
                  {activeTask.comments && (
                    <Box className="text-gray-500 text-xs italic">
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
  );
}
