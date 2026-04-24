import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { MessageCircle, Calendar, User, Lock, Globe } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "MMM dd");
    } catch {
      return null;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-1">
          {task.title}
        </h4>
        {task.visibility === "private" ? (
          <Lock className="w-3 h-3 text-orange-400 shrink-0" />
        ) : (
          <Globe className="w-3 h-3 text-blue-400 shrink-0" />
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Project Info */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <span className="font-medium">{task.projectName}</span>
        <span>•</span>
        <span>{task.projectNumber}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Assignee */}
          {task.assigneeImage ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assigneeImage} alt={task.assigneeName} />
              <AvatarFallback className="text-xs">
                {getInitials(task.assigneeName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
              <User className="h-3 w-3 text-muted-foreground" />
            </div>
          )}

          {/* Due Date */}
          {task.endDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.endDate)}</span>
            </div>
          )}

          {/* Estimated Hours */}
          {/* {task.estimatedHours && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )} */}
        </div>

        {/* Comments Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-muted-foreground"
        >
          <MessageCircle className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
