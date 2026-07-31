import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, Eye, File, FileText, Image, MessageCircle } from "lucide-react";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { ViewerTask } from "@/hooks/useFetchViewerTasks";
import { useUpdateTaskStatus } from "@/hooks/useupdatetask";
import {
  useStartTask,
  useEndTask,
  useActiveTimeEntries,
} from "@/hooks/useTimeTracking";
import { Checkbox } from "@radix-ui/react-checkbox";
import { useAllTimeEntries } from "@/hooks/useAllTimeEntries";
import { useFetchProjectComments } from "@/hooks/usefetchprojectcomments";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

export type Data = {
  id: string;
  projectId?: string;
  status:
    | "on going"
    | "completed"
    | "to do"
    | "in progress"
    | "delay"
    | "changes"
    | "updated";
  submittedby: string;
  project: string;
  task: string;
  duedate: string;
  description: string;
  timeSpent?: string;
  isActive?: boolean;
  startTime?: Date;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
};

interface MyTaskTableProps {
  filteredTasks?: ViewerTask[];
}

export const MyTaskTable = ({ filteredTasks }: MyTaskTableProps) => {
  const { t } = useTranslation();
  const updateTaskStatus = useUpdateTaskStatus();
  const startTaskMutation = useStartTask();
  const endTaskMutation = useEndTask();
  const { data: activeTimeEntries } = useActiveTimeEntries();
  const { data: allTimeEntries } = useAllTimeEntries();
  const modalProps = useGeneralModalDisclosure();
  const [selectedTask, setSelectedTask] = useState<Data | null>(null);
  const { data: commentsResponse } = useFetchProjectComments(selectedTask?.projectId ?? "");
  // removed live ticking: no need for useEffect

  // Convert ViewerTask to Data format
  const convertViewerTasksToData = (tasks: ViewerTask[]): Data[] => {
    const activeEntries = activeTimeEntries?.data || [];
    const entries = allTimeEntries?.data || [];
    // Team total: sum all users' time for the task

    return tasks.map((task) => {
      const activeEntry = activeEntries.find(
        (entry) => entry.taskId === task.id
      );
      const isActive = !!activeEntry;

      let timeSpent = "0h 0m";
      let startTime: Date | undefined;

      // Sum durations from DB for this task (only DB time)
      let totalSeconds = 0;
      for (const e of entries) {
        if (String(e.taskId) === String(task.id)) {
          if (typeof e.duration === "number") {
            // Backend provides duration in MINUTES → convert to seconds
            totalSeconds += Math.max(0, Math.floor(e.duration * 60));
          } else if (e.endTime && e.startTime) {
            const end = new Date(e.endTime).getTime();
            const startMs = new Date(e.startTime).getTime();
            if (!isNaN(end) && !isNaN(startMs) && end >= startMs) {
              totalSeconds += Math.floor((end - startMs) / 1000);
            }
          }
        }
      }

      // Do not add live time; only show persisted DB time
      if (activeEntry) {
        startTime = new Date(activeEntry.startTime);
      }

      // Format
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      timeSpent = `${hours}h ${minutes}m`;

      return {
        id: task.id,
        projectId: task.projectId,
        status: mapBackendStatusToFrontend(task.status),
        submittedby: task.creatorName,
        project: task.projectName,
        task: task.title,
        duedate: task.endDate
          ? new Date(task.endDate).toLocaleDateString()
          : t("common.noDueDate"),
        description: task.description || "",
        timeSpent,
        isActive,
        startTime,
        attachments: task.attachments || [],
      };
    });
  };

  // Map backend status to frontend status
  const mapBackendStatusToFrontend = (status: string): Data["status"] => {
    switch (status) {
      case "completed":
        return "completed";
      case "in_progress":
        return "in progress";
      case "todo":
        return "to do";
      case "updated":
        return "updated";
      case "delay":
        return "delay";
      case "changes":
        return "changes";
      default:
        return "to do";
    }
  };

  // Use filtered tasks if provided, otherwise use empty array
  const data = filteredTasks ? convertViewerTasksToData(filteredTasks) : [];

  // Time tracking functions
  const startTask = (taskId: string) => {
    startTaskMutation.mutate(taskId);
  };

  const endTask = (taskId: string) => {
    endTaskMutation.mutate(taskId);
  };

  // Handler to update status via API
  const handleStatusChange = (rowId: string, newStatus: Data["status"]) => {
    // Map frontend status to backend status
    const backendStatus = mapFrontendStatusToBackend(newStatus);

    updateTaskStatus.mutate({
      taskId: rowId,
      status: backendStatus as any,
    });
  };

  // Map frontend status to backend status
  const mapFrontendStatusToBackend = (status: Data["status"]): string => {
    switch (status) {
      case "completed":
        return "completed";
      case "in progress":
        return "in_progress";
      case "to do":
        return "todo";
      case "updated":
        return "updated";
      case "delay":
        return "delay";
      case "changes":
        return "changes";
      case "on going":
        return "in_progress"; // Map "on going" to "in_progress"
      default:
        return "todo";
    }
  };

  // Columns with status cell using handler
  const columns: ColumnDef<Data>[] = [
    {
      id: "select",
      header: () => <Box className="text-center text-foreground p-3">#</Box>,
      cell: ({ row }) => (
        <Box className="text-center px-2 py-3">0{row.index + 1}</Box>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "project",
      header: () => <Box className="text-foreground">{t("tasks.project")}</Box>,
      cell: ({ row }) => (
        <Box className="capitalize max-sm:w-full">
          {row.original.project.length > 28
            ? row.original.project.slice(0, 28) + "..."
            : row.original.project}
        </Box>
      ),
    },
    {
      accessorKey: "task",
      header: () => <Box className="text-foreground text-center">{t("tasks.taskName")}</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-center">{row.original.task}</Box>
      ),
    },
    {
      accessorKey: "duedate",
      header: () => <Box className="text-foreground text-center">{t("tasks.dueDate")}</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-center">
          {new Date(row.original.duedate)
            .toLocaleDateString("en-GB")
            .split("/")
            .join("-")}
        </Box>
      ),
    },
    {
      accessorKey: "submittedby",
      header: () => <Box className="text-foreground text-center">{t("support.sentBy")}</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-center">{row.original.submittedby}</Box>
      ),
    },
    {
      accessorKey: "timeSpent",
      header: () => <Box className="text-foreground text-center">{t("timeTracking.timeSpent")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`${
                row.original.isActive
                  ? "text-green-600 font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {row.original.timeSpent}
            </span>
            {row.original.isActive && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-green-500">● {t("timeTracking.active")}</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 border-red-200 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    endTask(row.original.id);
                  }}
                  disabled={endTaskMutation.isPending}
                >
                  {endTaskMutation.isPending ? "..." : t("timeTracking.stop")}
                </Button>
              </div>
            )}
          </div>
        </Box>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">{t("tasks.status")}</Box>,
      cell: ({ row }) => {
        const currentStatus = row.original.status;
        const normalizedStatus = currentStatus === "in progress" ? "in_progress" : currentStatus === "to do" ? "todo" : currentStatus;
        return (
          <Center>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Center className="bg-black text-white cursor-pointer hover:bg-black/80 hover:text-white rounded-full min-w-[140px] w-fit h-10 justify-between items-center overflow-hidden">
                  <h1 className="text-[14px] ps-4 pe-2 capitalize truncate whitespace-nowrap">
                    {t(`tasks.statusValue.${normalizedStatus}`)}
                  </h1>
                  <Center className="bg-[#3e3e3f] rounded-tr-full rounded-br-full h-10 w-10 shrink-0">
                    <ChevronDown className="size-4" />
                  </Center>
                </Center>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="p-3">
                {(
                  [
                    "on going",
                    "completed",
                    "to do",
                    "in progress",
                    "delay",
                    "changes",
                    "updated",
                  ] as Data["status"][]
                ).map((status) => {
                  const normalizedItemStatus = status === "in progress" ? "in_progress" : status === "to do" ? "todo" : status;
                  return (
                    <Flex
                      className="cursor-pointer p-2 hover:bg-muted rounded-md"
                      key={status}
                      onClick={() => handleStatusChange(row.original.id, status)}
                    >
                      <DropdownMenuCheckboxItem
                        checked={currentStatus === status}
                      >
                        <Checkbox checked={currentStatus === status} />
                      </DropdownMenuCheckboxItem>
                      <h1 className="text-foreground capitalize">
                        {t(`tasks.statusValue.${normalizedItemStatus}`)}
                      </h1>
                    </Flex>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </Center>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-foreground">{t("tasks.actions")}</Box>,
      cell: ({ row }) => {
        return (
          <Center
            className="space-x-2 underline text-blue-500 cursor-pointer"
            onClick={() => {
              setSelectedTask(row.original);
              modalProps.onOpenChange(true);
            }}
          >
            {t("projects.viewDetails")}
          </Center>
        );
      },
    },
  ];

  return (
    <>
      <ReusableTable
        data={data}
        columns={columns}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        searchClassName="rounded-full"
        filterClassName="rounded-full"
        enableGlobalFilter={false}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
        enableMyTaskTable={true}
      />

      <GeneralModal
        {...modalProps}
        contentProps={{ className: "max-w-2xl max-sm:w-full" }}
      >
        {selectedTask && (
          <Stack className="gap-4">
            {/* Task Header */}
            <Stack className="gap-2">
              <h1 className="text-sm font-normal text-muted-foreground">{t("tasks.project")}</h1>
              <h2 className="text-lg font-normal">{selectedTask.project}</h2>
            </Stack>

            {/* Task Details */}
            <Box className="bg-card/80 gap-6 grid grid-cols-1">
              {/* Task Title */}
              <Stack className="gap-2">
                <h1 className="text-sm font-normal text-muted-foreground">
                  {t("tasks.taskTitle")}
                </h1>
                <h2 className="text-lg font-normal">{selectedTask.task}</h2>
              </Stack>

              {/* Task Description */}
              {selectedTask.description && (
                <Stack className="gap-2">
                  <h1 className="text-sm font-normal text-muted-foreground">
                    {t("support.description")}
                  </h1>
                  <Box className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </Box>
                </Stack>
              )}

              {/* Attachments */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (() => {
                const imageAttachments = selectedTask.attachments.filter(a => a.type.startsWith("image/"));
                const fileAttachments = selectedTask.attachments.filter(a => !a.type.startsWith("image/"));
                const formatFileSize = (bytes: number) => {
                  if (bytes === 0) return "0 Bytes";
                  const k = 1024;
                  const sizes = ["Bytes", "KB", "MB", "GB"];
                  const i = Math.floor(Math.log(bytes) / Math.log(k));
                  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
                };
                const getFileIcon = (type: string) => {
                  if (type === "application/pdf") return <FileText className="w-4 h-4" />;
                  return <File className="w-4 h-4" />;
                };
                return (
                  <Stack className="gap-3">
                    {/* Image gallery */}
                    {imageAttachments.length > 0 && (
                      <Stack className="gap-2">
                        <h1 className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Images ({imageAttachments.length})
                        </h1>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {imageAttachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-muted cursor-pointer"
                              onClick={() => window.open(attachment.url, "_blank")}
                            >
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs truncate">{attachment.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Stack>
                    )}

                    {/* File attachments */}
                    {fileAttachments.length > 0 && (
                      <Stack className="gap-2">
                        <h1 className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                          <File className="w-4 h-4" />
                          Files ({fileAttachments.length})
                        </h1>
                        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {fileAttachments.map((attachment) => (
                            <Box
                              key={attachment.id}
                              className="bg-card rounded-lg p-3 border border-border hover:border-blue-300 transition-colors group"
                            >
                              <Flex className="gap-3 items-center">
                                <Center className="w-9 h-9 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                  {getFileIcon(attachment.type)}
                                </Center>
                                <Box className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground text-sm truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </Box>
                                <Flex className="gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-7 h-7 p-0 cursor-pointer"
                                    title="View"
                                    onClick={() => window.open(attachment.url, "_blank")}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-7 h-7 p-0 cursor-pointer"
                                    title="Download"
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = attachment.url;
                                      link.download = attachment.name;
                                      link.click();
                                    }}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </Button>
                                </Flex>
                              </Flex>
                            </Box>
                          ))}
                        </Box>
                      </Stack>
                    )}
                  </Stack>
                );
              })()}

              <hr className="border-border w-full" />

              {/* Task Details Grid */}
              <Center className="grid grid-cols-2 gap-4">
                <Stack className="bg-muted/60 border border-border w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-muted-foreground">{t("tasks.status")}</h1>
                  <h1 className="text-sm font-normal text-foreground capitalize">
                     {t(`tasks.statusValue.${selectedTask.status === "in progress" ? "in_progress" : selectedTask.status === "to do" ? "todo" : selectedTask.status}`)}
                  </h1>
                </Stack>

                <Stack className="bg-muted/60 border border-border w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-muted-foreground">
                    {t("tasks.dueDate")}
                  </h1>
                  <h1 className="text-sm font-normal text-foreground">
                    {selectedTask.duedate}
                  </h1>
                </Stack>

                <Stack className="bg-muted/60 border border-border w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-muted-foreground">
                    {t("support.sentBy")}
                  </h1>
                  <h1 className="text-sm font-normal text-foreground">
                    {selectedTask.submittedby}
                  </h1>
                </Stack>

                <Stack className="bg-muted/60 border border-border w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-muted-foreground">
                    {t("support.ticketId")}
                  </h1>
                  <h1 className="text-sm font-normal text-foreground">
                    {selectedTask.id.slice(0, 8)}...
                  </h1>
                </Stack>
              </Center>

              {/* Comments */}
              {commentsResponse?.data && commentsResponse.data.length > 0 && (
                <Stack className="gap-2">
                  <h1 className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Comments ({commentsResponse.data.length})
                  </h1>
                  <Stack className="gap-2 max-h-48 overflow-y-auto">
                    {commentsResponse.data.map((comment) => (
                      <Box key={comment.id} className="bg-muted/60 rounded-xl p-3">
                        <Flex className="gap-2 items-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0c89af] to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-foreground">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground ms-auto">
                            {format(new Date(comment.createdAt), "MMM d, yyyy · h:mm a")}
                          </span>
                        </Flex>
                        <p className="text-sm text-foreground leading-relaxed ps-8">{comment.content}</p>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* Time Tracking Status */}
              {selectedTask.isActive && (
                <Stack className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h1 className="text-sm font-medium text-green-800">
                    {t("timeTracking.taskIsActive")}
                  </h1>
                  <p className="text-sm text-green-600">
                    {t("timeTracking.startedAt")}: {selectedTask.startTime?.toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-green-600">
                    {t("timeTracking.timeSpent")}: {selectedTask.timeSpent}
                  </p>
                </Stack>
              )}

              {/* Action Buttons */}
              <Flex className="justify-end gap-3">
                  <Button
                    variant="outline"
                    className="bg-muted hover:bg-muted text-foreground border border-border font-normal rounded-full px-6 py-3 flex items-center gap-2 cursor-pointer"
                    onClick={() => modalProps.onOpenChange(false)}
                  >
                    {t("common.close")}
                  </Button>

                  {selectedTask.isActive ? (
                    <Button
                      variant="outline"
                      className="bg-red-500 hover:bg-red-600 text-white border border-red-500 rounded-full px-6 py-3 flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        endTask(selectedTask.id);
                        modalProps.onOpenChange(false);
                      }}
                      disabled={endTaskMutation.isPending}
                    >
                      {endTaskMutation.isPending ? t("common.ending") : t("timeTracking.stop")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-border rounded-full px-6 py-3 flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        startTask(selectedTask.id);
                        modalProps.onOpenChange(false);
                      }}
                      disabled={startTaskMutation.isPending}
                    >
                      {startTaskMutation.isPending ? t("common.starting") : t("timeTracking.start")}
                    </Button>
                  )}
              </Flex>
            </Box>
          </Stack>
        )}
      </GeneralModal>
    </>
  );
};
