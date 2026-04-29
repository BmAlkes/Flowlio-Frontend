import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { PageWrapper } from "@/components/common/pagewrapper";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  useFetchClientTasks,
  type ClientTask,
} from "@/hooks/useFetchClientTasks";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useUser } from "@/providers/user.provider";
import { useTranslation } from "react-i18next";

const ClientTasksPage = () => {
  const { t } = useTranslation();
  const { data: userData } = useUser();
  const clientId = userData?.user?.clientId;
  const organizationId = userData?.user?.organizationId;

  const { data: tasksResponse, isLoading } = useFetchClientTasks(
    clientId || undefined,
    organizationId || undefined,
  );

  const tasks = tasksResponse?.data?.tasks || [];

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
      cell: ({ row }) => {
        const status = row.original.status?.toLowerCase() || "pending";
        const statusStyles: Record<string, { text: string; dot: string }> = {
          completed: {
            text: "text-white bg-[#00A400] border-none rounded-full",
            dot: "bg-white",
          },
          pending: {
            text: "text-white bg-[#F98618] border-none rounded-full",
            dot: "bg-white",
          },
          ongoing: {
            text: "text-white bg-[#005FA4] border-none rounded-full",
            dot: "bg-white",
          },
          "in progress": {
            text: "text-white bg-[#005FA4] border-none rounded-full",
            dot: "bg-white",
          },
          in_progress: {
            text: "text-white bg-[#005FA4] border-none rounded-full",
            dot: "bg-white",
          },
          delayed: {
            text: "text-white bg-[#EF5350] border-none rounded-full",
            dot: "bg-white",
          },
          delay: {
            text: "text-white bg-[#EF5350] border-none rounded-full",
            dot: "bg-white",
          },
          todo: {
            text: "text-white bg-[#5B60FE] border-none rounded-full",
            dot: "bg-white",
          },
          updated: {
            text: "text-white bg-[#A94DCD] border-none rounded-full",
            dot: "bg-white",
          },
          changes: {
            text: "text-white bg-[#4DCDC9] border-none rounded-full",
            dot: "bg-white",
          },
        };

        const currentStyle = statusStyles[status] || {
          text: "text-white bg-slate-500 border-none rounded-full",
          dot: "bg-white",
        };

        return (
          <Center>
            <Box
              className={`flex rounded-full px-3 py-1 min-w-[100px] w-fit h-8 gap-2 justify-center items-center ${currentStyle.text}`}
            >
              <Flex
                className={`w-2 h-2 shrink-0 rounded-full ${currentStyle.dot}`}
              />
              <span className="truncate text-xs font-medium whitespace-nowrap">
                {t([
                  `projects.statusValue.${status}`,
                  `tasks.statusValue.${status.replace(" ", "_")}`,
                  status,
                ])}
              </span>
            </Box>
          </Center>
        );
      },
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
      {isLoading ? (
        <Box className="flex justify-center p-10">Loading tasks...</Box>
      ) : (
        <Box className=" rounded-xl   border border-border overflow-hidden">
          <ReusableTable
            data={tasks}
            columns={columns}
            searchClassName="rounded-full"
            filterClassName="rounded-full"
          />
        </Box>
      )}
    </PageWrapper>
  );
};

export default ClientTasksPage;
