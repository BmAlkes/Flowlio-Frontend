import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "./kanbanboard";
import { DueChip, TaskAvatar } from "./TaskBits";
import { STATUS_I18N, TASK_STATUSES, statusToneClass, type TaskStatusKey } from "./task-ui";

const PAGE = 5; // Completed tasks show this many until expanded.

function StatusMenu({ task, onChange }: { task: Task; onChange?: (taskId: string, status: TaskStatusKey) => void }) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" onClick={e => e.stopPropagation()} aria-label={t("tasksLayout.changeStatus", { task: task.title })}>
          {t(STATUS_I18N[task.statusKey])}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" onClick={e => e.stopPropagation()}>
        {TASK_STATUSES.map(status => (
          <DropdownMenuItem key={status} disabled={status === task.statusKey} onSelect={() => onChange?.(task.id, status)}>
            <span className={cn("size-2.5 rounded-full", statusToneClass(status))} style={{ background: "var(--tone)" }} />
            {t(STATUS_I18N[status])}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AddRow({ status, colSpan, onAdd }: { status: TaskStatusKey; colSpan: number; onAdd?: (status: TaskStatusKey, title?: string) => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  if (!onAdd) return null;
  return (
    <tfoot>
      <tr>
        <td className="tk-strip" />
        <td colSpan={colSpan}>
          <input className="tk-add-input" value={title} placeholder={t("tasksLayout.addTaskPlaceholder")}
            aria-label={t("tasksLayout.addTaskIn", { status: t(STATUS_I18N[status]) })}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onAdd(status, title.trim() || undefined); }} />
        </td>
      </tr>
    </tfoot>
  );
}

function Group({ status, tasks, showProject, onTaskClick, onStatusUpdate, onAddTask }: {
  status: TaskStatusKey; tasks: Task[]; showProject: boolean;
  onTaskClick?: (task: Task) => void;
  onStatusUpdate?: (taskId: string, status: TaskStatusKey) => void;
  onAddTask?: (status: TaskStatusKey, title?: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(tasks.length > 0);
  const [showAll, setShowAll] = useState(status !== "completed");
  const name = t(STATUS_I18N[status]);
  const visible = showAll ? tasks : tasks.slice(0, PAGE);
  const columns = showProject ? 5 : 4;

  return (
    <section aria-label={name} className={statusToneClass(status)}>
      <button type="button" className="tk-group-toggle" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <ChevronDown aria-hidden="true" className="size-4" />
        <span className="tk-group-name">{name}</span>
        <span className="tk-group-count">{t("tasksLayout.nTasks", { count: tasks.length })}</span>
      </button>
      {open && (
        <div className="tk-table-card mt-1">
          <div className="tk-table-scroll">
            <table className="tk-table">
              <thead>
                <tr>
                  <th className="tk-strip" aria-hidden="true" />
                  <th scope="col">{t("tasksLayout.task")}</th>
                  <th scope="col" className="tk-center">{t("tasksLayout.assignee")}</th>
                  <th scope="col" className="tk-center">{t("tasksLayout.status")}</th>
                  <th scope="col">{t("tasksLayout.dueDate")}</th>
                  {showProject && <th scope="col">{t("taskManagement.projects")}</th>}
                  <th scope="col" className="tk-center">{t("tasksLayout.subtasks")}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(task => (
                  <tr key={task.id} tabIndex={0} onClick={() => onTaskClick?.(task)} onKeyDown={e => { if (e.key === "Enter") onTaskClick?.(task); }}>
                    <td className="tk-strip" />
                    <td className="tk-row-title">{task.title}</td>
                    <td className="tk-center"><span className="inline-flex"><TaskAvatar name={task.assigneeName} image={task.assigneeImage} id={task.assigneeId} /></span></td>
                    <td className="tk-status-cell"><StatusMenu task={task} onChange={onStatusUpdate} /></td>
                    <td><DueChip endDate={task.endDate} status={task.statusKey} /></td>
                    {showProject && <td className="max-w-[260px] truncate text-muted-foreground" title={task.project}>{task.project}</td>}
                    <td className="tk-center text-muted-foreground">{task.subtasks?.total ? `${task.subtasks.done}/${task.subtasks.total}` : "—"}</td>
                  </tr>
                ))}
                {tasks.length > PAGE && status === "completed" && (
                  <tr onClick={() => setShowAll(value => !value)}>
                    <td className="tk-strip" />
                    <td colSpan={columns + 1}>
                      <button type="button" className="tk-more">
                        {showAll ? t("tasksLayout.showLess") : t("tasksLayout.showMore", { count: tasks.length - PAGE })}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
              {status !== "completed" && <AddRow status={status} colSpan={columns + 1} onAdd={onAddTask} />}
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export function TaskListView({ tasks, showProject, hiddenStatuses = [], onTaskClick, onStatusUpdate, onAddTask }: {
  tasks: Task[]; showProject: boolean; hiddenStatuses?: TaskStatusKey[];
  onTaskClick?: (task: Task) => void;
  onStatusUpdate?: (taskId: string, status: TaskStatusKey) => void;
  onAddTask?: (status: TaskStatusKey, title?: string) => void;
}) {
  return (
    <div className="tk-list">
      {TASK_STATUSES.filter(status => !hiddenStatuses.includes(status)).map(status => (
        <Group key={status} status={status} tasks={tasks.filter(task => task.statusKey === status)} showProject={showProject}
          onTaskClick={onTaskClick} onStatusUpdate={onStatusUpdate} onAddTask={onAddTask} />
      ))}
    </div>
  );
}
