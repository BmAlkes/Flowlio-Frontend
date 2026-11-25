import { useEffect, useState, type ReactNode } from "react";
import { DndContext, DragOverlay, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { ListChecks, MessageCircleMore, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CommentThread } from "@/components/common/CommentThread";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { DueChip, TaskAvatar } from "./TaskBits";
import { STATUS_I18N, TASK_STATUSES, statusToneClass, type StatusLabel, type TaskStatusKey } from "./task-ui";
import type { CustomFieldDefinition as TaskFieldDefinition } from "@/hooks/usecustomfields";
import { fieldsForTask, isEmpty, type FormatContext } from "@/features/custom-fields/field-values";
import { FieldValue } from "@/features/custom-fields/FieldValue";

export type Task = {
  id: string;
  title: string;
  project: string;
  projectId?: string;
  dueDate: string;
  status: StatusLabel;
  statusKey: TaskStatusKey;
  endDate?: string | null;
  comments?: { id: string; text: string; timestamp: Date }[];
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeImage?: string;
  creatorName?: string;
  attachments?: Array<{ id: string; name: string; url: string; size: number; type: string }>;
  parentId?: string;
  parentTitle?: string;
  subtasks?: { done: number; total: number };
  startAfter?: string | null;
  finishBefore?: string | null;
  projectCustomFields?: Record<string, any>;
  /** Values of the organization's task fields, keyed by field id. */
  customFields?: Record<string, unknown>;
};

/** Task field values shown on a card: the first three that are filled in. */
export type CardFields = { fields: TaskFieldDefinition[]; context: FormatContext };

function TaskFieldChips({ task, cardFields }: { task: Task; cardFields?: CardFields }) {
  if (!cardFields || !task.customFields) return null;
  const shown = fieldsForTask(cardFields.fields, task.projectId).filter(field => !isEmpty(task.customFields?.[field.id])).slice(0, 3);
  if (!shown.length) return null;
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-xs">
      {shown.map(field => (
        <span key={field.id} title={field.name} className="inline-flex max-w-full items-center gap-1">
          {!["select", "rating", "progress"].includes(field.type) && <span className="text-muted-foreground">{field.name}:</span>}
          <FieldValue field={field} value={task.customFields?.[field.id]} context={cardFields.context} compact />
        </span>
      ))}
    </span>
  );
}

export type CustomFieldDefinition = {
  id: string;
  name: string;
  type: string;
  options?: Array<{ label: string; color: string }>;
};

export const initialTasks: Task[] = [];

function CustomFieldDots({ task, fields }: { task: Task; fields?: CustomFieldDefinition[] }) {
  if (!task.projectCustomFields || !fields?.length) return null;
  const dots = fields.flatMap(field => {
    if (field.type !== "select") return [];
    const value = task.projectCustomFields?.[field.id];
    const option = value ? field.options?.find(opt => opt.label === value) : undefined;
    return option ? [{ field, value, color: option.color }] : [];
  });
  if (!dots.length) return null;
  return (
    <span className="flex gap-1.5 flex-wrap">
      {dots.map(({ field, value, color }) => (
        <TooltipProvider key={field.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs px-2 py-1">{field.name}: {value}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </span>
  );
}

function CardBody({ task, showProject, fields, cardFields, onComments, commentsOpen }: {
  task: Task; showProject: boolean; fields?: CustomFieldDefinition[]; cardFields?: CardFields; onComments?: () => void; commentsOpen?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="tk-card-title">{task.title}</h3>
        <TaskAvatar name={task.assigneeName} image={task.assigneeImage} id={task.assigneeId} />
      </div>
      {showProject && <span className="tk-project" title={task.project}>{task.project}</span>}
      <TaskFieldChips task={task} cardFields={cardFields} />
      <div className="tk-card-foot">
        <DueChip endDate={task.endDate} status={task.statusKey} />
        {task.subtasks && task.subtasks.total > 0 && (
          <span className="tk-meta" title={t("tasksLayout.subtasks")}>
            <ListChecks aria-hidden="true" className="size-3.5" />
            {task.subtasks.done}/{task.subtasks.total}
          </span>
        )}
        <CustomFieldDots task={task} fields={fields} />
        {onComments && (
          <button type="button" className={cn("tk-icon-btn tk-comments size-7", commentsOpen && "text-[#0c89af]")}
            aria-label={t("taskManagement.viewComments")} aria-expanded={commentsOpen}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onComments(); }}>
            <MessageCircleMore aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </>
  );
}

function DraggableTask({ task, showProject, fields, cardFields, onTaskClick }: {
  task: Task; showProject: boolean; fields?: CustomFieldDefinition[]; cardFields?: CardFields; onTaskClick?: (task: Task) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="relative">
      <div ref={setNodeRef} {...listeners} {...attributes} role="button" tabIndex={0}
        className={cn("tk-card", isDragging && "is-dragging")}
        onClick={() => !isDragging && onTaskClick?.(task)}
        onKeyDown={e => { if (e.key === "Enter") onTaskClick?.(task); }}>
        <CardBody task={task} showProject={showProject} fields={fields} cardFields={cardFields}
          commentsOpen={showComments} onComments={task.projectId ? () => setShowComments(open => !open) : undefined} />
      </div>
      {showComments && task.projectId && (
        <div className="tk-comments-panel" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
            <span className="flex gap-1.5 items-center text-xs font-semibold">
              <MessageCircleMore aria-hidden="true" className="size-3.5 text-[#0c89af]" />
              {t("taskManagement.viewComments")}
            </span>
            <button type="button" className="tk-icon-btn size-7" aria-label={t("taskManagement.closeComments")} onClick={() => setShowComments(false)}>
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </div>
          <div className="p-3">
            <CommentThread projectId={task.projectId} taskId={task.id} canComment maxHeight="11rem" showHeader={false} />
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ status, count, collapsed, onToggle, onAdd, children }: {
  status: TaskStatusKey; count: number; collapsed: boolean; onToggle: () => void; onAdd?: () => void; children: ReactNode;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const name = t(STATUS_I18N[status]);

  if (collapsed) {
    return (
      <button ref={setNodeRef} type="button" className={cn("tk-collapsed", statusToneClass(status), isOver && "is-over")}
        aria-label={t("tasksLayout.expandColumn", { status: name })} onClick={onToggle}>
        <span className="tk-count">{count}</span>
        <span className="tk-collapsed-label">{name}</span>
      </button>
    );
  }

  return (
    <section ref={setNodeRef} aria-label={name} className={cn("tk-column", statusToneClass(status), isOver && "is-over")}>
      <div className="tk-column-head">
        <span className="tk-column-title"><span className="truncate">{name}</span><span className="tk-count">{count}</span></span>
        <span className="tk-head-actions">
          {onAdd && (
            <button type="button" className="tk-icon-btn" aria-label={t("tasksLayout.addTaskIn", { status: name })} onClick={onAdd}>
              <Plus aria-hidden="true" className="size-4" />
            </button>
          )}
          {status === "completed" && (
            <button type="button" className="tk-icon-btn" aria-label={t("tasksLayout.collapseColumn", { status: name })} onClick={onToggle}>
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </span>
      </div>
      <div className="tk-column-body">
        {count === 0 ? <div className="tk-drop-hint">{t("tasksLayout.dropHere")}</div> : children}
      </div>
      {onAdd && (
        <button type="button" className="tk-add" onClick={onAdd}>
          <Plus aria-hidden="true" className="size-3.5" />{t("tasksLayout.addTask")}
        </button>
      )}
    </section>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  showProject: boolean;
  hiddenStatuses?: TaskStatusKey[];
  onStatusUpdate?: (taskId: string, status: TaskStatusKey) => void;
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskStatusKey) => void;
  projectCustomFieldsData?: CustomFieldDefinition[];
  cardFields?: CardFields;
}

export default function KanbanBoard({ tasks, showProject, hiddenStatuses = [], onStatusUpdate, onTaskClick, onAddTask, projectCustomFieldsData, cardFields }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Completed tasks pile up, so that column starts folded.
  const [collapsed, setCollapsed] = useState<Set<TaskStatusKey>>(() => new Set(["completed"]));
  // Keep a dropped card in its new column until the refetched tasks arrive.
  const [moved, setMoved] = useState<Record<string, TaskStatusKey>>({});
  useEffect(() => setMoved({}), [tasks]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const shown = TASK_STATUSES.filter(status => !hiddenStatuses.includes(status));
  const statusOf = (task: Task) => moved[task.id] ?? task.statusKey;
  const toggle = (status: TaskStatusKey) => setCollapsed(prev => {
    const next = new Set(prev);
    if (next.has(status)) next.delete(status); else next.add(status);
    return next;
  });

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    const target = TASK_STATUSES.find(status => status === over?.id);
    const task = tasks.find(item => item.id === active.id);
    if (!target || !task || statusOf(task) === target) return;
    setMoved(prev => ({ ...prev, [task.id]: target }));
    onStatusUpdate?.(task.id, target);
  };

  return (
    <div className="tk-board-scroll">
      <div className="tk-board">
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={event => setActiveTask(tasks.find(task => task.id === event.active.id) ?? null)}
          onDragEnd={handleDragEnd} onDragCancel={() => setActiveTask(null)}>
          {shown.map(status => {
            const items = tasks.filter(task => statusOf(task) === status);
            return (
              <Column key={status} status={status} count={items.length} collapsed={shown.length > 1 && collapsed.has(status)}
                onToggle={() => toggle(status)} onAdd={onAddTask && status !== "completed" ? () => onAddTask(status) : undefined}>
                {items.map(task => (
                  <DraggableTask key={task.id} task={task} showProject={showProject} fields={projectCustomFieldsData} cardFields={cardFields} onTaskClick={onTaskClick} />
                ))}
              </Column>
            );
          })}
          <DragOverlay>
            {activeTask ? <div className="tk-card is-overlay"><CardBody task={activeTask} showProject={showProject} cardFields={cardFields} /></div> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
