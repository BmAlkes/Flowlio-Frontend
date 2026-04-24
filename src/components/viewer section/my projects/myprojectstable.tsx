import { ColumnDef } from "@tanstack/react-table";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";
import { ArrowUp } from "lucide-react";
import { ReusableTable } from "@/components/reusable/reusabletable";
import {
  useFetchViewerProjects,
  type ViewerProject,
} from "@/hooks/useFetchViewerProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

// Removed hardcoded data - now using real API data

// Actions cell component to properly use hooks
const ActionsCell = ({ projectId }: { projectId: string }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Center
      className="space-x-2 underline text-blue-500 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/viewer/projects/${projectId}`);
      }}
    >
      <span>{t("projects.viewDetails")}</span>
    </Center>
  );
};

export const MyProjectsTable = () => {
  const { data: projectsResponse, isLoading, error } = useFetchViewerProjects();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="text-center py-8">
        <p className="text-red-600">{t("projects.loadingError")} {error.message}</p>
      </Box>
    );
  }

  const projects = projectsResponse?.data || [];

  if (projects.length === 0) {
    return (
      <Box className="text-center py-8">
        <p className="text-muted-foreground">{t("projects.noProjectsAssigned")}</p>
      </Box>
    );
  }

  const columns: ColumnDef<ViewerProject>[] = [
    {
      id: "select",
      header: () => <Box className="text-center text-foreground p-2">#</Box>,
      cell: ({ row }) => (
        <Box className="text-center px-2 py-3">0{row.index + 1}</Box>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: () => <Box className="text-foreground w-60">{t("projects.projectName")}</Box>,
      cell: ({ row }) => (
        <Box className="capitalize w-60 max-sm:w-full">
          {row.original.name.length > 28
            ? row.original.name.slice(0, 28) + "..."
            : row.original.name}
        </Box>
      ),
    },
    {
      accessorKey: "clientName",
      header: () => <Box className="text-foreground text-center">{t("projects.client")}</Box>,
      cell: ({ row }) => (
        <Box className="capitalize text-center">{row.original.clientName}</Box>
      ),
    },

    {
      accessorKey: "progress",
      header: () => <Box className="text-center text-foreground">{t("projects.progress")}</Box>,
      cell: ({ row }) => {
        return (
          <Center className="text-center gap-2">
            <Box className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {row.original.progress}%
              </span>
            </Box>
            <ArrowUp className="size-4 text-green-600 font-semibold" />
          </Center>
        );
      },
    },
    {
      accessorKey: "totalTasks",
      header: () => <Box className="text-center text-foreground">{t("projects.totalTasks")}</Box>,
      cell: ({ row }) => (
        <Box className="text-center text-sm font-medium">
          {row.original.totalTasks || 0}
        </Box>
      ),
    },
    {
      accessorKey: "completedTasks",
      header: () => (
        <Box className="text-center text-foreground">{t("projects.completedTasks")}</Box>
      ),
      cell: ({ row }) => (
        <Box className="text-center text-sm font-medium">
          {row.original.completedTasks || 0}
        </Box>
      ),
    },
    {
      accessorKey: "status",
      header: () => <Box className="text-center text-foreground">{t("projects.status")}</Box>,
      cell: ({ row }) => {
        const status = row.original.status;
        const statusStyles = {
          completed: "bg-green-100 text-green-800 border-green-200",
          ongoing: "bg-blue-100 text-blue-800 border-blue-200",
          pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };

        return (
          <Center>
            <Badge
              variant="outline"
              className={`${statusStyles[status]} text-xs px-2 py-1`}
            >
              {t(`projects.statusValue.${status}`)}
            </Badge>
          </Center>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <Box className="text-center text-foreground">{t("common.actions")}</Box>,
      cell: ({ row }) => <ActionsCell projectId={row.original.id} />,
    },
  ];

  return (
    <ReusableTable
      data={projects}
      columns={columns}
      enablePaymentLinksCalender={true}
      onRowClick={(row) => navigate(`/viewer/projects/${row.original.id}`)}
    />
  );
};
