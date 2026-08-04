import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { format, isPast } from "date-fns";
import {
  ArrowLeft,
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
  ChevronRight,
  MoreVertical,
  Plus,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Active: "bg-green-50 text-green-700 border-green-200",
  Onboarding: "bg-blue-50 text-blue-700 border-blue-200",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-gray-100 text-gray-600 border-gray-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Churned: "bg-rose-50 text-rose-700 border-rose-200",
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
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ongoing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

const INVOICE_STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  overdue: "bg-rose-50 text-rose-700 border-rose-200",
};

const TASK_STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  in_progress: <CircleDot className="h-4 w-4 text-blue-600" />,
  "in progress": <CircleDot className="h-4 w-4 text-blue-600" />,
  todo: <CircleDashed className="h-4 w-4 text-muted-foreground" />,
  "to do": <CircleDashed className="h-4 w-4 text-muted-foreground" />,
};

/** Flat key/value row used in the "Client Overview" info list. */
const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Flex className="items-start justify-between gap-3 py-1.5">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm font-medium text-foreground text-right min-w-0">
      {children}
    </span>
  </Flex>
);

/** "View all →" link that switches to another tab within this page. */
const ViewAllLink = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
  >
    View all
    <ChevronRight className="h-3 w-3" />
  </button>
);

const ClientDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { data: userData } = useUser();
  const organizationId = userData?.user?.organizationId;

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [tab, setTab] = useState("overview");

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

  const recentActivity = useMemo(() => (timeline || []).slice(0, 4), [timeline]);

  const latestInvoice = useMemo(
    () =>
      [...invoices].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0],
    [invoices],
  );

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
  const statusStyle = STATUS_STYLES[client.status] || "bg-muted text-foreground border-border";

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-5 p-6 pb-10">
        {/* Back link */}
        <button
          onClick={() => navigate("/dashboard/client-management")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("clientManagement.title", { defaultValue: "Clients" })}
        </button>

        {/* Header */}
        <Flex className="items-start justify-between gap-4 max-md:flex-col">
          <Flex className="items-start gap-4 min-w-0">
            <Avatar className="h-14 w-14 rounded-2xl shrink-0">
              <AvatarImage src={client.image} />
              <AvatarFallback className="rounded-2xl bg-slate-900 text-white text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Stack className="gap-2 min-w-0">
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
                    className={`h-6 text-xs font-semibold rounded-full px-2.5 border ${statusStyle}`}
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
              <Flex className="items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {client.email}
                  </a>
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
              <Flex className="items-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span>
                  {t("clientManagement.overview.clientSince", { defaultValue: "Client since" })}:{" "}
                  <span className="font-medium text-foreground">
                    {format(new Date(client.createdAt), "MMM d, yyyy")}
                  </span>
                </span>
                {recentActivity[0] && (
                  <span>
                    {t("clientManagement.overview.lastActivity", { defaultValue: "Last activity" })}:{" "}
                    <span className="font-medium text-foreground">
                      {format(new Date(recentActivity[0].createdAt), "MMM d, yyyy")}
                    </span>
                  </span>
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
              size="sm"
              onClick={() =>
                navigate(`/dashboard/project/create-project?clientId=${clientId}`)
              }
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t("clientManagement.overview.newProject", { defaultValue: "New Project" })}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    navigate("/dashboard/client-management/create-client", {
                      state: { mode: "edit", client, focusPortalAccess: true },
                    })
                  }
                >
                  <KeyRound className="h-3.5 w-3.5 mr-2" />
                  {t("clientManagement.grantPortalAccess")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-700"
                  onClick={handleDelete}
                  disabled={deleteClient.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  {t("clientManagement.deleteClient")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Flex>
        </Flex>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-transparent p-0 h-auto gap-6 rounded-none border-b border-border justify-start w-full">
            {[
              ["overview", t("clientManagement.tabs.overview", { defaultValue: "Overview" })],
              ["projects", t("clientManagement.tabs.projects", { defaultValue: "Projects" })],
              ["tasks", t("clientManagement.tabs.tasks", { defaultValue: "Tasks" })],
              ["activity", t("clientManagement.tabs.activity", { defaultValue: "Activity" })],
              ["files", t("clientManagement.tabs.files", { defaultValue: "Files" })],
              ["invoices", t("clientManagement.tabs.invoices", { defaultValue: "Invoices" })],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0.5 pb-3 text-sm text-muted-foreground data-[state=active]:text-foreground font-medium"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
              {/* Client Overview */}
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {t("clientManagement.overview.clientOverview", {
                      defaultValue: "Client Overview",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <InfoRow label={t("clientManagement.overview.status", { defaultValue: "Status" })}>
                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-semibold ${statusStyle}`}>
                      {t(`clientManagement.clientStatuses.${client.status}`, { defaultValue: client.status })}
                    </span>
                  </InfoRow>
                  <InfoRow label={t("table.industry")}>
                    {client.businessIndustry || t("clientManagement.notAvailable")}
                  </InfoRow>
                  <InfoRow label={t("table.email")}>
                    <span className="break-all">{client.email || t("clientManagement.notAvailable")}</span>
                  </InfoRow>
                  <InfoRow label={t("table.vat")}>
                    {client.cpfcnpj || t("clientManagement.notAvailable")}
                  </InfoRow>
                  <InfoRow label={t("clientManagement.viewModal.phoneLabel", { defaultValue: "Phone" })}>
                    {client.phone || t("clientManagement.notAvailable")}
                  </InfoRow>
                  <InfoRow label={t("table.address")}>
                    {client.address || t("clientManagement.notAvailable")}
                  </InfoRow>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5 items-start">
                {/* Active project */}
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      {t("clientManagement.overview.activeProject", {
                        defaultValue: "Active Project",
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
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
                        className="gap-4 cursor-pointer group"
                        onClick={() =>
                          navigate(`/dashboard/project/view/${activeProject.id}`)
                        }
                      >
                        <Flex className="items-center justify-between gap-2">
                          <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                            {activeProject.projectName}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                              PROJECT_STATUS_STYLES[activeProject.status] ||
                              "bg-muted text-foreground"
                            }`}
                          >
                            {activeProject.status}
                          </span>
                        </Flex>
                        <Flex className="items-center gap-5 text-xs text-muted-foreground">
                          {activeProject.startDate && (
                            <span>
                              {t("projects.startDate")}:{" "}
                              <span className="font-medium text-foreground">
                                {format(new Date(activeProject.startDate), "MMM d, yyyy")}
                              </span>
                            </span>
                          )}
                          {activeProject.endDate && (
                            <span>
                              {t("projects.endDate")}:{" "}
                              <span className="font-medium text-foreground">
                                {format(new Date(activeProject.endDate), "MMM d, yyyy")}
                              </span>
                            </span>
                          )}
                        </Flex>
                        <div>
                          <Flex className="items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">
                              {t("clientManagement.overview.overallProgress", { defaultValue: "Overall Progress" })}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {activeProject.progress ?? 0}%
                            </span>
                          </Flex>
                          <Progress value={activeProject.progress ?? 0} />
                        </div>
                      </Stack>
                    )}
                  </CardContent>
                </Card>

                {/* Latest invoice */}
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      {t("clientManagement.overview.latestInvoice", { defaultValue: "Latest Invoice" })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoadingInvoices ? (
                      <Skeleton className="h-20 w-full rounded-lg" />
                    ) : !latestInvoice ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        {t("clientManagement.overview.noInvoices", { defaultValue: "No invoices yet." })}
                      </p>
                    ) : (
                      <Stack className="gap-3">
                        <Flex className="items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {latestInvoice.invoiceNumber}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                              INVOICE_STATUS_STYLES[latestInvoice.status?.toLowerCase()] ||
                              "bg-muted text-foreground"
                            }`}
                          >
                            {latestInvoice.status}
                          </span>
                        </Flex>
                        <p className="text-xs text-muted-foreground">
                          {t("projects.dueDate", { defaultValue: "Due" })}:{" "}
                          {format(new Date(latestInvoice.dueDate), "MMM d, yyyy")}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          ${parseFloat(latestInvoice.amount).toLocaleString()}
                        </p>
                        {latestInvoice.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(latestInvoice.pdfUrl, "_blank")}
                          >
                            {t("clientManagement.overview.viewInvoice", { defaultValue: "View Invoice" })}
                          </Button>
                        )}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tasks overview */}
            <Card className="shadow-none mt-5">
              <CardHeader>
                <CardTitle className="text-sm">
                  {t("clientManagement.overview.tasksOverview", { defaultValue: "Tasks Overview" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingTasks ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        icon: ListTodo,
                        value: taskCounts.total,
                        label: t("clientManagement.overview.totalTasks", { defaultValue: "Total Tasks" }),
                        tint: "bg-blue-50 text-blue-600",
                      },
                      {
                        icon: CheckCircle2,
                        value: taskCounts.completed,
                        label: t("clientManagement.overview.completed", { defaultValue: "Completed" }),
                        tint: "bg-emerald-50 text-emerald-600",
                      },
                      {
                        icon: CircleDot,
                        value: taskCounts.inProgress,
                        label: t("clientManagement.overview.inProgress", { defaultValue: "In Progress" }),
                        tint: "bg-amber-50 text-amber-600",
                      },
                      {
                        icon: CircleDashed,
                        value: taskCounts.pending,
                        label: t("clientManagement.overview.pending", { defaultValue: "Pending" }),
                        tint: "bg-rose-50 text-rose-600",
                      },
                    ].map((stat) => (
                      <Stack
                        key={stat.label}
                        className="items-center text-center gap-2 rounded-xl bg-muted/40 p-4"
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.tint}`}>
                          <stat.icon className="h-4 w-4" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </Stack>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent activity + Upcoming deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
              <Card className="shadow-none">
                <CardHeader>
                  <Flex className="items-center justify-between">
                    <CardTitle className="text-sm">
                      {t("clientManagement.overview.recentActivity", { defaultValue: "Recent Activity" })}
                    </CardTitle>
                    <ViewAllLink onClick={() => setTab("activity")} />
                  </Flex>
                </CardHeader>
                <CardContent className="pt-0">
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
                        <Box key={item.id} className="py-3 first:pt-0">
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

              <Card className="shadow-none">
                <CardHeader>
                  <Flex className="items-center justify-between">
                    <CardTitle className="text-sm">
                      {t("clientManagement.overview.upcomingDeadlines", {
                        defaultValue: "Upcoming Deadlines",
                      })}
                    </CardTitle>
                    <ViewAllLink onClick={() => setTab("projects")} />
                  </Flex>
                </CardHeader>
                <CardContent className="pt-0">
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
                            className="items-center justify-between py-3 first:pt-0 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
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
            </div>
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects" className="mt-5">
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
                    className="shadow-none cursor-pointer hover:border-blue-300 transition-colors"
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
          <TabsContent value="tasks" className="mt-5">
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
              <Card className="shadow-none">
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
          <TabsContent value="activity" className="mt-5">
            <Card className="shadow-none">
              <CardContent className="p-6">
                {clientId && <ClientTimeline clientId={clientId} mode="admin" />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files */}
          <TabsContent value="files" className="mt-5">
            {clientId && <ClientMediaCenter clientIdOverride={clientId} />}
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-5">
            {isLoadingInvoices ? (
              <Stack className="gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </Stack>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                {t("clientManagement.overview.noInvoices", { defaultValue: "No invoices yet." })}
              </p>
            ) : (
              <Stack className="gap-4">
                {outstandingBalance > 0 && (
                  <Card className="shadow-none">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-rose-50 text-rose-600">
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
                <Card className="shadow-none">
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
                          className={`text-xs px-2 py-1 rounded-full border font-medium shrink-0 ${
                            INVOICE_STATUS_STYLES[inv.status?.toLowerCase()] ||
                            "bg-muted text-foreground"
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
