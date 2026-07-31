import { useMemo, useState } from "react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { PageWrapper } from "@/components/common/pagewrapper";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  useFetchClientTasks,
  type ClientTask,
} from "@/hooks/useFetchClientTasks";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useUser } from "@/providers/user.provider";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { MessageCircle, Paperclip, User, FolderOpen } from "lucide-react";

const STATUS_STYLES: Record<string, { text: string; dot: string }> = {
  completed: { text: "text-white bg-[#00A400] border-none rounded-full", dot: "bg-white" },
  pending: { text: "text-white bg-[#F98618] border-none rounded-full", dot: "bg-white" },
  ongoing: { text: "text-white bg-[#005FA4] border-none rounded-full", dot: "bg-white" },
  "in progress": { text: "text-white bg-[#005FA4] border-none rounded-full", dot: "bg-white" },
  in_progress: { text: "text-white bg-[#005FA4] border-none rounded-full", dot: "bg-white" },
  delayed: { text: "text-white bg-[#EF5350] border-none rounded-full", dot: "bg-white" },
  delay: { text: "text-white bg-[#EF5350] border-none rounded-full", dot: "bg-white" },
  todo: { text: "text-white bg-[#5B60FE] border-none rounded-full", dot: "bg-white" },
  updated: { text: "text-white bg-[#A94DCD] border-none rounded-full", dot: "bg-white" },
  changes: { text: "text-white bg-[#4DCDC9] border-none rounded-full", dot: "bg-white" },
};

const StatusBadge = ({ status, t }: { status: string; t: (key: string | string[]) => string }) => {
  const key = status?.toLowerCase() || "pending";
  const style = STATUS_STYLES[key] || { text: "text-white bg-slate-500 border-none rounded-full", dot: "bg-white" };
  return (
    <Box className={`flex rounded-full px-3 py-1 min-w-[100px] w-fit h-8 gap-2 justify-center items-center ${style.text}`}>
      <Flex className={`w-2 h-2 shrink-0 rounded-full ${style.dot}`} />
      <span className="truncate text-xs font-medium whitespace-nowrap">
        {t([`projects.statusValue.${key}`, `tasks.statusValue.${key.replace(" ", "_")}`, key])}
      </span>
    </Box>
  );
};

const ClientTasksPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: userData } = useUser();
  const clientId = userData?.user?.clientId;
  const organizationId = userData?.user?.organizationId;
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);

  const { data: tasksResponse, isLoading } = useFetchClientTasks(
    clientId || undefined,
    organizationId || undefined,
  );

  const tasks = tasksResponse?.data?.tasks || [];

  const availableStatuses = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.status?.toLowerCase()).filter(Boolean))),
    [tasks],
  );

  const filteredTasks = useMemo(
    () =>
      statusFilter === "all"
        ? tasks
        : tasks.filter((task) => task.status?.toLowerCase() === statusFilter),
    [tasks, statusFilter],
  );

  const columns: ColumnDef<ClientTask>[] = [
    {
      accessorKey: "title",
      header: () => <Box className="text-center text-foreground">{t("tasks.taskTitle")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center font-medium">{row.original.title}</Box>
      ),
    },
    {
      accessorKey: "projectName",
      header: () => <Box className="text-center text-foreground">{t("projects.projectName")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">{row.original.projectName}</Box>
      ),
    },
    {
      accessorKey: "assigneeName",
      header: () => <Box className="text-center text-foreground">{t("projects.assignedTo")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          {row.original.assigneeName || t("common.unassigned")}
        </Box>
      ),
    },
    {
      accessorKey: "startDate",
      header: () => <Box className="text-center text-foreground">{t("projects.startDate")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          {row.original.startDate
            ? format(new Date(row.original.startDate), "MMM d, yyyy")
            : t("common.notSet")}
        </Box>
      ),
    },
    {
      accessorKey: "endDate",
      header: () => <Box className="text-center text-foreground">{t("projects.endDate")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          {row.original.endDate
            ? format(new Date(row.original.endDate), "MMM d, yyyy")
            : t("common.notSet")}
        </Box>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">{t("projects.status")}</Box>,
      cell: ({ row }) => (
        <Center>
          <StatusBadge status={row.original.status} t={t} />
        </Center>
      ),
    },
  ];

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-1 p-6 mb-6">
        <h1 className="text-2xl font-medium text-foreground">{t("tasks.myTasks")}</h1>
        <p className="text-muted-foreground">
          {t("tasks.myTasksDesc")}
        </p>
      </Stack>

      {!isLoading && availableStatuses.length > 0 && (
        <Box className="px-6 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("projects.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("projects.allProjects", "All")}</SelectItem>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {t([`projects.statusValue.${status}`, `tasks.statusValue.${status.replace(" ", "_")}`, status])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Box>
      )}

      {isLoading ? (
        <Box className="flex justify-center p-10">Loading tasks...</Box>
      ) : (
        <Box className=" rounded-xl   border border-border overflow-hidden">
          <ReusableTable
            data={filteredTasks}
            columns={columns}
            searchClassName="rounded-full"
            filterClassName="rounded-full"
            onRowClick={(row) => setSelectedTask(row.original)}
          />
        </Box>
      )}

      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl">{selectedTask.title}</SheetTitle>
              </SheetHeader>
              <Stack className="gap-5 px-4 pb-6">
                <StatusBadge status={selectedTask.status} t={t} />

                {selectedTask.description && (
                  <Box>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Description
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTask.description}</p>
                  </Box>
                )}

                <Flex className="items-center gap-2 text-sm text-foreground">
                  <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  {selectedTask.projectName}
                </Flex>

                <Flex className="items-center gap-2 text-sm text-foreground">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  {selectedTask.assigneeName || t("common.unassigned")}
                </Flex>

                <Flex className="items-center gap-6 text-sm">
                  <Box>
                    <p className="text-xs text-muted-foreground">{t("projects.startDate")}</p>
                    <p className="font-medium text-foreground">
                      {selectedTask.startDate ? format(new Date(selectedTask.startDate), "MMM d, yyyy") : t("common.notSet")}
                    </p>
                  </Box>
                  <Box>
                    <p className="text-xs text-muted-foreground">{t("projects.endDate")}</p>
                    <p className="font-medium text-foreground">
                      {selectedTask.endDate ? format(new Date(selectedTask.endDate), "MMM d, yyyy") : t("common.notSet")}
                    </p>
                  </Box>
                </Flex>

                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <Box>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments ({selectedTask.attachments.length})
                    </p>
                  </Box>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    navigate("/clients/projects", {
                      state: { openCommentsForProjectId: selectedTask.projectId },
                    })
                  }
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask a question about this task
                </Button>
              </Stack>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageWrapper>
  );
};

export default ClientTasksPage;
