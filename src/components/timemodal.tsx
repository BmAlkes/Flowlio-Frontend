import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Square, X, Clock, Info } from "lucide-react";
// import { Center } from "./ui/center";
// import { Flex } from "./ui/flex";
import { Stack } from "./ui/stack";
import { Box } from "./ui/box";
import { toast } from "sonner";
import { useFetchProjects } from "@/hooks/usefetchprojects";
import { useFetchTasks } from "@/hooks/usefetchtasks";
import {
  useActiveTimeEntries,
  useStartTask,
  useEndTask,
} from "@/hooks/useTimeTracking";

export default function TimeModal() {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("");

  // Fetch data for regular users
  const { data: projects } = useFetchProjects();
  const { data: tasks } = useFetchTasks();
  const { data: activeTimeEntries } = useActiveTimeEntries();

  // Mutations for time tracking
  const startTaskMutation = useStartTask();
  const endTaskMutation = useEndTask();

  // Get current active time entry
  const activeTimeEntry = activeTimeEntries?.data?.[0];
  const isTracking = !!activeTimeEntry;

  // Calculate elapsed time for active tracking
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (activeTimeEntry && isTracking) {
      const startTime = new Date(activeTimeEntry.startTime);

      const updateElapsed = () => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000
        );
        setElapsedTime(elapsed);
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [activeTimeEntry, isTracking]);

  // Filter tasks based on selected project
  const filteredTasks =
    tasks?.data?.filter((task) => task.projectId === selectedProject) || [];

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

  // Format timer as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Reset task selection when project changes
  useEffect(() => {
    if (selectedProject) {
      setSelectedTask("");
    }
  }, [selectedProject]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 size-14 z-50 bg-white shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 rounded-full p-0 group"
        aria-label="Open timer"
      >
        <Clock className="size-7 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />
          
          <Stack className="fixed bottom-6 right-6 z-50 items-end pointer-events-none gap-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Box className="bg-white rounded-3xl shadow-2xl w-[650px] max-lg:w-[500px] max-sm:w-[360px] max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-hidden pointer-events-auto relative border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="size-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Time Tracker</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="size-9 flex items-center justify-center hover:bg-white/20 text-white rounded-full transition-colors"
                  aria-label="Close timer"
                  type="button"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-8 max-sm:p-6 bg-gray-50">
                {/* Active Tracking Banner */}
                {isTracking && activeTimeEntry && (
                  <Box className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 mb-8 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <div className="size-3 rounded-full bg-white" />
                      </div>
                      <Stack className="gap-2 flex-1">
                        <h3 className="font-semibold text-green-900 text-lg">
                          Currently Tracking
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p className="text-green-800">
                            <span className="font-medium">Task:</span> {activeTimeEntry.taskTitle}
                          </p>
                          <p className="text-green-800">
                            <span className="font-medium">Project:</span> {activeTimeEntry.projectName}
                          </p>
                          <p className="text-green-700">
                            <span className="font-medium">Started:</span>{" "}
                            {new Date(activeTimeEntry.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </Stack>
                    </div>
                  </Box>
                )}

                <Stack className="gap-6">
                  {/* Project Selection */}
                  <Stack className="gap-2.5">
                    <label className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      Project<span className="text-red-500">*</span>
                      {isTracking && (
                        <span className="text-xs text-gray-500 font-normal flex items-center gap-1">
                          <Info className="size-3" />
                          Locked during tracking
                        </span>
                      )}
                    </label>
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                      disabled={isTracking}
                    >
                      <SelectTrigger className={`rounded-xl h-12 w-full border-2 transition-all ${
                        isTracking 
                          ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                          : 'bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500'
                      }`}>
                        {selectedProject
                          ? projects?.data?.find((p) => p.id === selectedProject)
                              ?.projectName || "Select Project"
                          : "Select Project"}
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.data?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectName} ({project.projectNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Stack>

                  {/* Task Selection */}
                  <Stack className="gap-2.5">
                    <label className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      Task<span className="text-red-500">*</span>
                      {isTracking && (
                        <span className="text-xs text-gray-500 font-normal flex items-center gap-1">
                          <Info className="size-3" />
                          Locked during tracking
                        </span>
                      )}
                    </label>
                    <Select
                      value={selectedTask}
                      onValueChange={setSelectedTask}
                      disabled={isTracking || !selectedProject}
                    >
                      <SelectTrigger className={`rounded-xl h-12 w-full border-2 transition-all ${
                        isTracking || !selectedProject
                          ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                          : 'bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500'
                      }`}>
                        {selectedTask
                          ? filteredTasks.find((t) => t.id === selectedTask)
                              ?.title || "Select Task"
                          : !selectedProject 
                            ? "Select a project first"
                            : "Select Task"}
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTasks.length > 0 ? (
                          filteredTasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-6 text-center text-sm text-gray-500">
                            No tasks available for this project
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </Stack>

                  {/* Activity Type Selection */}
                  <Stack className="gap-2.5">
                    <label className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      Activity Type<span className="text-red-500">*</span>
                      {isTracking && (
                        <span className="text-xs text-gray-500 font-normal flex items-center gap-1">
                          <Info className="size-3" />
                          Locked during tracking
                        </span>
                      )}
                    </label>
                    <Select
                      value={selectedActivityType}
                      onValueChange={setSelectedActivityType}
                      disabled={isTracking}
                    >
                      <SelectTrigger className={`rounded-xl h-12 w-full border-2 transition-all ${
                        isTracking 
                          ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' 
                          : 'bg-white border-gray-300 hover:border-blue-400 focus:border-blue-500'
                      }`}>
                        {selectedActivityType === "meeting"
                          ? "Meeting"
                          : selectedActivityType === "agenda"
                          ? "Agenda"
                          : "Select Activity Type"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                      </SelectContent>
                    </Select>
                  </Stack>

                  {/* Timer and Action Section */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <Stack className="gap-4">
                      {/* Timer Display */}
                      <Box className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 text-center shadow-sm">
                        <label className="font-medium text-gray-700 text-sm block mb-3">
                          {isTracking ? "Elapsed Time" : "Ready to Track"}
                        </label>
                        <div className="text-5xl max-sm:text-4xl font-mono font-bold text-blue-600 tracking-tight">
                          {formatTime(elapsedTime)}
                        </div>
                        {isTracking && (
                          <p className="text-sm text-blue-600 mt-3 font-medium animate-pulse">
                            • Tracking in progress
                          </p>
                        )}
                      </Box>

                      {/* Action Button */}
                      {isTracking ? (
                        <Button
                          type="button"
                          className="w-full rounded-xl h-14 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          onClick={handleStop}
                          disabled={endTaskMutation.isPending}
                        >
                          <span className="flex items-center justify-center gap-3">
                            <Square className="size-5 fill-white" />
                            {endTaskMutation.isPending ? "Stopping..." : "Stop Tracking"}
                          </span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="w-full rounded-xl h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          onClick={handleStart}
                          disabled={!selectedTask || startTaskMutation.isPending}
                        >
                          <span className="flex items-center justify-center gap-3">
                            <div className="size-6 rounded-full border-2 border-white flex items-center justify-center">
                              <Play className="size-3 fill-white ml-0.5" />
                            </div>
                            {startTaskMutation.isPending ? "Starting..." : "Start Tracking"}
                          </span>
                        </Button>
                      )}
                    </Stack>
                  </div>
                </Stack>
              </div>
            </Box>
          </Stack>
        </>
      )}
    </>
  );
}