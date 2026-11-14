import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CheckCircle2, ChevronDown, CirclePlus, KanbanSquare, List, Search } from "lucide-react";
import { PageWrapper } from "../common/pagewrapper";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CustomDropdown, CustomDropdownItem } from "../ui/custom-dropdown";
import { KanbanSkeleton } from "@/components/skeletons";
import { useFetchTasks } from "@/hooks/usefetchtasks";
import { useFetchOrganizationUsers } from "@/hooks/usefetchorganizationusers";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useFetchCustomFields } from "@/hooks/usecustomfields";
import { useUpdateTaskStatus } from "@/hooks/useupdatetask";
import { cn } from "@/lib/utils";
import KanbanBoard, { type Task } from "./kanbanboard";
import { TaskListView } from "./TaskListView";
import { TaskStats } from "./TaskBits";
import { TaskDetailsModal } from "./taskdetailsmodal";
import { STATUS_LABEL, TASK_STATUSES, matchesStat, toStatusKey, type TaskStatFilter, type TaskStatusKey } from "./task-ui";
import "@/components/leads/leads-layout.css";
import "./tasks-layout.css";

export const TaskManagementHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "list" ? "list" : "board";

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [stat, setStat] = useState<TaskStatFilter>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const orgTasks = useFetchTasks();
  const orgUsers = useFetchOrganizationUsers();
  const orgProjects = useFetchProjects();
  const { data: customFieldsData } = useFetchCustomFields("project");
  const updateTaskStatus = useUpdateTaskStatus();
  const isLoading = orgTasks.isLoading || orgProjects.isLoading;

  const users = orgUsers.data?.data?.userMembers || [];
  const projects = orgProjects.data?.data || [];

  // Memoized so the board keeps its optimistic moves until new data arrives.
  const tasks = useMemo<Task[]>(() => {
    const realTasks = orgTasks.data?.data || [];
    const projectList = orgProjects.data?.data || [];
    const members = orgUsers.data?.data?.userMembers || [];
    return realTasks.map(task => {
      const statusKey = toStatusKey(task.status);
      const assignee = members.find(u => (u.user?.id === task.assigneeId || u.id === task.assigneeId) && u.user?.name);
      const children = realTasks.filter(child => child.parentId === task.id);
      return {
        id: task.id,
        title: task.title,
        project: task.projectName || t("taskManagement.unknownProject"),
        projectId: task.projectId,
        dueDate: task.endDate ? format(new Date(task.endDate), "dd MMM, yyyy") : t("taskManagement.noDueDate"),
        endDate: task.endDate ?? null,
        status: STATUS_LABEL[statusKey],
        statusKey,
        comments: [],
        description: task.description,
        assigneeId: task.assigneeId,
        assigneeName: assignee?.user?.name || task.assigneeName,
        assigneeImage: task.assigneeImage,
        creatorName: task.creatorName,
        attachments: task.attachments,
        parentId: task.parentId,
        parentTitle: task.parentId ? realTasks.find(rt => rt.id === task.parentId)?.title : undefined,
        subtasks: children.length ? { done: children.filter(c => c.status === "completed").length, total: children.length } : undefined,
        startAfter: task.startAfter ?? undefined,
        finishBefore: task.finishBefore ?? undefined,
        projectCustomFields: projectList.find(p => p.id === task.projectId)?.customFields,
      };
    });
  }, [orgTasks.data, orgProjects.data, orgUsers.data, t]);

  // Project, assignee and search scope everything, the summary cards included.
  const scoped = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter(task =>
      (!query || task.title.toLowerCase().includes(query) || task.project.toLowerCase().includes(query)) &&
      (selectedUsers.length === 0 || selectedUsers.includes(task.assigneeId || "")) &&
      (selectedProjects.length === 0 || selectedProjects.includes(task.projectId || "")));
  }, [tasks, search, selectedUsers, selectedProjects]);
  const visible = useMemo(() => {
    const now = new Date();
    return scoped.filter(task => matchesStat(task, stat, now));
  }, [scoped, stat]);

  // A stat card shows only the columns it can contain.
  const hiddenStatuses: TaskStatusKey[] = stat === "completed" ? TASK_STATUSES.filter(s => s !== "completed")
    : hideCompleted || stat ? ["completed"] : [];
  const showProject = selectedProjects.length !== 1;
  const filtersOn = Boolean(search || selectedUsers.length || selectedProjects.length || stat || hideCompleted);

  const toggle = (setter: typeof setSelectedUsers, id: string) =>
    setter(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const clearFilters = () => { setSearch(""); setSelectedUsers([]); setSelectedProjects([]); setStat(null); setHideCompleted(false); };
  const setView = (next: "board" | "list") => setParams(prev => {
    const out = new URLSearchParams(prev);
    if (next === "list") out.set("view", "list"); else out.delete("view");
    return out;
  }, { replace: true });

  const handleStatusUpdate = (taskId: string, status: TaskStatusKey) => updateTaskStatus.mutate({ taskId, status });
  // The create form takes the project (when one is selected) and a typed title.
  const handleAddTask = (_status?: TaskStatusKey, title?: string) => {
    const query = new URLSearchParams();
    if (selectedProjects.length === 1) query.set("projectId", selectedProjects[0]);
    if (title) query.set("title", title);
    const qs = query.toString();
    navigate(`/dashboard/task-management/create-task${qs ? `?${qs}` : ""}`);
  };

  const projectLabel = selectedProjects.length === 0 ? t("tasksLayout.allProjects")
    : selectedProjects.length === 1 ? projects.find(p => p.id === selectedProjects[0])?.projectName || t("tasksLayout.allProjects")
    : t("tasksLayout.nProjects", { count: selectedProjects.length });
  const userName = (id: string) => {
    const user = users.find(u => (u.user?.id || u.id) === id);
    return user?.user?.name || `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim();
  };
  const usersLabel = selectedUsers.length === 0 ? t("tasksLayout.assignees")
    : selectedUsers.length === 1 ? userName(selectedUsers[0]) || t("tasksLayout.assignees")
    : t("tasksLayout.nAssignees", { count: selectedUsers.length });

  return (
    <PageWrapper className="mt-6 p-4 tasks-workspace">
      <div className="flex flex-col gap-5 py-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl max-sm:text-xl font-medium">{t("tasksLayout.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("tasksLayout.description")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="ld-view-toggle" role="group" aria-label={t("tasksLayout.view")}>
              <Button variant="ghost" size="sm" aria-pressed={view === "board"} onClick={() => setView("board")}>
                <KanbanSquare aria-hidden="true" className="size-4" />{t("tasksLayout.board")}
              </Button>
              <Button variant="ghost" size="sm" aria-pressed={view === "list"} onClick={() => setView("list")}>
                <List aria-hidden="true" className="size-4" />{t("tasksLayout.list")}
              </Button>
            </div>
            <Button className="ld-primary h-11 px-5" onClick={() => handleAddTask()}>
              <CirclePlus aria-hidden="true" className="size-5" />{t("tasksLayout.newTask")}
            </Button>
          </div>
        </div>

        <TaskStats tasks={scoped} active={stat} onSelect={setStat} />

        <div className="ld-toolbar">
          <label className="ld-search">
            <span className="sr-only">{t("tasksLayout.searchLabel")}</span>
            <Search aria-hidden="true" className="size-4" />
            <Input type="search" value={search} placeholder={t("tasksLayout.search")} onChange={e => setSearch(e.target.value)} />
          </label>
          <CustomDropdown align="end" className="w-64" trigger={
            <Button variant="outline" aria-haspopup="dialog" className="h-10 gap-2 max-w-[260px]">
              <span className="text-muted-foreground">{t("tasksLayout.project")}</span>
              <strong className="font-semibold truncate">{projectLabel}</strong>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
            </Button>
          }>
            <CustomDropdownItem checked={selectedProjects.length === 0} onClick={() => setSelectedProjects([])}>
              {t("taskManagement.allProjects")}
            </CustomDropdownItem>
            {projects.map(project => (
              <CustomDropdownItem key={project.id} checked={selectedProjects.includes(project.id)} onClick={() => toggle(setSelectedProjects, project.id)}>
                <span className="truncate">{project.projectName}</span>
              </CustomDropdownItem>
            ))}
          </CustomDropdown>
          <CustomDropdown align="end" className="w-60" trigger={
            <Button variant="outline" aria-haspopup="dialog" className="h-10 gap-2 max-w-[220px]">
              <span className="truncate">{usersLabel}</span>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
            </Button>
          }>
            <CustomDropdownItem checked={selectedUsers.length === 0} onClick={() => setSelectedUsers([])}>
              {t("tasksLayout.allAssignees")}
            </CustomDropdownItem>
            {users.map(user => (
              <CustomDropdownItem key={user.id} checked={selectedUsers.includes(user.user?.id || user.id)} onClick={() => toggle(setSelectedUsers, user.user?.id || user.id)}>
                {user.user?.name || `${user.firstname} ${user.lastname}`.trim()}
              </CustomDropdownItem>
            ))}
          </CustomDropdown>
          <Button variant="outline" className={cn("h-10 gap-2", hideCompleted && "border-[var(--ld-ink)] text-[var(--ld-ink)]")}
            aria-pressed={hideCompleted} onClick={() => setHideCompleted(value => !value)}>
            <CheckCircle2 aria-hidden="true" className="size-4" />{t("tasksLayout.hideCompleted")}
          </Button>
        </div>

        {isLoading ? (
          <KanbanSkeleton columns={5} cardsPerColumn={3} />
        ) : filtersOn && visible.length === 0 ? (
          <div className="tk-empty">
            {t("tasksLayout.empty")}
            <Button variant="outline" size="sm" onClick={clearFilters}>{t("tasksLayout.clearFilters")}</Button>
          </div>
        ) : view === "list" ? (
          <TaskListView tasks={visible} showProject={showProject} hiddenStatuses={hiddenStatuses}
            onTaskClick={setSelectedTask} onStatusUpdate={handleStatusUpdate} onAddTask={handleAddTask} />
        ) : (
          <KanbanBoard tasks={visible} showProject={showProject} hiddenStatuses={hiddenStatuses}
            onStatusUpdate={handleStatusUpdate} onTaskClick={setSelectedTask} onAddTask={handleAddTask}
            projectCustomFieldsData={customFieldsData?.data} />
        )}
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description,
            project: selectedTask.project,
            projectId: selectedTask.projectId,
            dueDate: selectedTask.dueDate,
            status: selectedTask.status,
            assigneeName: selectedTask.assigneeName,
            assigneeImage: selectedTask.assigneeImage,
            creatorName: selectedTask.creatorName,
            attachments: selectedTask.attachments,
            parentId: selectedTask.parentId,
            parentTitle: selectedTask.parentTitle,
            startAfter: selectedTask.startAfter,
            finishBefore: selectedTask.finishBefore,
          }}
          allTasks={tasks}
          onOpenTask={taskId => setSelectedTask(tasks.find(x => x.id === taskId) ?? null)}
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </PageWrapper>
  );
};
