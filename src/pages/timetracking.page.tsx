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
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");

  // History filters for custom table
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
  const { data: orgProjects } = useFetchProjects();
  const { data: orgTasks } = useFetchTasks();
  const { data: viewerProjects } = useFetchViewerProjects();
  const { data: viewerTasks } = useFetchViewerTasks();
  const { data: activeTimeEntries } = useActiveTimeEntries();
  const { data: allTimeEntries } = useAllTimeEntries();
  const { data: weeklyHours } = useFetchOrganizationWeeklyHoursTracked();

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

      setElapsedTime(calculateElapsed());
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

  // Tasks list (kept as you had; not changing business logic)
  const filteredTasks = useMemo(() => taskOptions || [], [taskOptions]);

  const historyTasksOptions = useMemo(() => taskOptions, [taskOptions]);

  // Handle starting time tracking
  const handleStart = async () => {
    if (!selectedTask) {
      toast.error("Please select a task to track");
      return;
    }

    if (isTracking) {
      toast.error("You are already tracking a task");
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
      toast.error("No active time tracking found");
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
    if (!confirm("Are you sure you want to delete this time entry?")) {
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
      toast.error("Please stop the current task before starting a new one");
      return;
    }

    try {
      await startTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error("Failed to restart task:", error);
    }
  };

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
          <span className="text-sm text-gray-600 px-2 py-2 block">
            {row.index + 1}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "projectName",
        header: () => (
          <span className="font-semibold px-2 py-2 text-left block">
            Project
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
          <span className="font-semibold px-2 py-2 text-left block">Task</span>
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
            Start Time
          </span>
        ),
        cell: ({ row }) => {
          const d = new Date(row.original.startTime as any);
          const valid = !isNaN(d.getTime());
          return (
            <span className="text-sm text-gray-600 px-2 py-2 block">
              {valid ? format(d, "PPp") : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "endTime",
        header: () => (
          <span className="font-semibold px-2 py-2 text-left block">
            End Time
          </span>
        ),
        cell: ({ row }) => {
          const endVal = row.original.endTime as any;
          const d = endVal ? new Date(endVal) : null;
          const valid = d ? !isNaN(d.getTime()) : false;
          return (
            <span className="text-sm text-gray-600 px-2 py-2 block">
              {valid ? format(d!, "PPp") : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "duration",
        header: () => (
          <span className="font-semibold px-2 py-2 text-left block">
            Duration
          </span>
        ),
        cell: ({ row }) =>
          row.original.status === "active" ? (
            <Box className="px-2 py-2 block">
              <ActiveTableTimer startTime={row.original.startTime as any} />
            </Box>
          ) : (
            <span className="font-mono font-semibold text-gray-700 px-2 py-2 block">
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
            <span className="px-2 py-1 mx-auto block bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200 w-20 text-center capitalize">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 mx-auto block bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-200 w-24 text-center capitalize">
              Completed
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="font-semibold px-2 py-2 text-center block">
            Actions
          </span>
        ),
        cell: ({ row }) => (
          <Flex className="justify-center gap-1 px-2 py-2">
            {row.original.status === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestart(row.original.taskId)}
                disabled={isTracking || startTaskMutation.isPending}
                className="h-9 px-2 rounded-xl hover:bg-blue-50 cursor-pointer"
                title="Restart this task"
              >
                <RotateCcw className="h-4 w-4 text-blue-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteEntryMutation.isPending}
              className="h-9 px-2 rounded-xl hover:bg-red-50 cursor-pointer"
              title="Delete this entry"
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
    <Box className="min-h-screen bg-gray-50">
      <Stack className="max-w-6xl mx-auto pt-6 pb-12 gap-6 px-4">
        {/* Header */}
        <Box className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Flex className="items-start justify-between gap-4">
            <div>
              <Flex className="items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Time Tracking
                </h1>

                <span
                  className={[
                    "text-xs font-semibold px-2.5 py-1 rounded-full border",
                    isTracking
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-700 border-gray-200",
                  ].join(" ")}
                >
                  {isTracking ? "Tracking" : "Idle"}
                </span>
              </Flex>

              <p className="text-gray-600 mt-2">
                Track your work hours and manage time efficiently.
              </p>
            </div>

            <Center className="w-12 h-12 bg-blue-50 rounded-2xl border border-blue-100">
              <Clock className="w-6 h-6 text-blue-600" />
            </Center>
          </Flex>
        </Box>

        {/* Stats Cards */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Flex className="items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Weekly Hours
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatHours(weeklyHours?.data?.weeklyHours || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">This week</p>
              </div>
              <Center className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </Center>
            </Flex>
          </Box>

          <Box className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Flex className="items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Tracking
                </p>
                <p className="text-3xl font-bold mt-2">
                  <span
                    className={isTracking ? "text-green-600" : "text-gray-900"}
                  >
                    {isTracking ? "Yes" : "No"}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isTracking ? "Currently tracking" : "Not tracking"}
                </p>
              </div>
              <Center className="w-10 h-10 rounded-xl bg-green-50 border border-green-100">
                <Play className="w-5 h-5 text-green-600" />
              </Center>
            </Flex>
          </Box>
        </Box>

        {/* Time Tracking Controls */}
        <Box className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Flex className="items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Quick Time Tracking
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select a project and task, then start tracking.
              </p>
            </div>

            <Box className="hidden md:block">
              <span className="text-xs text-gray-500">
                Your entries appear instantly in History
              </span>
            </Box>
          </Flex>

          {/* Active tracking banner */}
          {isTracking && activeTimeEntry && (
            <Box className="rounded-2xl p-6 mt-6 border border-green-200 bg-gradient-to-br from-green-50 to-white">
              <Flex className="items-start justify-between flex-wrap gap-6">
                <div className="min-w-[260px] flex-1">
                  <Flex className="items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    <h3 className="font-semibold text-gray-900">
                      Currently Tracking
                    </h3>
                  </Flex>

                  <Stack className="gap-1 mt-3 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Task:</span>{" "}
                      {activeTimeEntry.taskTitle}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Project:</span>{" "}
                      {activeTimeEntry.projectName}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Started at:</span>{" "}
                      {format(new Date(activeTimeEntry.startTime), "PPpp")}
                    </p>
                    <p className="text-gray-500">
                      Started{" "}
                      {formatDistanceToNow(new Date(activeTimeEntry.startTime))}{" "}
                      ago
                    </p>
                  </Stack>
                </div>

                <Box className="rounded-2xl border border-green-200 bg-white/70 backdrop-blur p-5 min-w-[240px]">
                  <p className="text-xs font-medium text-gray-500">Elapsed</p>
                  <p className="text-4xl font-mono font-bold text-green-600 mt-2">
                    {formatTime(elapsedTime)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Running…</p>

                  <Button
                    onClick={handleStop}
                    disabled={endTaskMutation.isPending}
                    className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    {endTaskMutation.isPending ? "Stopping..." : "Stop Tracking"}
                  </Button>
                </Box>
              </Flex>
            </Box>
          )}

          {/* When not tracking: 2-column layout with a small "tips" card */}
          {!isTracking ? (
            <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <Box className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
                <Flex className="gap-4 flex-wrap">
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project
                    </label>
                    <Select
                      value={selectedProject}
                      onValueChange={(value) => {
                        setSelectedProject(value);
                        setSelectedTask("");
                      }}
                    >
                      <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white">
                        <SelectValue placeholder="Select Project" />
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

                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task
                    </label>
                    <Select
                      value={selectedTask}
                      onValueChange={(value) => setSelectedTask(value)}
                      disabled={!selectedProject}
                    >
                      <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white">
                        <SelectValue placeholder="Select Task" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTasks.map((task: any) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Flex>

                <Button
                  onClick={handleStart}
                  disabled={!selectedTask || startTaskMutation.isPending}
                  className="w-full mt-5 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {startTaskMutation.isPending ? "Starting..." : "Start Tracking"}
                </Button>
              </Box>

              <Box className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Tips</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Pick a project first, then select a task. When you start
                  tracking, the entry will show up in History automatically.
                </p>

                <Box className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-700">
                    Use <span className="font-semibold">History filters</span>{" "}
                    to quickly find entries.
                  </p>
                </Box>
              </Box>
            </Box>
          ) : (
            // While tracking, keep selects visible but disabled (more compact)
            <Box className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
              <Flex className="gap-4 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <Select value={selectedProject} onValueChange={() => {}} disabled>
                    <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Tracking in progress" />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </div>

                <div className="flex-1 min-w-[240px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task
                  </label>
                  <Select value={selectedTask} onValueChange={() => {}} disabled>
                    <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Tracking in progress" />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                </div>
              </Flex>

              <p className="text-xs text-gray-500 mt-3">
                Stop the current tracking to start a new one.
              </p>
            </Box>
          )}
        </Box>

        {/* Time Entries History */}
        <Box className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Flex className="items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Time Entries History
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Filter entries by project, task and status.
              </p>
            </div>
          </Flex>

          {/* Filters toolbar */}
          <Box className="rounded-2xl border border-gray-100 bg-gray-50 p-4 mb-4">
            <Flex className="gap-4 flex-wrap items-end">
              <div className="min-w-[220px] flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <Select
                  value={historyProject}
                  onValueChange={(v) => {
                    setHistoryProject(v);
                    setHistoryTask("all_tasks");
                  }}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectOptions.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.projectName || p.name}{" "}
                        {p.projectNumber ? `(${p.projectNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[220px] flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task
                </label>
                <Select value={historyTask} onValueChange={(v) => setHistoryTask(v)}>
                  <SelectTrigger className="w-full h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder={"All Tasks"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_tasks">All Tasks</SelectItem>
                    {historyTasksOptions.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={historyStatus}
                  onValueChange={(v) => setHistoryStatus(v as any)}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto">
                <Flex className="gap-2">
                  <Button
                    variant="outline"
                    className="cursor-pointer rounded-xl bg-white"
                    onClick={() => {
                      setHistoryProject("all");
                      setHistoryTask("all_tasks");
                      setHistoryStatus("all");
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    className="cursor-pointer rounded-xl"
                    onClick={() => {
                      setAppliedProject(historyProject);
                      setAppliedTask(historyTask);
                      setAppliedStatus(historyStatus as any);
                    }}
                  >
                    Apply Filter
                  </Button>
                </Flex>
              </div>
            </Flex>
          </Box>

          <Box>
            {(() => {
              const filteredEntries = ((allTimeEntries?.data as any[]) || []).filter(
                (row: any) => {
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
                }
              );

              if (filteredEntries.length > 0) {
                return (
                  <Box className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="w-full overflow-x-auto bg-white">
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
                  </Box>
                );
              }

              const hasAnyFilter =
                appliedProject !== "all" ||
                appliedTask !== "all_tasks" ||
                (appliedStatus !== "all" && appliedStatus !== "");

              let message = "No time entries found";
              if (hasAnyFilter) {
                if (appliedStatus === "active") message = "No active time entries";
                else if (appliedStatus === "completed")
                  message = "No completed time entries";
                else message = "No entries available for the selected filters";
              }

              return (
                <Box className="rounded-2xl border border-gray-100 bg-gray-50 p-10">
                  <div className="text-center">
                    <Center className="w-14 h-14 rounded-2xl bg-white border border-gray-200 mx-auto">
                      <Clock className="w-7 h-7 text-gray-400" />
                    </Center>
                    <p className="text-gray-700 font-medium mt-4">{message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start tracking time to see your entries here.
                    </p>
                  </div>
                </Box>
              );
            })()}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default TimeTrackingPage;
