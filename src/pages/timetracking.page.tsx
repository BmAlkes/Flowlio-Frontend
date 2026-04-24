import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
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
    <span className="text-lg font-mono font-bold text-green-600">
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
          <span className="font-semibold px-2 py-2 text-left block">#</span>
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
          <span className="font-semibold px-2 py-2 text-left block">
            {t("timeTracking.project")}
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-medium px-2 py-2 text-left block">
            {row.original.projectName}
          </span>
        ),
      },
      {
        accessorKey: "taskTitle",
        header: () => (
          <span className="font-semibold px-2 py-2 text-left block">{t("timeTracking.task")}</span>
        ),
        cell: ({ row }) => (
          <span className="font-medium px-2 py-2 text-left block">
            {row.original.taskTitle}
          </span>
        ),
      },
      {
        accessorKey: "startTime",
        header: () => (
          <span className="font-semibold px-2 py-2 text-left block">
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
          <span className="font-semibold px-2 py-2 text-left block">
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
          <span className="font-semibold px-2 py-2 text-left block">
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
            <span className="px-2 py-1 mx-auto block bg-green-100 text-green-800 text-xs font-medium rounded-full w-20 text-center capitalize">
              {t("timeTracking.active")}
            </span>
          ) : (
            <span className="px-2 py-1 mx-auto block bg-muted text-gray-800 text-xs font-medium rounded-full w-20 text-center capitalize">
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
    <Stack className="pt-5 gap-6 px-2">
      {/* Header */}
      <Box className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <Flex className="items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("timeTracking.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("timeTracking.subtitle")}
            </p>
          </div>
          <Center className="w-16 h-16 bg-blue-100 rounded-full">
            <Clock className="w-8 h-8 text-blue-600" />
          </Center>
        </Flex>
      </Box>
 
      {/* Stats Cards */}
      <Flex className="gap-4">
        {loading && !weeklyHours ? (
          <>
            <CardSkeleton className="flex-1" />
            <CardSkeleton className="flex-1" />
          </>
        ) : (
          <>
            <Box className="flex-1 bg-card rounded-xl p-6 shadow-sm border border-border">
              <Flex className="items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("timeTracking.weeklyHours")}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {formatHours(weeklyHours?.data?.weeklyHours || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{t("timeTracking.thisWeek")}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </Flex>
            </Box>
 
            <Box className="flex-1 bg-card rounded-xl p-6 shadow-sm border border-border">
              <Flex className="items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("timeTracking.activeTracking")}
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {isTracking ? t("timeTracking.yes") : t("timeTracking.no")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isTracking ? t("timeTracking.currentlyTracking") : t("timeTracking.notTracking")}
                  </p>
                </div>
                <Play className="w-8 h-8 text-green-600" />
              </Flex>
            </Box>
          </>
        )}
      </Flex>

      {/* Time Tracking Controls */}
      <Box className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          {t("timeTracking.quickTimeTracking")}
        </h2>

        {/* Show active tracking info with real-time timer */}
        {isTracking && activeTimeEntry && (
          <Box className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
            <Flex className="items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <Flex className="items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-bold text-green-800 text-lg">
                    {t("timeTracking.currentlyTrackingHeader")}
                  </h3>
                </Flex>
                <Stack className="gap-2">
                  <p className="text-green-700">
                    <strong>{t("timeTracking.task")}:</strong> {activeTimeEntry.taskTitle}
                  </p>
                  <p className="text-green-700">
                    <strong>{t("timeTracking.project")}:</strong> {activeTimeEntry.projectName}
                  </p>
                  <p className="text-green-700">
                    <strong>{t("timeTracking.startedAt")}:</strong>{" "}
                    {format(new Date(activeTimeEntry.startTime), "PPpp")}
                  </p>
                  <p className="text-green-700 text-sm">
                    {t("timeTracking.started")}{" "}
                    {formatDistanceToNow(new Date(activeTimeEntry.startTime))}{" "}
                    {t("timeTracking.ago")}
                  </p>
                </Stack>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Box className="bg-card border-2 border-green-400 rounded-lg p-4 text-center min-w-[200px]">
                  <p className="text-sm text-muted-foreground mb-2">{t("timeTracking.elapsedTime")}</p>
                  <span className="text-4xl font-mono font-bold text-green-600">
                    {formatTime(elapsedTime)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">{t("timeTracking.running")}</p>
                </Box>
                <Button
                  onClick={handleStop}
                  disabled={endTaskMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 cursor-pointer"
                >
                  <Square className="w-4 h-4 mr-2" />
                  {endTaskMutation.isPending ? t("timeTracking.stopping") : t("timeTracking.stopTracking")}
                </Button>
              </div>
            </Flex>
          </Box>
        )}

        {/* Project and Task Selection */}
        <Flex className="gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
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

          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
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
        </Flex>

        {/* Start Button */}
        {!isTracking && (
          <Button
            onClick={handleStart}
            disabled={!selectedTask || startTaskMutation.isPending}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
          >
            <Play className="w-5 h-5 mr-2" />
            {startTaskMutation.isPending ? t("timeTracking.starting") : t("timeTracking.startTracking")}
          </Button>
        )}
      </Box>

      {/* Time Entries History */}
      <Box className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          {t("timeTracking.history")}
        </h2>

        {/* Filters */}
        <Flex className="gap-4 mb-4 flex-wrap">
          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-foreground mb-2">
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

          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-foreground mb-2">
              Task
            </label>
            <Select
              value={historyTask}
              onValueChange={(v) => setHistoryTask(v)}
            >
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

          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-foreground mb-2">
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

          <div className="self-end ml-auto">
            <Flex className="gap-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setHistoryProject("all");
                  setHistoryTask("all_tasks");
                  setHistoryStatus("all");
                }}
              >
                {t("timeTracking.clear")}
              </Button>
              <Button
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
          </div>
        </Flex>

        <Box className="">
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

            // Empty state with messaging tailored to filters
            const hasAnyFilter =
              appliedProject !== "all" ||
              appliedTask !== "all_tasks" ||
              (appliedStatus !== "all" && appliedStatus !== "");

            let message = "No time entries found";
            if (hasAnyFilter) {
              if (appliedStatus === "active")
                message = "No active time entries";
              else if (appliedStatus === "completed")
                message = "No completed time entries";
              else message = "No entries available for the selected filters";
            }

            return (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start tracking time to see your entries here
                </p>
              </div>
            );
          })()}
        </Box>
      </Box>
    </Stack>
  );
};

export default TimeTrackingPage;
