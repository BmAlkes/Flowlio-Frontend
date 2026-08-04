import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { format, isPast } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Pencil,
  KeyRound,
  Trash2,
  ListTodo,
  CheckCircle2,
  CircleDot,
  CircleDashed,
  FolderOpen,
  Receipt,
  Download,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetchOrganizationClients } from "@/hooks/usefetchclients";
import { useFetchClientProjects } from "@/hooks/useFetchClientProjects";
import { useFetchClientTasks } from "@/hooks/useFetchClientTasks";
import { useFetchClientInvoices, type ClientInvoice } from "@/hooks/useFetchClientInvoices";
import { useClientTimeline } from "@/hooks/useCRM";
import { useUpdateClient } from "@/hooks/useupdateclient";
import { useDeleteClient } from "@/hooks/usedeleteclient";
import { useUser } from "@/providers/user.provider";
import { ClientTimeline } from "@/components/client management/ClientTimeline";
import { ClientMediaCenter } from "@/components/client management/clientmediacenter";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  Active: "text-white bg-green-600",
  Onboarding: "text-white bg-blue-500",
  "On Hold": "text-white bg-amber-500",
  Inactive: "text-white bg-gray-500",
  Completed: "text-white bg-emerald-600",
  Churned: "text-white bg-rose-500",
};

const STATUS_OPTIONS = [
  "Active",
  "Onboarding",
  "On Hold",
  "Inactive",
  "Completed",
  "Churned",
];

const PROJECT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ongoing: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
};

const TASK_STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  in_progress: <CircleDot className="h-4 w-4 text-blue-600" />,
  "in progress": <CircleDot className="h-4 w-4 text-blue-600" />,
  todo: <CircleDashed className="h-4 w-4 text-muted-foreground" />,
  "to do": <CircleDashed className="h-4 w-4 text-muted-foreground" />,
};

const ClientDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { data: userData } = useUser();
  const organizationId = userData?.user?.organizationId;

  const [statusUpdating, setStatusUpdating] = useState(false);

  const { data: clientsData, isLoading: isLoadingClients } =
    useFetchOrganizationClients();
  const client = clientsData?.data?.find((c: any) => c.id === clientId);

  const { data: projectsResponse, isLoading: isLoadingProjects } =
    useFetchClientProjects(clientId, organizationId || undefined);
  const { data: tasksResponse, isLoading: isLoadingTasks } =
    useFetchClientTasks(clientId, organizationId || undefined);
  const { data: invoicesResponse, isLoading: isLoadingInvoices } =
    useFetchClientInvoices(clientId, organizationId || undefined);
  const { data: timeline, isLoading: isLoadingTimeline } = useClientTimeline(
    clientId || "",
  );

  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const projects = projectsResponse?.data?.projects || [];
  const tasks = tasksResponse?.data?.tasks || [];
  const invoices: ClientInvoice[] = invoicesResponse?.data?.invoices || [];

  const taskCounts = useMemo(() => {
    const norm = (s: string) => s?.toLowerCase().replace(" ", "_");
    return {
      total: tasks.length,
      completed: tasks.filter((tk) => norm(tk.status) === "completed").length,
      inProgress: tasks.filter((tk) => norm(tk.status) === "in_progress")
        .length,
      pending: tasks.filter((tk) =>
        ["todo", "to_do", "pending"].includes(norm(tk.status)),
      ).length,
    };
  }, [tasks]);

  const activeProject = useMemo(
    () =>
      [...projects]
        .filter((p) => p.status !== "completed")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )[0],
    [projects],
  );

  const upcomingDeadlines = useMemo(
    () =>
      [...projects]
        .filter((p) => p.status !== "completed" && !!p.endDate)
        .sort(
          (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
        )
        .slice(0, 5),
    [projects],
  );

  const recentActivity = useMemo(() => (timeline || []).slice(0, 5), [timeline]);

  const outstandingBalance = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status?.toLowerCase() !== "paid")
        .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0),
    [invoices],
  );

  const handleStatusChange = (newStatus: string) => {
    if (!clientId || !client || newStatus === client.status) return;
    setStatusUpdating(true);
    updateClient.mutate(
      { clientId, data: { status: newStatus } },
      {
        onSuccess: () => toast.success(t("clientManagement.toastStatusUpdated")),
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.error ||
              t("clientManagement.toastStatusFailed"),
          ),
        onSettled: () => setStatusUpdating(false),
      },
    );
  };

  const handleDelete = () => {
    if (!clientId || !client) return;
    if (window.confirm(t("clientManagement.confirmDelete", { email: client.email }))) {
      deleteClient.mutate(clientId, {
        onSuccess: () => {
          toast.success(t("clientManagement.toastDeleted"));
          navigate("/dashboard/client-management");
        },
        onError: () => toast.error(t("clientManagement.toastDeleteFailed")),
      });
    }
  };

  if (isLoadingClients) {
    return (
      <PageWrapper className="mt-6">
        <Stack className="gap-4 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </Stack>
      </PageWrapper>
    );
  }

  if (!client) {
    return (
      <PageWrapper className="mt-6">
        <Stack className="items-center justify-center gap-3 py-24">
          <p className="text-lg font-medium text-foreground">
            {t("clientManagement.notAvailable")}
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard/client-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back", { defaultValue: "Back" })}
          </Button>
        </Stack>
      </PageWrapper>
    );
  }

  const initials = client.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-6 p-6 pb-10">
        {/* Back link */}
        <button
          onClick={() => navigate("/dashboard/client-management")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("clientManagement.title", { defaultValue: "Clients" })}
        </button>

        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <Flex className="items-start justify-between gap-4 max-md:flex-col">
              <Flex className="items-start gap-4 min-w-0">
                <Avatar className="h-16 w-16 rounded-2xl shrink-0">
                  <AvatarImage src={client.image} />
                  <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Stack className="gap-1.5 min-w-0">
                  <Flex className="items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-semibold text-foreground truncate">
                      {client.name}
                    </h1>
                    <Select
                      value={client.status}
                      onValueChange={handleStatusChange}
                      disabled={statusUpdating}
                    >
                      <SelectTrigger
                        size="sm"
                        className={`h-7 text-xs font-semibold border-none rounded-full px-3 ${
                          STATUS_STYLES[client.status] || "bg-muted text-foreground"
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`clientManagement.clientStatuses.${s}`, {
                              defaultValue: s,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Flex>
                  <Flex className="items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {client.businessIndustry || t("clientManagement.notAvailable")}
                  </Flex>
                  <Flex className="items-center gap-4 flex-wrap text-sm text-muted-foreground">
                    {client.email && (
                      <Flex className="items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {client.email}
                      </Flex>
                    )}
                    {client.phone && (
                      <Flex className="items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {client.phone}
                      </Flex>
                    )}
                    {client.address && (
                      <Flex className="items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {client.address}
                      </Flex>
                    )}
                  </Flex>
                </Stack>
              </Flex>

              <Flex className="gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate("/dashboard/client-management/create-client", {
                      state: { mode: "edit", client },
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  {t("clientManagement.editClient")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate("/dashboard/client-management/create-client", {
                      state: { mode: "edit", client, focusPortalAccess: true },
                    })
                  }
                >
                  <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                  {t("clientManagement.grantPortalAccess")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={handleDelete}
                  disabled={deleteClient.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* Tasks overview stat cards */}
        {isLoadingTasks ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">
                  <ListTodo className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{taskCounts.total}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("clientManagement.overview.totalTasks", { defaultValue: "Total Tasks" })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{taskCounts.completed}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("clientManagement.overview.completed", { defaultValue: "Completed" })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
                  <CircleDot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{taskCounts.inProgress}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("clientManagement.overview.inProgress", { defaultValue: "In Progress" })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
                  <CircleDashed className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{taskCounts.pending}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("clientManagement.overview.pending", { defaultValue: "Pending" })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              {t("clientManagement.tabs.overview", { defaultValue: "Overview" })}
            </TabsTrigger>
            <TabsTrigger value="projects">
              {t("clientManagement.tabs.projects", { defaultValue: "Projects" })}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              {t("clientManagement.tabs.tasks", { defaultValue: "Tasks" })}
            </TabsTrigger>
            <TabsTrigger value="activity">
              {t("clientManagement.tabs.activity", { defaultValue: "Activity" })}
            </TabsTrigger>
            <TabsTrigger value="files">
              {t("clientManagement.tabs.files", { defaultValue: "Files" })}
            </TabsTrigger>
            <TabsTrigger value="invoices">
              {t("clientManagement.tabs.invoices", { defaultValue: "Invoices" })}
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Active project */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    {t("clientManagement.overview.activeProject", {
                      defaultValue: "Active Project",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects ? (
                    <Skeleton className="h-28 w-full rounded-lg" />
                  ) : !activeProject ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {t("clientManagement.overview.noActiveProject", {
                        defaultValue: "No active project.",
                      })}
                    </p>
                  ) : (
                    <Stack
                      className="gap-3 cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/project/view/${activeProject.id}`)
                      }
                    >
                      <Flex className="items-center justify-between">
                        <p className="font-semibold text-foreground">
                          {activeProject.projectName}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full border font-medium ${
                            PROJECT_STATUS_STYLES[activeProject.status] ||
                            "bg-muted text-foreground"
                          }`}
                        >
                          {activeProject.status}
                        </span>
                      </Flex>
                      {activeProject.endDate && (
                        <p className="text-xs text-muted-foreground">
                          {t("projects.endDate")}:{" "}
                          {format(new Date(activeProject.endDate), "MMM d, yyyy")}
                        </p>
                      )}
                      <div>
                        <Flex className="items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            {t("projects.progress")}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {activeProject.progress ?? 0}%
                          </span>
                        </Flex>
                        <Progress value={activeProject.progress ?? 0} />
                      </div>
                      <Flex className="items-center gap-1 text-xs font-semibold text-indigo-600">
                        {t("clientManagement.overview.viewProject", {
                          defaultValue: "View project",
                        })}
                        <ExternalLink className="h-3 w-3" />
                      </Flex>
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming milestones (project deadlines) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {t("clientManagement.overview.upcomingDeadlines", {
                      defaultValue: "Upcoming Deadlines",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects ? (
                    <Stack className="gap-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </Stack>
                  ) : upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {t("clientManagement.overview.noDeadlines", {
                        defaultValue: "No upcoming deadlines.",
                      })}
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {upcomingDeadlines.map((project) => {
                        const due = new Date(project.endDate);
                        const overdue = isPast(due);
                        return (
                          <Flex
                            key={project.id}
                            className="items-center justify-between py-3 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
                            onClick={() =>
                              navigate(`/dashboard/project/view/${project.id}`)
                            }
                          >
                            <Box className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {project.projectName}
                              </p>
                              <p
                                className={`text-xs flex items-center gap-1 mt-0.5 ${
                                  overdue ? "text-rose-600" : "text-muted-foreground"
                                }`}
                              >
                                {overdue ? (
                                  <AlertTriangle className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                {overdue
                                  ? t("clientManagement.overview.overdue", {
                                      defaultValue: "Overdue",
                                    })
                                  : t("clientManagement.overview.due", {
                                      defaultValue: "Due",
                                    })}{" "}
                                {format(due, "MMM d, yyyy")}
                              </p>
                            </Box>
                            <span className="text-xs font-bold text-muted-foreground shrink-0">
                              {project.progress ?? 0}%
                            </span>
                          </Flex>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("pipeline.activity", { defaultValue: "Recent Activity" })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTimeline ? (
                    <Stack className="gap-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </Stack>
                  ) : recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {t("clientManagement.overview.noActivity", {
                        defaultValue: "No recent activity yet.",
                      })}
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {recentActivity.map((item: any) => (
                        <Box key={item.id} className="py-3">
                          <Flex className="items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {item.user?.name || "Team"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.type}
                            </span>
                          </Flex>
                          <p className="text-sm text-foreground/90 mt-0.5 line-clamp-2">
                            {item.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
                          </p>
                        </Box>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects" className="mt-4">
            {isLoadingProjects ? (
              <Stack className="gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </Stack>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                {t("clientManagement.viewModal.noProjects")}
              </p>
            ) : (
              <Stack className="gap-3">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() =>
                      navigate(`/dashboard/project/view/${project.id}`)
                    }
                  >
                    <CardContent className="p-4">
                      <Flex className="items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                        <Box className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {project.projectName}
                          </p>
                          {project.endDate && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("projects.endDate")}:{" "}
                              {format(new Date(project.endDate), "MMM d, yyyy")}
                            </p>
                          )}
                        </Box>
                        <Flex className="items-center gap-4 shrink-0">
                          <div className="w-32">
                            <Progress value={project.progress ?? 0} />
                          </div>
                          <span className="text-xs font-bold text-foreground w-9 text-right">
                            {project.progress ?? 0}%
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full border font-medium ${
                              PROJECT_STATUS_STYLES[project.status] ||
                              "bg-muted text-foreground"
                            }`}
                          >
                            {project.status}
                          </span>
                        </Flex>
                      </Flex>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks" className="mt-4">
            {isLoadingTasks ? (
              <Stack className="gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </Stack>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                {t("tasks.myTasksDesc", { defaultValue: "No tasks yet." })}
              </p>
            ) : (
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  {tasks.map((tk) => {
                    const key = tk.status?.toLowerCase();
                    return (
                      <Flex key={tk.id} className="items-center gap-3 p-4">
                        {TASK_STATUS_ICON[key] || (
                          <CircleDashed className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Box className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tk.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {tk.projectName}
                            {tk.assigneeName ? ` · ${tk.assigneeName}` : ""}
                          </p>
                        </Box>
                        {tk.endDate && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(tk.endDate), "MMM d, yyyy")}
                          </span>
                        )}
                      </Flex>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardContent className="p-6">
                {clientId && <ClientTimeline clientId={clientId} mode="admin" />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files */}
          <TabsContent value="files" className="mt-4">
            {clientId && <ClientMediaCenter clientIdOverride={clientId} />}
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-4">
            {isLoadingInvoices ? (
              <Stack className="gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </Stack>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                {t("clientManagement.viewModal.noContractFile", {
                  defaultValue: "No invoices yet.",
                })}
              </p>
            ) : (
              <Stack className="gap-4">
                {outstandingBalance > 0 && (
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-rose-100 text-rose-600">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-foreground">
                          ${outstandingBalance.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("clientManagement.overview.outstandingBalance", {
                            defaultValue: "Outstanding balance",
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardContent className="p-0 divide-y divide-border">
                    {invoices.map((inv) => (
                      <Flex key={inv.id} className="items-center gap-3 p-4">
                        <Box className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {inv.invoiceNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("projects.dueDate", { defaultValue: "Due" })}:{" "}
                            {format(new Date(inv.dueDate), "MMM d, yyyy")}
                          </p>
                        </Box>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                            inv.status?.toLowerCase() === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {inv.status}
                        </span>
                        <span className="text-sm font-bold text-foreground shrink-0 w-20 text-right">
                          ${parseFloat(inv.amount).toLocaleString()}
                        </span>
                        {inv.pdfUrl && (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </Flex>
                    ))}
                  </CardContent>
                </Card>
              </Stack>
            )}
          </TabsContent>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
};

export default ClientDetailPage;
