import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Square, X, Clock } from "lucide-react";
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

  const { data: projects } = useFetchProjects();
  const { data: tasks } = useFetchTasks();
  const { data: activeTimeEntries } = useActiveTimeEntries();

  const startTaskMutation = useStartTask();
  const endTaskMutation = useEndTask();

  const activeTimeEntry = activeTimeEntries?.data?.[0];
  const isTracking = !!activeTimeEntry;

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

  const filteredTasks =
    tasks?.data?.filter((task) => task.projectId === selectedProject) || [];

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

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    if (selectedProject) {
      setSelectedTask("");
    }
  }, [selectedProject]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 size-14 z-50 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full p-0 border-2 border-gray-200 hover:border-blue-500 group"
        aria-label="Open timer"
      >
        <Clock className="size-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
      </Button>

      {open && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          
          <Box className="fixed bottom-20 right-6 z-50 bg-white rounded-2xl shadow-2xl w-[420px] max-sm:w-[calc(100vw-2rem)] border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-white" />
                <h2 className="text-base font-semibold text-white">Time Tracker</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-8 flex items-center justify-center hover:bg-white/20 text-white rounded-full transition-colors"
                aria-label="Close"
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Active Status */}
              {isTracking && activeTimeEntry && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-3">
                  <div className="size-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="text-green-900 font-medium truncate">{activeTimeEntry.taskTitle}</p>
                    <p className="text-green-700 text-xs truncate">{activeTimeEntry.projectName}</p>
                  </div>
                </div>
              )}

              <Stack className="gap-3">
                {/* Selects */}
                <Select
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                  disabled={isTracking}
                >
                  <SelectTrigger className={`h-11 rounded-xl border-2 text-sm ${
                    isTracking ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-blue-400'
                  }`}>
                    {selectedProject
                      ? projects?.data?.find((p) => p.id === selectedProject)?.projectName || "Select Project"
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

                <Select
                  value={selectedTask}
                  onValueChange={setSelectedTask}
                  disabled={isTracking || !selectedProject}
                >
                  <SelectTrigger className={`h-11 rounded-xl border-2 text-sm ${
                    isTracking || !selectedProject ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-blue-400'
                  }`}>
                    {selectedTask
                      ? filteredTasks.find((t) => t.id === selectedTask)?.title || "Select Task"
                      : !selectedProject ? "Select project first" : "Select Task"}
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedActivityType}
                  onValueChange={setSelectedActivityType}
                  disabled={isTracking}
                >
                  <SelectTrigger className={`h-11 rounded-xl border-2 text-sm ${
                    isTracking ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-blue-400'
                  }`}>
                    {selectedActivityType === "meeting" ? "Meeting" : selectedActivityType === "agenda" ? "Agenda" : "Activity Type"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="agenda">Agenda</SelectItem>
                  </SelectContent>
                </Select>

                {/* Timer & Button */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 text-center">
                    <div className="text-3xl font-mono font-bold text-blue-600">
                      {formatTime(elapsedTime)}
                    </div>
                  </div>

                  {isTracking ? (
                    <Button
                      type="button"
                      className="h-[62px] px-6 rounded-xl bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
                      onClick={handleStop}
                      disabled={endTaskMutation.isPending}
                    >
                      <Square className="size-4 fill-white" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="h-[62px] px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      onClick={handleStart}
                      disabled={!selectedTask || startTaskMutation.isPending}
                    >
                      <Play className="size-4 fill-white" />
                    </Button>
                  )}
                </div>
              </Stack>
            </div>
          </Box>
        </>
      )}
    </>
  );
}