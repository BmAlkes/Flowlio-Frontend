import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { Center } from "./ui/center";
import { Flex } from "./ui/flex";
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
        className="fixed bottom-6 right-6 size-11 z-50 bg-transparent border-none p-0 hover:bg-transparent cursor-pointer"
        style={{ outline: "none" }}
        aria-label="Open timer"
      >
        <img src="/dashboard/clock.svg" className="size-11" alt="clock" />
      </Button>

      {open && (
        <Stack className="fixed bottom-6 right-6 z-50 items-end pointer-events-none gap-0">
          <Box className="bg-white rounded-2xl shadow-xl w-[700px] max-lg:w-[500px] max-sm:w-[300px] max-w-full max-h-[90vh] p-0 pointer-events-auto relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 size-8 hover:text-gray-700 text-xl cursor-pointer bg-red-400 text-white rounded-full pb-1"
              aria-label="Close timer"
              type="button"
            >
              x
            </button>
            <form className="flex flex-col gap-6 h-full bg-[#F5F5F5] rounded-2xl p-6">
              {/* Show active tracking info if tracking */}
              {isTracking && activeTimeEntry && (
                <Box className="bg-green-100 border border-green-300 rounded-lg p-4">
                  <Stack className="gap-2">
                    <h3 className="font-semibold text-green-800">
                      Currently Tracking:
                    </h3>
                    <p className="text-green-700">
                      <strong>Task:</strong> {activeTimeEntry.taskTitle}
                    </p>
                    <p className="text-green-700">
                      <strong>Project:</strong> {activeTimeEntry.projectName}
                    </p>
                    <p className="text-green-700">
                      <strong>Started:</strong>{" "}
                      {new Date(activeTimeEntry.startTime).toLocaleTimeString()}
                    </p>
                  </Stack>
                </Box>
              )}

              <Flex className="flex-row max-sm:flex-col gap-2 w-full justify-between">
                <Stack className="flex-1 max-sm:w-full gap-2">
                  <label className="font-medium">
                    Project<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                    disabled={isTracking}
                  >
                    <SelectTrigger className="rounded-full h-14 w-full py-6 border-none">
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

                <Stack className="flex-1 max-sm:w-full gap-2">
                  <label className="font-medium">
                    Task<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedTask}
                    onValueChange={setSelectedTask}
                    disabled={isTracking || !selectedProject}
                  >
                    <SelectTrigger className="rounded-full h-14 w-full py-6 border-none">
                      {selectedTask
                        ? filteredTasks.find((t) => t.id === selectedTask)
                            ?.title || "Select Task"
                        : "Select Task"}
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Stack>

                <Stack className="flex-1 max-sm:w-full gap-2">
                  <label className="font-medium">
                    Activity Type<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedActivityType}
                    onValueChange={setSelectedActivityType}
                    disabled={isTracking}
                  >
                    <SelectTrigger className="rounded-full h-14 w-full py-6 border-none">
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
              </Flex>
              <Flex className="items-center justify-between max-sm:flex-col gap-4 mt-4">
                {/* Timer Display */}
                <Box className="flex-1">
                  <Stack className="gap-2">
                    <label className="font-medium text-gray-700">
                      {isTracking ? "Elapsed Time" : "Timer"}
                    </label>
                    <Box className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                      <span className="text-3xl font-mono font-bold text-blue-600">
                        {formatTime(elapsedTime)}
                      </span>
                      {isTracking && (
                        <p className="text-sm text-gray-500 mt-1">
                          Tracking in progress...
                        </p>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {isTracking ? (
                  <Button
                    type="button"
                    className="cursor-pointer rounded-full px-6 py-4 h-14 text-lg max-sm:text-sm bg-red-500 hover:bg-red-600"
                    onClick={handleStop}
                    disabled={endTaskMutation.isPending}
                  >
                    <span className="flex items-center gap-2">
                      <Square className="size-4 fill-white" />
                      {endTaskMutation.isPending ? "Stopping..." : "Stop"}
                    </span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="cursor-pointer rounded-full px-8 py-4 max-sm:px-4 max-sm:py-2 h-14 text-lg bg-[#47C363] hover:bg-[#47C363]/80"
                    onClick={handleStart}
                    disabled={!selectedTask || startTaskMutation.isPending}
                  >
                    <span className="flex items-center gap-2">
                      <Center
                        className="w-5 h-5 rounded-full border-2 border-white flex-shrink-0"
                        style={{
                          background: isTracking ? "#22c55e" : "transparent",
                        }}
                      >
                        <Play className="size-3 fill-white" />
                      </Center>
                      {startTaskMutation.isPending ? "Starting..." : "Start"}
                    </span>
                  </Button>
                )}
              </Flex>
            </form>
          </Box>
        </Stack>
      )}
    </>
  );
}
