import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { ReusableTable } from "@/components/reusable/reusabletable";
import { Stack } from "@/components/ui/stack";
import { PageWrapper } from "@/components/common/pagewrapper";
import Img from "/viewer/tasklistline.svg";
import TasklistIcon from "/viewer/tasklisticon.svg";
import { Flex } from "@/components/ui/flex";
import { Checkbox } from "@/components/ui/checkbox";
import { useFetchViewerTasks, ViewerTask } from "@/hooks/useFetchViewerTasks";
import { useActiveTimeEntries } from "@/hooks/useTimeTracking";
import { useAllTimeEntries } from "@/hooks/useAllTimeEntries";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import {
  GeneralModal,
  useGeneralModalDisclosure,
} from "@/components/common/generalmodal";
import { Button } from "@/components/ui/button";

export type Data = {
  id: string;
  trackedon: string;
  submittedby: string;
  project: string;
  taskname: string;
  status: "in progress" | "completed" | "to do";
  duedate?: string;
  description?: string;
  taskData?: ViewerTask;
};

export const ViewerTable = () => {
  const navigate = useNavigate();
  const modalProps = useGeneralModalDisclosure();
  const [selectedTask, setSelectedTask] = useState<Data | null>(null);

  // Fetch real data
  const { data: tasksResponse, isLoading: tasksLoading } =
    useFetchViewerTasks();
  const { data: activeTimeEntries } = useActiveTimeEntries();
  const { data: allTimeEntries } = useAllTimeEntries();

  // Map status from API format to table format
  const mapStatus = (
    status: ViewerTask["status"]
  ): "in progress" | "completed" | "to do" => {
    switch (status) {
      case "in_progress":
        return "in progress";
      case "completed":
        return "completed";
      case "todo":
        return "to do";
      default:
        return "to do"; // Default for updated, delay, changes
    }
  };

  // Create a set of active task IDs
  const activeTaskIds = useMemo(() => {
    return new Set(activeTimeEntries?.data?.map((entry) => entry.taskId) || []);
  }, [activeTimeEntries]);

  // Create a set of tracked task IDs (any task that has time entries)
  const trackedTaskIds = useMemo(() => {
    return new Set(allTimeEntries?.data?.map((entry) => entry.taskId) || []);
  }, [allTimeEntries]);

  // Transform API data to table data format
  const tableData: Data[] = useMemo(() => {
    if (!tasksResponse?.data) return [];

    return tasksResponse.data.map((task) => ({
      id: task.id,
      trackedon: activeTaskIds.has(task.id)
        ? "on"
        : trackedTaskIds.has(task.id)
        ? "yes"
        : "no",
      submittedby: task.creatorName || "N/A",
      project: task.projectName || "N/A",
      taskname: task.title,
      status: mapStatus(task.status),
      duedate: task.endDate
        ? new Date(task.endDate).toLocaleDateString()
        : undefined,
      description: task.description || "",
      taskData: task,
    }));
  }, [tasksResponse, activeTaskIds, trackedTaskIds]);

  // Columns defined inside component so they have access to navigate/state
  const columns: ColumnDef<Data>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Flex className="py-3 px-3">
          <Checkbox
            className="bg-[#D9D9D9] border-none cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
          <Box className="text-center text-foreground">ID</Box>
        </Flex>
      ),
      cell: ({ row }) => (
        <Flex className="py-3 px-3">
          <Checkbox
            className="bg-[#D9D9D9] border-none cursor-pointer"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          <Box className="text-center">
            {row.original.taskData?.projectNumber || row.index + 1234}
          </Box>
        </Flex>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "taskname",
      header: () => <Box className="text-foreground py-3">Task Name</Box>,
      cell: ({ row }) => (
        <Box className="capitalize py-3 w-24 max-sm:w-full">
          {row.original.taskname.length > 28
            ? row.original.taskname.slice(0, 28) + "..."
            : row.original.taskname}
        </Box>
      ),
    },
    {
      accessorKey: "taskname",
      header: () => <Box className="text-foreground"></Box>,
      cell: () => <Box className="capitalize w-24 max-sm:w-full"></Box>,
    },

    {
      accessorKey: "project",
      header: () => <Box className="text-foreground text-start">Project</Box>,
      cell: ({ row }) => (
        <Box className="captialize text-start">{row.original.project}</Box>
      ),
    },

    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">Status</Box>,
      cell: ({ row }) => {
        const status = row.original.status as
          | "in progress"
          | "completed"
          | "to do";

        const statusStyles: Record<typeof status, { text: string }> = {
          completed: {
            text: "text-[#3F6B3B] bg-[#DEFFDB] border-none rounded-md",
          },
          "in progress": {
            text: "text-[#6C541F] bg-[#FFF8DB] border-none rounded-md",
          },
          "to do": {
            text: "text-[#FD3995] bg-[#FFDBEC] border-none rounded-md",
          },
        };

        return (
          <Center>
            <Flex
              className={`rounded-sm capitalize w-22 h-9 gap-2 border items-center ${statusStyles[status].text}`}
            >
              <Flex className="mx-auto">
                <span>{status}</span>
              </Flex>
            </Flex>
          </Center>
        );
      },
    },

    {
      accessorKey: "trackedon",
      header: () => <Box className="text-center text-foreground">Tracked</Box>,
      cell: ({ row }) => {
        return <Box className="text-center">{row.original.trackedon}</Box>;
      },
    },

    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-foreground">Actions</Box>,
      cell: ({ row }) => {
        return (
          <Center
            className="space-x-2 text-blue-500 underline cursor-pointer hover:text-blue-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTask(row.original);
              modalProps.onOpenChange(true);
            }}
          >
            View Details
          </Center>
        );
      },
    },
  ];

  if (tasksLoading) {
    return (
      <PageWrapper className="h-full">
        <Center className="h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </Center>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-full h-[calc(100vh-100px)] overflow-y-auto">
      <Stack className="gap-0 w-full p-4">
        <Center className="justify-between">
          <Flex className="gap-1">
            <img src={TasklistIcon} alt="tasklisticon" className="size-8" />
            <h1 className="text-foreground text-2xl max-sm:text-xl font-medium">
              Task List
            </h1>
          </Flex>
          <h1
            className="text-blue-500 text-sm cursor-pointer hover:text-blue-900"
            onClick={() => navigate("/viewer/my-tasks")}
          >
            View Page
          </h1>
        </Center>
        <img src={Img} alt="tasklistline" className="w-full mt-4" />
      </Stack>

      <ReusableTable
        data={tableData}
        columns={columns}
        // searchInput={false}
        enablePaymentLinksCalender={false}
        searchClassName="rounded-full"
        filterClassName="rounded-full"
        enableGlobalFilter={false}
        onRowClick={(row) => console.log("Row clicked:", row.original)}
        enableSuperAdminTable={true}
      />

      {/* Task Detail Modal */}
      <GeneralModal
        {...modalProps}
        contentProps={{ className: "w-lg max-sm:w-full" }}
      >
        {selectedTask && (
          <Stack className="gap-4">
            {/* Task Header */}
            <Stack className="gap-2">
              <h1 className="text-sm font-normal text-muted-foreground">Project</h1>
              <h2 className="text-lg font-normal">{selectedTask.project}</h2>
            </Stack>

            {/* Task Details */}
            <Box className="bg-card/80 gap-6 grid grid-cols-1">
              {/* Task Title */}
              <Stack className="gap-2">
                <h1 className="text-sm font-normal text-muted-foreground">
                  Task Title
                </h1>
                <h2 className="text-lg font-normal">{selectedTask.taskname}</h2>
              </Stack>

              {/* Task Description */}
              {selectedTask.description && (
                <Stack className="gap-2">
                  <h1 className="text-sm font-normal text-muted-foreground">
                    Description
                  </h1>
                  <p className="text-sm text-foreground">
                    {selectedTask.description}
                  </p>
                </Stack>
              )}

              <hr className="border-border w-full" />

              {/* Task Details Grid */}
              <Center className="grid grid-cols-2 gap-4">
                <Stack className="bg-[#FFFEE8] w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-[#929292]">Status</h1>
                  <h1 className="text-sm font-normal text-foreground capitalize">
                    {selectedTask.status}
                  </h1>
                </Stack>

                <Stack className="bg-[#FFFEE8] w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-[#929292]">
                    Due Date
                  </h1>
                  <h1 className="text-sm font-normal text-foreground">
                    {selectedTask.duedate || "N/A"}
                  </h1>
                </Stack>

                <Stack className="bg-[#FFFEE8] w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-[#929292]">
                    Assigned By
                  </h1>
                  <h1 className="text-sm font-normal text-foreground">
                    {selectedTask.submittedby}
                  </h1>
                </Stack>

                <Stack className="bg-[#FFFEE8] w-full text-center p-3 rounded-lg">
                  <h1 className="text-sm font-normal text-[#929292]">
                    Tracked
                  </h1>
                  <h1 className="text-sm font-normal text-foreground capitalize">
                    {selectedTask.trackedon}
                  </h1>
                </Stack>
              </Center>

              {/* Action Buttons */}
              <Flex className="justify-end gap-3">
                <Button
                  variant="outline"
                  className="bg-muted hover:bg-muted text-foreground border border-border font-normal rounded-full px-6 py-3 flex items-center gap-2 cursor-pointer"
                  onClick={() => modalProps.onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="bg-[#1797b9] hover:bg-[#1797b9]/80 hover:text-white text-white border border-border rounded-full px-6 py-3 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    modalProps.onOpenChange(false);
                    navigate("/viewer/my-tasks");
                  }}
                >
                  Go to My Tasks
                </Button>
              </Flex>
            </Box>
          </Stack>
        )}
      </GeneralModal>
    </PageWrapper>
  );
};
