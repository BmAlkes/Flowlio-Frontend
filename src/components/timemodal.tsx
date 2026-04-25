import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Square, X, Clock3 } from "lucide-react";
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

  const { data: projects } = useFetchProjects();
  const { data: tasksForProject } = useFetchTasks(
    { projectId: selectedProject },
    { enabled: !!selectedProject }
  );

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
    }

    setElapsedTime(0);
  }, [activeTimeEntry, isTracking]);

  const filteredTasks = useMemo(
    () => tasksForProject?.data ?? [],
    [tasksForProject?.data]
  );

  useEffect(() => {
    if (selectedProject) {
      setSelectedTask("");
    }
  }, [selectedProject]);

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

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6 z-50 size-14 rounded-full p-0
          bg-[#0f172a] border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]
          hover:bg-[#111827] hover:scale-105 transition-all duration-300
        "
        aria-label="Open timer"
      >
        <img src="/dashboard/clock.svg" className="size-7" alt="clock" />
      </Button>

      {open && (
        <Stack className="fixed bottom-6 right-6 z-50 items-end pointer-events-none">
          <Box
            className="
              pointer-events-auto relative overflow-hidden
              w-[720px] max-lg:w-[520px] max-sm:w-[calc(100vw-32px)]
              rounded-[28px]
              border border-white/20
              bg-white/80 backdrop-blur-2xl
              shadow-[0_30px_100px_rgba(15,23,42,0.28)]
            "
          >
            <Box className="absolute inset-0 bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/70" />
            <Box className="absolute -top-24 -right-24 size-56 rounded-full bg-blue-400/20 blur-3xl" />
            <Box className="absolute -bottom-24 -left-24 size-56 rounded-full bg-emerald-400/20 blur-3xl" />

            <button
              onClick={() => setOpen(false)}
              className="
                absolute top-5 right-5 z-20 size-9 rounded-full
                bg-white/70 border border-slate-200 text-slate-500
                hover:bg-red-500 hover:text-white hover:border-red-500
                transition-all duration-300 flex items-center justify-center cursor-pointer
              "
              aria-label="Close timer"
              type="button"
            >
              <X className="size-4" />
            </button>

            <form className="relative z-10 flex flex-col gap-6 p-6 max-sm:p-4">
              <Flex className="items-center gap-4 pr-10">
                <Center className="size-12 rounded-2xl bg-slate-950 text-white shadow-lg">
                  <Clock3 className="size-6" />
                </Center>

                <Stack className="gap-1">
                  <h2 className="text-xl font-bold text-slate-950">
                    Time Tracking
                  </h2>
                  <p className="text-sm text-slate-500">
                    Track work time by project, task and activity type.
                  </p>
                </Stack>
              </Flex>

              {isTracking && activeTimeEntry && (
                <Box
                  className="
                    rounded-2xl border border-emerald-300/60
                    bg-emerald-50/80 p-4 shadow-sm
                  "
                >
                  <Stack className="gap-2">
                    <Flex className="items-center gap-2">
                      <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="font-semibold text-emerald-900">
                        Currently Tracking
                      </h3>
                    </Flex>

                    <p className="text-sm text-emerald-800">
                      <strong>Task:</strong> {activeTimeEntry.taskTitle}
                    </p>

                    <p className="text-sm text-emerald-800">
                      <strong>Project:</strong> {activeTimeEntry.projectName}
                    </p>

                    <p className="text-sm text-emerald-800">
                      <strong>Started:</strong>{" "}
                      {new Date(activeTimeEntry.startTime).toLocaleTimeString()}
                    </p>
                  </Stack>
                </Box>
              )}

              <Flex className="flex-row max-sm:flex-col gap-4 w-full">
                <Stack className="flex-1 max-sm:w-full gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Project <span className="text-red-500">*</span>
                  </label>

                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                    disabled={isTracking}
                  >
                    <SelectTrigger
                      className="
                        h-13 w-full rounded-2xl border border-slate-200
                        bg-white/80 px-4 text-slate-700 shadow-sm
                        focus:ring-2 focus:ring-slate-950/10
                      "
                    >
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
                  <label className="text-sm font-semibold text-slate-700">
                    Task <span className="text-red-500">*</span>
                  </label>

                  <Select
                    value={selectedTask}
                    onValueChange={setSelectedTask}
                    disabled={isTracking || !selectedProject}
                  >
                    <SelectTrigger
                      className="
                        h-13 w-full rounded-2xl border border-slate-200
                        bg-white/80 px-4 text-slate-700 shadow-sm
                        focus:ring-2 focus:ring-slate-950/10
                      "
                    >
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
                  <label className="text-sm font-semibold text-slate-700">
                    Activity Type <span className="text-red-500">*</span>
                  </label>

                  <Select
                    value={selectedActivityType}
                    onValueChange={setSelectedActivityType}
                    disabled={isTracking}
                  >
                    <SelectTrigger
                      className="
                        h-13 w-full rounded-2xl border border-slate-200
                        bg-white/80 px-4 text-slate-700 shadow-sm
                        focus:ring-2 focus:ring-slate-950/10
                      "
                    >
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

              <Flex
                className="
                  items-end justify-between gap-5 max-sm:flex-col max-sm:items-stretch
                  rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-sm
                "
              >
                <Stack className="gap-2 flex-1">
                  <label className="text-sm font-semibold text-slate-700">
                    {isTracking ? "Elapsed Time" : "Timer"}
                  </label>

                  <Box
                    className="
                      rounded-2xl border border-slate-200 bg-slate-950
                      px-5 py-4 text-center shadow-inner
                    "
                  >
                    <span className="font-mono text-4xl max-sm:text-3xl font-bold tracking-wider text-white">
                      {formatTime(elapsedTime)}
                    </span>

                    {isTracking && (
                      <p className="mt-2 text-xs text-emerald-300">
                        Tracking in progress...
                      </p>
                    )}
                  </Box>
                </Stack>

                {isTracking ? (
                  <Button
                    type="button"
                    onClick={handleStop}
                    disabled={endTaskMutation.isPending}
                    className="
                      h-14 rounded-2xl px-7 text-base font-semibold
                      bg-red-500 text-white shadow-lg shadow-red-500/20
                      hover:bg-red-600 hover:-translate-y-0.5
                      transition-all duration-300 max-sm:w-full
                    "
                  >
                    <span className="flex items-center gap-2">
                      <Square className="size-4 fill-white" />
                      {endTaskMutation.isPending ? "Stopping..." : "Stop"}
                    </span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleStart}
                    disabled={!selectedTask || startTaskMutation.isPending}
                    className="
                      h-14 rounded-2xl px-8 text-base font-semibold
                      bg-emerald-500 text-white shadow-lg shadow-emerald-500/25
                      hover:bg-emerald-600 hover:-translate-y-0.5
                      disabled:opacity-50 disabled:hover:translate-y-0
                      transition-all duration-300 max-sm:w-full
                    "
                  >
                    <span className="flex items-center gap-2">
                      <Center className="size-6 rounded-full border-2 border-white/80">
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