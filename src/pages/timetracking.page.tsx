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

  // Build taskOptions (role-aware) before filtering
  // Filter tasks based on selected project (role-aware)
  const filteredTasks = useMemo(
    () => (isViewer ? viewerTasks?.data : orgTasks?.data) || [],
    [isViewer, viewerTasks?.data, orgTasks?.data]
  );

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
            <span className="px-2 py-1 mx-auto block bg-green-100 text-green-800 text-xs font-medium rounded-full w-20 text-center capitalize">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 mx-auto block bg-gray-100 text-gray-800 text-xs font-medium rounded-full w-20 text-center capitalize">
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
          <Flex className="justify-center gap-2 px-2 py-2">
            {row.original.status === "completed" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestart(row.original.taskId)}
                disabled={isTracking || startTaskMutation.isPending}
                className="h-8 px-2 hover:bg-blue-50 cursor-pointer"
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
              className="h-8 px-2 hover:bg-red-50 cursor-pointer"
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
    <Stack className="pt-5 gap-6 px-2">
      {/* Header */}
      <Box className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <Flex className="items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-600 mt-1">
              Track your work hours and manage time efficiently
            </p>
          </div>
          <Center className="w-16 h-16 bg-blue-100 rounded-full">
            <Clock className="w-8 h-8 text-blue-600" />
          </Center>
        </Flex>
      </Box>

      {/* Stats Cards */}
      <Flex className="gap-4">
        <Box className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <Flex className="items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Weekly Hours
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {formatHours(weeklyHours?.data?.weeklyHours || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">This week</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </Flex>
        </Box>

        <Box className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <Flex className="items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Active Tracking
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {isTracking ? "Yes" : "No"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isTracking ? "Currently tracking" : "Not tracking"}
              </p>
            </div>
            <Play className="w-8 h-8 text-green-600" />
          </Flex>
        </Box>
      </Flex>

      {/* Time Tracking Controls */}
      <Box className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Time Tracking
        </h2>

        {/* Show active tracking info with real-time timer */}
        {isTracking && activeTimeEntry && (
          <Box className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
            <Flex className="items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <Flex className="items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-bold text-green-800 text-lg">
                    Currently Tracking
                  </h3>
                </Flex>
                <Stack className="gap-2">
                  <p className="text-green-700">
                    <strong>Task:</strong> {activeTimeEntry.taskTitle}
                  </p>
                  <p className="text-green-700">
                    <strong>Project:</strong> {activeTimeEntry.projectName}
                  </p>
                  <p className="text-green-700">
                    <strong>Started at:</strong>{" "}
                    {format(new Date(activeTimeEntry.startTime), "PPpp")}
                  </p>
                  <p className="text-green-700 text-sm">
                    Started{" "}
                    {formatDistanceToNow(new Date(activeTimeEntry.startTime))}{" "}
                    ago
                  </p>
                </Stack>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Box className="bg-white border-2 border-green-400 rounded-lg p-4 text-center min-w-[200px]">
                  <p className="text-sm text-gray-600 mb-2">Elapsed Time</p>
                  <span className="text-4xl font-mono font-bold text-green-600">
                    {formatTime(elapsedTime)}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">Running...</p>
                </Box>
                <Button
                  onClick={handleStop}
                  disabled={endTaskMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 cursor-pointer"
                >
                  <Square className="w-4 h-4 mr-2" />
                  {endTaskMutation.isPending ? "Stopping..." : "Stop Tracking"}
                </Button>
              </div>
            </Flex>
          </Box>
        )}

        {/* Project and Task Selection */}
        <Flex className="gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <Select
              value={selectedProject}
              onValueChange={(value) => setSelectedProject(value)}
              disabled={isTracking}
            >
              <SelectTrigger className="w-full">
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

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task
            </label>
            <Select
              value={selectedTask}
              onValueChange={(value) => setSelectedTask(value)}
              disabled={isTracking || !selectedProject}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Task" />
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
            {startTaskMutation.isPending ? "Starting..." : "Start Tracking"}
          </Button>
        )}
      </Box>

      {/* Time Entries History */}
      <Box className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Time Entries History
        </h2>

        {/* Filters */}
        <Flex className="gap-4 mb-4 flex-wrap">
          <div className="min-w-[220px]">
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
              <SelectTrigger className="w-full">
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

          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task
            </label>
            <Select
              value={historyTask}
              onValueChange={(v) => setHistoryTask(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={"All Tasks"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_tasks">All Tasks</SelectItem>
                {historyTasksOptions.map((t) => (
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
                Clear
              </Button>
              <Button
                className="cursor-pointer"
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

        <Box className="">
          {(() => {
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
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{message}</p>
                <p className="text-sm text-gray-400 mt-1">
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
