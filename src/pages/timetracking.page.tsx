import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  Clock,
  Play,
  Square,
  BarChart3,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  useActiveTimeEntries,
  useStartTask,
  useEndTask,
  useDeleteTimeEntry,
} from "@/hooks/useTimeTracking";
import { useAllTimeEntries } from "@/hooks/useAllTimeEntries";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useFetchTasks } from "@/hooks/usefetchtasks";
import { useFetchViewerProjects } from "@/hooks/useFetchViewerProjects";
import { useFetchViewerTasks } from "@/hooks/useFetchViewerTasks";
import { useLocation } from "react-router";
import { useFetchOrganizationWeeklyHoursTracked } from "@/hooks/useFetchOrganizationWeeklyHoursTracked";
import { formatHours, formatDuration } from "@/utils/timeFormat";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton, CardSkeleton, ErrorState } from "@/components/skeletons";
import { useTranslation } from "react-i18next";

// Active Timer Component for table cells
const ActiveTableTimer = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      return Math.floor((now - start) / 1000);
    };

    setElapsed(calculateElapsed());
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  };

  return (
    <span className="text-sm font-mono font-semibold tabular-nums text-foreground">
      {formatTime(elapsed)}
    </span>
  );
};

const TimeTrackingPage = () => {
  const { t } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  // History filters for custom table
  // Pending (UI) filter state
  const [historyProject, setHistoryProject] = useState<string>("all");
  const [historyTask, setHistoryTask] = useState<string>("all_tasks");
  const [historyStatus, setHistoryStatus] = useState<
    "active" | "completed" | "" | "all"
  >("all");
  // Applied filter state (used by table)
  const [appliedProject, setAppliedProject] = useState<string>("all");
  const [appliedTask, setAppliedTask] = useState<string>("all_tasks");
  const [appliedStatus, setAppliedStatus] = useState<
    "active" | "completed" | "" | "all"
  >("all");

  // Fetch data for regular users
  const { pathname } = useLocation();
  const isViewer = pathname.startsWith("/viewer");
  
  const { data: orgProjects, isLoading: projectsLoading, isFetching: projectsFetching } = useFetchProjects();
  const { data: orgTasks, isLoading: tasksLoading, isFetching: tasksFetching } = useFetchTasks();
  const { data: orgTasksForProject } = useFetchTasks(
    { projectId: selectedProject },
    { enabled: !isViewer && !!selectedProject }
  );
  const { data: viewerProjects, isLoading: viewerProjectsLoading, isFetching: viewerProjectsFetching } = useFetchViewerProjects();
  const { data: viewerTasks, isLoading: viewerTasksLoading, isFetching: viewerTasksFetching } = useFetchViewerTasks();
  
  const { 
    data: activeTimeEntries, 
    isLoading: activeLoading, 
    isFetching: activeFetching,
    error: activeError,
    refetch: refetchActive 
  } = useActiveTimeEntries();
  
  const { 
    data: allTimeEntries, 
    isLoading: allLoading, 
    isFetching: allFetching,
    error: allError,
    refetch: refetchAll 
  } = useAllTimeEntries();
  
  const { 
    data: weeklyHours, 
    isLoading: weeklyLoading, 
    isFetching: weeklyFetching 
  } = useFetchOrganizationWeeklyHoursTracked();

  const loading = activeLoading || allLoading || projectsLoading || tasksLoading || weeklyLoading || 
                  activeFetching || allFetching || projectsFetching || tasksFetching || weeklyFetching ||
                  viewerProjectsLoading || viewerTasksLoading || viewerProjectsFetching || viewerTasksFetching;
  
  const hasError = activeError || allError;

  // Mutations
  const startTaskMutation = useStartTask();
  const endTaskMutation = useEndTask();
  const deleteEntryMutation = useDeleteTimeEntry();

  // Get current active time entry
  const activeTimeEntry = activeTimeEntries?.data?.[0];
  const isTracking = !!activeTimeEntry;

  // Real-time elapsed time state for active tracking
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second when tracking
  useEffect(() => {
    if (activeTimeEntry && isTracking) {
      const calculateElapsed = () => {
        const start = new Date(activeTimeEntry.startTime).getTime();
        const now = new Date().getTime();
        return Math.floor((now - start) / 1000); // seconds
      };

      // Calculate immediately
      setElapsedTime(calculateElapsed());

      // Update every second
      const interval = setInterval(() => {
        setElapsedTime(calculateElapsed());
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [activeTimeEntry, isTracking]);

  // Format time as h m s format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  };

  // Quick-tracking task list: org uses /tasks/all?projectId=…; viewer filters client-side (viewer API has no project filter)
  const filteredTasks = useMemo(() => {
    if (!selectedProject) return [];
    if (isViewer) {
      const all = viewerTasks?.data || [];
      return all.filter((task) => task.projectId === selectedProject);
    }
    return orgTasksForProject?.data ?? [];
  }, [isViewer, selectedProject, viewerTasks?.data, orgTasksForProject?.data]);

  useEffect(() => {
    setSelectedTask("");
  }, [selectedProject]);

  // Handle starting time tracking
  const handleStart = async () => {
    if (!selectedTask) {
      toast.error(t("timeTracking.selectTaskError"));
      return;
    }

    if (isTracking) {
      toast.error(t("timeTracking.alreadyTrackingError"));
      return;
    }

    try {
      await startTaskMutation.mutateAsync(selectedTask);
    } catch (error) {
      console.error("Failed to start task:", error);
    }
  };

  // Handle stopping time tracking
  const handleStop = async () => {
    if (!activeTimeEntry) {
      toast.error(t("timeTracking.noActiveTrackingError"));
      return;
    }

    try {
      await endTaskMutation.mutateAsync(activeTimeEntry.taskId);
    } catch (error) {
      console.error("Failed to stop task:", error);
    }
  };

  // Handle deleting time entry
  const handleDelete = async (entryId: string) => {
    if (!confirm(t("timeTracking.deleteConfirm"))) {
      return;
    }

    try {
      await deleteEntryMutation.mutateAsync(entryId);
    } catch (error) {
      console.error("Failed to delete time entry:", error);
    }
  };

  // Handle restarting task from history
  const handleRestart = async (taskId: string) => {
    if (isTracking) {
      toast.error(t("timeTracking.stopCurrentTaskError"));
      return;
    }

    try {
      await startTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error("Failed to restart task:", error);
    }
  };

  // Build options for dependent task filter list
  // Build project list per role
  const projectOptions = useMemo(
    () => (isViewer ? viewerProjects?.data : orgProjects?.data) || [],
    [isViewer, viewerProjects?.data, orgProjects?.data]
  );

  // Build task list per role
  const taskOptions = useMemo(
    () => (isViewer ? viewerTasks?.data : orgTasks?.data) || [],
    [isViewer, viewerTasks?.data, orgTasks?.data]
  );

  const historyTasksOptions = useMemo(() => taskOptions, [taskOptions]);

  type EntryRow = (
    typeof allTimeEntries extends { data: infer A } ? A : any
  ) extends Array<infer R>
    ? R
    : any;

  const columns: ColumnDef<EntryRow>[] = useMemo(
    () => [
      {
        id: "index",
        header: () => (
          <span className="font-semibold px-2 py-2 text-start block">#</span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground px-2 py-2 block">
            {row.index + 1}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "projectName",
        header: () => (
          <span className="font-semibold px-2 py-2 text-start block">
            {t("timeTracking.project")}
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-medium px-2 py-2 text-start block">
            {row.original.projectName}
          </span>
        ),
      },
      {
        accessorKey: "taskTitle",
        header: () => (
          <span className="font-semibold px-2 py-2 text-start block">{t("timeTracking.task")}</span>
        ),
        cell: ({ row }) => (
          <span className="font-medium px-2 py-2 text-start block">
            {row.original.taskTitle}
          </span>
        ),
      },
      {
        accessorKey: "startTime",
        header: () => (
          <span className="font-semibold px-2 py-2 text-start block">
            {t("timeTracking.startTime")}
          </span>
        ),
        cell: ({ row }) => {
          const d = new Date(row.original.startTime as any);
          const valid = !isNaN(d.getTime());
          return (
            <span className="text-sm text-muted-foreground px-2 py-2 block">
              {valid ? format(d, "PPp") : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "endTime",
        header: () => (
          <span className="font-semibold px-2 py-2 text-start block">
            {t("timeTracking.endTime")}
          </span>
        ),
        cell: ({ row }) => {
          const endVal = row.original.endTime as any;
          const d = endVal ? new Date(endVal) : null;
          const valid = d ? !isNaN(d.getTime()) : false;
          return (
            <span className="text-sm text-muted-foreground px-2 py-2 block">
              {valid ? format(d!, "PPp") : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "duration",
        header: () => (
          <span className="font-semibold px-2 py-2 text-start block">
            {t("timeTracking.duration")}
          </span>
        ),
        cell: ({ row }) =>
          row.original.status === "active" ? (
            <Box className="px-2 py-2 block">
              <ActiveTableTimer startTime={row.original.startTime as any} />
            </Box>
          ) : (
            <span className="font-mono font-semibold text-muted-foreground px-2 py-2 block">
              {formatDuration(
                typeof row.original.duration === "number"
                  ? (row.original.duration as any)
                  : 0
              )}
            </span>
          ),
      },
      {
        id: "filter_status",
        accessorFn: (row: any) =>
          row.status === "in_progress" ? "active" : row.status,
        header: () => null,
        cell: () => null,
        enableHiding: true,
        filterFn: (row, id, value) =>
          String(row.getValue(id) ?? "") === String(value),
      },
      {
        accessorKey: "status",
        header: () => (
          <span className="font-semibold px-2 py-2 text-center block">
            Status
          </span>
        ),
        cell: ({ row }) => {
          const normalized =
            row.original.status === "in_progress"
              ? "active"
              : row.original.status;
          return normalized === "active" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mx-auto text-xs font-medium rounded-full border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t("timeTracking.active")}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 mx-auto text-xs font-medium rounded-full border border-border bg-muted text-muted-foreground">
              {t("timeTracking.completed")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="font-semibold px-2 py-2 text-center block">
            {t("timeTracking.actions")}
          </span>
        ),
        cell: ({ row }) => (
          <Flex className="justify-center gap-2 px-2 py-2">
            {row.original.status === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestart(row.original.taskId)}
                disabled={isTracking || startTaskMutation.isPending}
                className="h-8 px-2 hover:bg-blue-50 cursor-pointer"
                title={t("timeTracking.restartTaskTooltip")}
              >
                <RotateCcw className="h-4 w-4 text-blue-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteEntryMutation.isPending}
              className="h-8 px-2 hover:bg-red-50 cursor-pointer"
              title={t("timeTracking.deleteEntryTooltip")}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </Flex>
        ),
      },
      {
        id: "filter_projectId",
        accessorFn: (row: any) => String(row.projectId ?? ""),
        header: () => null,
        cell: () => null,
        enableHiding: true,
        filterFn: (row, id, value) =>
          String(row.getValue(id) ?? "") === String(value),
      },
      {
        id: "filter_taskId",
        accessorFn: (row: any) => String(row.taskId ?? ""),
        header: () => null,
        cell: () => null,
        enableHiding: true,
        filterFn: (row, id, value) =>
          String(row.getValue(id) ?? "") === String(value),
      },
    ],
    [isTracking, startTaskMutation.isPending, deleteEntryMutation.isPending]
  );

  // Build columnFilters for table (default show all)
  const tableColumnFilters = useMemo(() => {
    const filters: { id: string; value: any }[] = [];
    if (appliedProject !== "all")
      filters.push({ id: "filter_projectId", value: appliedProject });
    if (appliedTask !== "all_tasks")
      filters.push({ id: "filter_taskId", value: appliedTask });
    if (appliedStatus !== "all" && appliedStatus !== "")
      filters.push({ id: "filter_status", value: appliedStatus });
    return filters;
  }, [appliedProject, appliedTask, appliedStatus]);

  return (
    <Stack className="pt-6 gap-6 px-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("timeTracking.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("timeTracking.subtitle")}
        </p>
      </div>

      {/* Stats */}
      <Flex className="gap-4">
        {loading && !weeklyHours ? (
          <>
            <CardSkeleton className="flex-1" />
            <CardSkeleton className="flex-1" />
          </>
        ) : (
          <>
            <Box className="flex-1 bg-card border border-border rounded-xl p-5">
              <Flex className="items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("timeTracking.weeklyHours")}
                </p>
              </Flex>
              <p className="text-3xl font-bold tabular-nums text-foreground">
                {formatHours(weeklyHours?.data?.weeklyHours || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{t("timeTracking.thisWeek")}</p>
            </Box>

            <Box className="flex-1 bg-card border border-border rounded-xl p-5">
              <Flex className="items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("timeTracking.activeTracking")}
                </p>
              </Flex>
              <Flex className="items-center gap-2">
                {isTracking && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                )}
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {isTracking ? t("timeTracking.yes") : t("timeTracking.no")}
                </p>
              </Flex>
              <p className="text-xs text-muted-foreground mt-1.5">
                {isTracking ? t("timeTracking.currentlyTracking") : t("timeTracking.notTracking")}
              </p>
            </Box>
          </>
        )}
      </Flex>

      {/* Tracking Controls */}
      <Box className="bg-card rounded-xl border border-border p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
          {t("timeTracking.quickTimeTracking")}
        </p>

        {/* Active tracking banner */}
        {isTracking && activeTimeEntry && (
          <Box className="rounded-lg border border-border bg-muted/40 p-5 mb-5">
            <Flex className="items-start justify-between gap-6 flex-wrap">
              <div>
                <Flex className="items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                    {t("timeTracking.currentlyTrackingHeader")}
                  </span>
                </Flex>
                <p className="font-semibold text-foreground">{activeTimeEntry.taskTitle}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{activeTimeEntry.projectName}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  {t("timeTracking.started")}{" "}
                  {formatDistanceToNow(new Date(activeTimeEntry.startTime))}{" "}
                  {t("timeTracking.ago")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-4">
                <p className="text-4xl font-mono font-bold tracking-tighter tabular-nums text-foreground">
                  {formatTime(elapsedTime)}
                </p>
                <Button
                  onClick={handleStop}
                  disabled={endTaskMutation.isPending}
                  variant="destructive"
                  size="sm"
                  className="cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 me-1.5" />
                  {endTaskMutation.isPending ? t("timeTracking.stopping") : t("timeTracking.stopTracking")}
                </Button>
              </div>
            </Flex>
          </Box>
        )}

        {/* Selects + Start */}
        <Flex className="gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Project
            </label>
            <Select
              value={selectedProject}
              onValueChange={(value) => setSelectedProject(value)}
              disabled={isTracking}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("timeTracking.selectProjectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.projectName || p.name}{" "}
                    {p.projectNumber ? `(${p.projectNumber})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Task
            </label>
            <Select
              value={selectedTask}
              onValueChange={(value) => setSelectedTask(value)}
              disabled={isTracking || !selectedProject}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("timeTracking.selectTaskPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {filteredTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isTracking && (
            <Button
              onClick={handleStart}
              disabled={!selectedTask || startTaskMutation.isPending}
              className="cursor-pointer"
            >
              <Play className="w-4 h-4 me-2" />
              {startTaskMutation.isPending ? t("timeTracking.starting") : t("timeTracking.startTracking")}
            </Button>
          )}
        </Flex>
      </Box>

      {/* History */}
      <Box className="bg-card rounded-xl border border-border p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
          {t("timeTracking.history")}
        </p>

        {/* Filters */}
        <Flex className="gap-3 mb-5 flex-wrap items-end">
          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Project
            </label>
            <Select
              value={historyProject}
              onValueChange={(v) => {
                setHistoryProject(v);
                setHistoryTask("all_tasks");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("timeTracking.allProjects")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("timeTracking.allProjects")}</SelectItem>
                {projectOptions.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.projectName || p.name}{" "}
                    {p.projectNumber ? `(${p.projectNumber})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Task
            </label>
            <Select value={historyTask} onValueChange={(v) => setHistoryTask(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("timeTracking.allTasks")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_tasks">{t("timeTracking.allTasks")}</SelectItem>
                {historyTasksOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              {t("timeTracking.status")}
            </label>
            <Select
              value={historyStatus}
              onValueChange={(v) => setHistoryStatus(v as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("timeTracking.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("timeTracking.allStatus")}</SelectItem>
                <SelectItem value="active">{t("timeTracking.active")}</SelectItem>
                <SelectItem value="completed">{t("timeTracking.completed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Flex className="gap-2 ms-auto">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer text-muted-foreground"
              onClick={() => {
                setHistoryProject("all");
                setHistoryTask("all_tasks");
                setHistoryStatus("all");
              }}
            >
              {t("timeTracking.clear")}
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setAppliedProject(historyProject);
                setAppliedTask(historyTask);
                setAppliedStatus(historyStatus as any);
              }}
            >
              {t("timeTracking.applyFilter")}
            </Button>
          </Flex>
        </Flex>

        {loading && !allTimeEntries ? (
          <TableSkeleton rows={5} />
        ) : hasError ? (
          <ErrorState
            title="Failed to load time entries"
            message="We encountered an issue fetching your history. Please try again."
            onRetry={() => {
              refetchAll();
              refetchActive();
            }}
          />
        ) : (() => {
          const filteredEntries = (
            (allTimeEntries?.data as any[]) || []
          ).filter((row: any) => {
            const matchProject =
              appliedProject === "all" ||
              String(row.projectId) === String(appliedProject);
            const matchTask =
              appliedTask === "all_tasks" ||
              String(row.taskId) === String(appliedTask);
            const normalizedStatus =
              row.status === "in_progress" ? "active" : row.status;
            const matchStatus =
              appliedStatus === "all" ||
              appliedStatus === "" ||
              String(normalizedStatus) === String(appliedStatus);
            return matchProject && matchTask && matchStatus;
          });

          if (filteredEntries.length > 0) {
            return (
              <div className="w-full overflow-x-auto">
                <ReusableTable
                  key={`${appliedProject}|${appliedTask}|${appliedStatus}`}
                  data={filteredEntries as any[]}
                  columns={columns as any}
                  enableGlobalFilter={true}
                  searchClassName="rounded-full"
                  filterClassName="rounded-full"
                  enablePaymentLinksCalender={false}
                  defaultColumnFilters={tableColumnFilters as any}
                  externalColumnFilters={tableColumnFilters as any}
                />
              </div>
            );
          }

          const hasAnyFilter =
            appliedProject !== "all" ||
            appliedTask !== "all_tasks" ||
            (appliedStatus !== "all" && appliedStatus !== "");

          let message = "No time entries found";
          if (hasAnyFilter) {
            if (appliedStatus === "active") message = "No active time entries";
            else if (appliedStatus === "completed") message = "No completed time entries";
            else message = "No entries available for the selected filters";
          }

          return (
            <div className="flex flex-col items-center py-12 gap-2">
              <Clock className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">{message}</p>
              <p className="text-xs text-muted-foreground/60">
                Start tracking time to see your entries here
              </p>
            </div>
          );
        })()}
      </Box>
    </Stack>
  );
};

export default TimeTrackingPage;
