import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "./kanbanboard";
import { DueChip, TaskAvatar } from "./TaskBits";
import { STATUS_I18N, TASK_STATUSES, statusToneClass, type TaskStatusKey } from "./task-ui";
import type { CustomFieldDefinition } from "@/hooks/usecustomfields";
import { compareFieldValues, type FormatContext } from "@/features/custom-fields/field-values";
import { FieldCell, useTaskFieldValues } from "@/features/custom-fields/TaskFields";

/** Custom field columns of the list, and how to show and edit them. */
export type FieldColumns = { fields: CustomFieldDefinition[]; context: FormatContext; canEdit: boolean };
type Sort = { fieldId: string; direction: 1 | -1 } | null;

function FieldCells({ task, columns }: { task: Task; columns: FieldColumns }) {
  const { values, save } = useTaskFieldValues(task.id, task.customFields);
  return (
    <>
      {columns.fields.map(field => (
        <td key={field.id} className="max-w-[220px]">
          <FieldCell field={field} value={values[field.id]} context={columns.context} canEdit={columns.canEdit} onSave={value => save(field.id, value)} />
        </td>
      ))}
    </>
  );
}

function SortHeader({ field, sort, onSort }: { field: CustomFieldDefinition; sort: Sort; onSort: (fieldId: string) => void }) {
  const { t } = useTranslation();
  const active = sort?.fieldId === field.id;
  return (
    <th scope="col" aria-sort={active ? (sort!.direction === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" className="inline-flex items-center gap-1 font-[inherit]" onClick={() => onSort(field.id)} aria-label={t("customFields.sortBy", { field: field.name })}>
        {field.name}
        {active && (sort!.direction === 1 ? <ArrowUp className="size-3" aria-hidden="true" /> : <ArrowDown className="size-3" aria-hidden="true" />)}
      </button>
    </th>
  );
}

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

function Group({ status, tasks, showProject, fieldColumns, sort, onSort, onTaskClick, onStatusUpdate, onAddTask }: {
  status: TaskStatusKey; tasks: Task[]; showProject: boolean; fieldColumns?: FieldColumns; sort: Sort; onSort: (fieldId: string) => void;
  onTaskClick?: (task: Task) => void;
  onStatusUpdate?: (taskId: string, status: TaskStatusKey) => void;
  onAddTask?: (status: TaskStatusKey, title?: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(tasks.length > 0);
  const [showAll, setShowAll] = useState(status !== "completed");
  const name = t(STATUS_I18N[status]);
  const visible = showAll ? tasks : tasks.slice(0, PAGE);
  const columns = (showProject ? 5 : 4) + (fieldColumns?.fields.length ?? 0);

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
                  {fieldColumns?.fields.map(field => <SortHeader key={field.id} field={field} sort={sort} onSort={onSort} />)}
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
                    {fieldColumns && <FieldCells task={task} columns={fieldColumns} />}
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

export function TaskListView({ tasks, showProject, hiddenStatuses = [], fieldColumns, onTaskClick, onStatusUpdate, onAddTask }: {
  tasks: Task[]; showProject: boolean; hiddenStatuses?: TaskStatusKey[]; fieldColumns?: FieldColumns;
  onTaskClick?: (task: Task) => void;
  onStatusUpdate?: (taskId: string, status: TaskStatusKey) => void;
  onAddTask?: (status: TaskStatusKey, title?: string) => void;
}) {
  const [sort, setSort] = useState<Sort>(null);
  // Click once ascending, twice descending, a third time back to the normal order.
  const onSort = (fieldId: string) => setSort(current => (current?.fieldId !== fieldId ? { fieldId, direction: 1 } : current.direction === 1 ? { fieldId, direction: -1 } : null));
  const sortField = sort && fieldColumns?.fields.find(field => field.id === sort.fieldId);
  const ordered = sortField
    ? [...tasks].sort((a, b) => {
      const result = compareFieldValues(sortField, a.customFields?.[sortField.id], b.customFields?.[sortField.id], fieldColumns!.context);
      // Empty values stay last in both directions.
      const aEmpty = a.customFields?.[sortField.id] == null, bEmpty = b.customFields?.[sortField.id] == null;
      return aEmpty !== bEmpty ? result : result * sort!.direction;
    })
    : tasks;
  return (
    <div className="tk-list">
      {TASK_STATUSES.filter(status => !hiddenStatuses.includes(status)).map(status => (
        <Group key={status} status={status} tasks={ordered.filter(task => task.statusKey === status)} showProject={showProject}
          fieldColumns={fieldColumns} sort={sort} onSort={onSort}
          onTaskClick={onTaskClick} onStatusUpdate={onStatusUpdate} onAddTask={onAddTask} />
      ))}
    </div>
  );
}
