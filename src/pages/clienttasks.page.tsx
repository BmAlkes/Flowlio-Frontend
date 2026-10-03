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
import { useUser } from "@/providers/user.provider";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { MessageCircle, Paperclip, User, FolderOpen, RefreshCw } from "lucide-react";
import { useDataScope } from "@/hooks/useDataScope";

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

const ClientTasksWorkspace = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: userData, isLoading: userLoading, refetchUser } = useUser();
  const clientId = userData?.user?.clientId;
  const organizationId = userData?.user?.organizationId;
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: tasksResponse, isLoading, isError, isFetching, refetch } = useFetchClientTasks(
    clientId || undefined,
    organizationId || undefined,
  );

  const tasks = useMemo(() => isError ? [] : tasksResponse?.data?.tasks ?? [], [isError, tasksResponse]);
  const selectedTask = tasks.find(task => task.id === selectedTaskId) ?? null;
  const hasIdentity = !!clientId && !!organizationId;
  const date = (value?: string) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? new Intl.DateTimeFormat(i18n.language, {dateStyle: "medium"}).format(parsed) : t("common.notSet");
  };

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
        <Button variant="link" className="h-auto max-w-full whitespace-normal text-start" onClick={() => setSelectedTaskId(row.original.id)}>{row.original.title}</Button>
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
          {date(row.original.startDate)}
        </Box>
      ),
    },
    {
      accessorKey: "endDate",
      header: () => <Box className="text-center text-foreground">{t("projects.endDate")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center">
          {date(row.original.endDate)}
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
          {t("tasks.portal.description")}
        </p>
        <Button variant="outline" className="mt-3 w-fit gap-2" disabled={userLoading || isFetching || !hasIdentity} onClick={() => void refetch()}><RefreshCw aria-hidden="true" className={`size-4 ${isFetching ? "animate-spin motion-reduce:animate-none" : ""}`} />{t("tasks.portal.refresh")}</Button>
      </Stack>

      {!isLoading && availableStatuses.length > 0 && (
        <Box className="px-6 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("projects.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tasks.portal.all")}</SelectItem>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {t([`projects.statusValue.${status}`, `tasks.statusValue.${status.replace(" ", "_")}`, status])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Box>
      )}

      {userLoading || isLoading ? (
        <Box role="status" className="flex justify-center p-10">{t("tasks.loadingTasks")}</Box>
      ) : !hasIdentity ? (
        <Box role="alert" className="space-y-3 rounded-xl border border-border p-6"><p>{t("tasks.portal.identityError")}</p><Button variant="outline" onClick={() => void refetchUser()}>{t("tasks.portal.retry")}</Button></Box>
      ) : isError ? (
        <Box role="alert" className="space-y-3 rounded-xl border border-destructive/30 p-6"><p>{t("tasks.portal.loadError")}</p><Button variant="outline" disabled={isFetching} onClick={() => void refetch()}>{t("tasks.portal.retry")}</Button></Box>
      ) : tasks.length === 0 ? (
        <Box role="status" className="space-y-2 rounded-xl border border-border p-6"><p className="font-medium">{t("tasks.portal.empty")}</p><p className="text-sm leading-6 text-muted-foreground">{t("tasks.portal.emptyHint")}</p></Box>
      ) : filteredTasks.length === 0 ? (
        <Box role="status" className="space-y-3 rounded-xl border border-border p-6"><p>{t("tasks.portal.filteredEmpty")}</p><Button variant="outline" onClick={() => setStatusFilter("all")}>{t("tasks.portal.clearFilters")}</Button></Box>
      ) : (
        <Box className=" rounded-xl   border border-border overflow-hidden">
          <ReusableTable
            data={filteredTasks}
            columns={columns}
            searchClassName="rounded-full"
            filterClassName="rounded-full"
          />
        </Box>
      )}

      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
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
                      {t("tasks.portal.taskDescription")}
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
                      {date(selectedTask.startDate)}
                    </p>
                  </Box>
                  <Box>
                    <p className="text-xs text-muted-foreground">{t("projects.endDate")}</p>
                    <p className="font-medium text-foreground">
                      {date(selectedTask.endDate)}
                    </p>
                  </Box>
                </Flex>

                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <Box>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5" />
                      {t("tasks.portal.attachments", {count: selectedTask.attachments.length})}
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
                  {t("tasks.portal.askQuestion")}
                </Button>
              </Stack>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageWrapper>
  );
};

export default function ClientTasksPage() {
  const scope = useDataScope();
  return <ClientTasksWorkspace key={scope} />;
}
