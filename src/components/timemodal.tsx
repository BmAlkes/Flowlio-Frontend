import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Square, X, Clock } from "lucide-react";
import { Box } from "./ui/box";
import { Stack } from "./ui/stack";
import { Flex } from "./ui/flex";
import { Center } from "./ui/center";
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

  // Data
  const { data: projects } = useFetchProjects();
  const { data: tasks } = useFetchTasks();
  const { data: activeTimeEntries } = useActiveTimeEntries();

  // Mutations
  const startTaskMutation = useStartTask();
  const endTaskMutation = useEndTask();

  // Active entry (assumindo só um ativo por vez)
  const activeTimeEntry = activeTimeEntries?.data?.[0];
  const isTracking = !!activeTimeEntry;

  // Timer (segundos)
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!activeTimeEntry || !isTracking) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeTimeEntry.startTime);

    const updateElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000
      );
      setElapsedTime(elapsed);
    };

    updateElapsed();
    const intervalId = setInterval(updateElapsed, 1000);

    return () => clearInterval(intervalId);
  }, [activeTimeEntry, isTracking]);

  // Filtrar tasks por projeto selecionado
  const filteredTasks = useMemo(
    () =>
      tasks?.data?.filter((task: any) => task.projectId === selectedProject) ||
      [],
    [tasks, selectedProject]
  );

  // Resetar Task quando muda projeto
  useEffect(() => {
    setSelectedTask("");
  }, [selectedProject]);

  // Util: formatar tempo HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Start
  const handleStart = async () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    if (!selectedTask) {
      toast.error("Please select a task to track");
      return;
    }

    // Se quiser obrigar o tipo de atividade, descomenta:
    // if (!selectedActivityType) {
    //   toast.error("Please select an activity type");
    //   return;
    // }

    if (isTracking) {
      toast.error("You are already tracking a task");
      return;
    }

    try {
      // Se seu hook aceitar objeto, mude isso para { taskId: selectedTask, activityType: selectedActivityType }
      await startTaskMutation.mutateAsync(selectedTask);
      toast.success("Time tracking started");
    } catch (error) {
      console.error("Failed to start task:", error);
      toast.error("Failed to start tracking");
    }
  };

  // Stop
  const handleStop = async () => {
    if (!activeTimeEntry) {
      toast.error("No active time tracking found");
      return;
    }

    try {
      await endTaskMutation.mutateAsync(activeTimeEntry.taskId);
      toast.success("Time tracking stopped");
    } catch (error) {
      console.error("Failed to stop task:", error);
      toast.error("Failed to stop tracking");
    }
  };

  return (
    <>
      {/* FAB – botão flutuante de abrir o modal */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-white shadow-lg border border-gray-200 hover:border-blue-500 hover:shadow-xl flex items-center justify-center p-0"
        style={{ outline: "none" }}
        aria-label="Open time tracker"
      >
        <Clock className="size-6 text-gray-700" />
      </Button>

      {/* Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />

          <Box className="fixed bottom-20 right-6 z-50 w-[420px] max-sm:w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-white" />
                <h2 className="text-base font-semibold text-white">
                  Time Tracker
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-8 flex items-center justify-center hover:bg-white/20 text-white rounded-full transition-colors"
                aria-label="Close time tracker"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-[#F5F5F5]">
              <Stack className="gap-4">
                {/* Banner de tracking ativo */}
                {isTracking && activeTimeEntry && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="size-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    <div className="text-sm flex-1 min-w-0">
                      <p className="text-green-900 font-medium truncate">
                        {activeTimeEntry.taskTitle}
                      </p>
                      <p className="text-green-700 text-xs truncate">
                        {activeTimeEntry.projectName}
                      </p>
                      <p className="text-green-600 text-xs">
                        Started at{" "}
                        {new Date(
                          activeTimeEntry.startTime
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Selects */}
                <Stack className="gap-3">
                  {/* Project */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Project<span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                      disabled={isTracking}
                    >
                      <SelectTrigger
                        className={`h-11 rounded-xl border-2 text-sm ${
                          isTracking
                            ? "bg-gray-50 opacity-60 cursor-not-allowed"
                            : "bg-white hover:border-blue-400"
                        }`}
                      >
                        {selectedProject
                          ? projects?.data?.find(
                              (p: any) => p.id === selectedProject
                            )?.projectName || "Select Project"
                          : "Select Project"}
                      </SelectTrigger>
                      <SelectContent>
                        {projects?.data?.map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectName}
                            {project.projectNumber &&
                              ` (${project.projectNumber})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Task */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Task<span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedTask}
                      onValueChange={setSelectedTask}
                      disabled={isTracking || !selectedProject}
                    >
                      <SelectTrigger
                        className={`h-11 rounded-xl border-2 text-sm ${
                          isTracking || !selectedProject
                            ? "bg-gray-50 opacity-60 cursor-not-allowed"
                            : "bg-white hover:border-blue-400"
                        }`}
                      >
                        {selectedTask
                          ? filteredTasks.find(
                              (t: any) => t.id === selectedTask
                            )?.title || "Select Task"
                          : !selectedProject
                          ? "Select project first"
                          : "Select Task"}
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

                  {/* Activity type */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      Activity Type
                    </label>
                    <Select
                      value={selectedActivityType}
                      onValueChange={setSelectedActivityType}
                      disabled={isTracking}
                    >
                      <SelectTrigger
                        className={`h-11 rounded-xl border-2 text-sm ${
                          isTracking
                            ? "bg-gray-50 opacity-60 cursor-not-allowed"
                            : "bg-white hover:border-blue-400"
                        }`}
                      >
                        {selectedActivityType === "meeting"
                          ? "Meeting"
                          : selectedActivityType === "agenda"
                          ? "Agenda"
                          : "Select activity type (optional)"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Stack>

                {/* Timer + Botão */}
                <Flex className="items-center gap-3 mt-2">
                  {/* Timer */}
                  <Box className="flex-1">
                    <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-center">
                      <div className="text-3xl font-mono font-bold text-blue-600">
                        {formatTime(elapsedTime)}
                      </div>
                      {isTracking && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tracking in progress...
                        </p>
                      )}
                    </div>
                  </Box>

                  {/* Start / Stop */}
                  {isTracking ? (
                    <Button
                      type="button"
                      className="h-[62px] px-6 rounded-xl bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transition-all text-white flex items-center justify-center gap-2"
                      onClick={handleStop}
                      disabled={endTaskMutation.isPending}
                    >
                      <Square className="size-4 fill-white" />
                      {endTaskMutation.isPending ? "Stopping..." : "Stop"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="h-[62px] px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      onClick={handleStart}
                      disabled={!selectedTask || startTaskMutation.isPending}
                    >
                      <Center className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                        <Play className="size-3 fill-white" />
                      </Center>
                      {startTaskMutation.isPending ? "Starting..." : "Start"}
                    </Button>
                  )}
                </Flex>
              </Stack>
            </div>
          </Box>
        </>
      )}
    </>
  );
}