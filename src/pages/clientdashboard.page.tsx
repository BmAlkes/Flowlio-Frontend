import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  FolderOpen,
  FileText,
  Receipt,
  ListTodo,
  ArrowRight,
  CalendarClock,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { axios } from "@/configs/axios.config";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { PageWrapper } from "@/components/common/pagewrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/providers/user.provider";
import { useFetchClientProjects } from "@/hooks/useFetchClientProjects";
import { useFetchClientTasks } from "@/hooks/useFetchClientTasks";
import { useFetchClientInvoices, type ClientInvoice } from "@/hooks/useFetchClientInvoices";
import { useClientTimeline } from "@/hooks/useCRM";
import { useTranslation } from "react-i18next";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
  onClick?: () => void;
}

const StatCard = ({ icon: Icon, label, value, accent, onClick }: StatCardProps) => (
  <Card
    className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : undefined}
    onClick={onClick}
  >
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const ACTIVITY_LABEL: Record<string, string> = {
  note: "sent a message",
  call: "logged a call",
  email: "logged an email",
  meeting: "logged a meeting",
  status_change: "updated status",
  temperature_change: "updated priority",
};

const ClientDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: userData } = useUser();
  const clientId = userData?.user?.clientId;
  const organizationId = userData?.user?.organizationId;

  const { data: projectsResponse, isLoading: projectsLoading } = useFetchClientProjects(
    clientId || undefined,
    organizationId || undefined,
  );
  const { data: tasksResponse, isLoading: tasksLoading } = useFetchClientTasks(
    clientId || undefined,
    organizationId || undefined,
  );
  const { data: invoicesResponse, isLoading: invoicesLoading } = useFetchClientInvoices(
    clientId || undefined,
    organizationId || undefined,
  );
  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ["client-proposals"],
    queryFn: async () => {
      const res = await axios.get("/proposals/client");
      return res.data?.data as Array<{ id: string; status: string }>;
    },
  });
  const { data: timeline, isLoading: timelineLoading } = useClientTimeline(clientId || "");

  const projects = projectsResponse?.data?.projects || [];
  const tasks = tasksResponse?.data?.tasks || [];
  const invoices: ClientInvoice[] = invoicesResponse?.data?.invoices || [];

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status !== "completed"),
    [projects],
  );
  const openTasks = useMemo(
    () => tasks.filter((task) => task.status?.toLowerCase() !== "completed"),
    [tasks],
  );
  const pendingProposals = useMemo(
    () => (proposals || []).filter((p) => p.status === "pending"),
    [proposals],
  );
  const outstandingInvoices = useMemo(
    () => invoices.filter((inv) => inv.status?.toLowerCase() !== "paid"),
    [invoices],
  );
  const outstandingBalance = useMemo(
    () => outstandingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0),
    [outstandingInvoices],
  );

  const upcomingDeadlines = useMemo(
    () =>
      [...activeProjects]
        .filter((p) => !!p.endDate)
        .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
        .slice(0, 5),
    [activeProjects],
  );

  const recentActivity = useMemo(() => (timeline || []).slice(0, 5), [timeline]);

  const isLoading =
    projectsLoading || tasksLoading || invoicesLoading || proposalsLoading || timelineLoading;

  const firstName = userData?.user?.name?.split(" ")[0] || "";

  return (
    <PageWrapper className="mt-6">
      <Stack className="gap-1 p-6">
        <h1 className="text-3xl max-sm:text-xl font-medium text-foreground">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your projects, tasks and billing.
        </p>
      </Stack>

      <Box className="px-6 space-y-6 pb-10">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={FolderOpen}
              label="Active Projects"
              value={activeProjects.length}
              accent="bg-indigo-100 text-indigo-600"
              onClick={() => navigate("/clients/projects")}
            />
            <StatCard
              icon={ListTodo}
              label="Open Tasks"
              value={openTasks.length}
              accent="bg-sky-100 text-sky-600"
              onClick={() => navigate("/clients/tasks")}
            />
            <StatCard
              icon={FileText}
              label="Pending Proposals"
              value={pendingProposals.length}
              accent="bg-amber-100 text-amber-600"
              onClick={() => navigate("/clients/proposals")}
            />
            <StatCard
              icon={Receipt}
              label="Outstanding Balance"
              value={`$${outstandingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              accent="bg-rose-100 text-rose-600"
              onClick={() => navigate("/clients/invoices")}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Stack className="gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </Stack>
              ) : upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No upcoming deadlines.
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
                        onClick={() => navigate(`/clients/projects/view/${project.id}`)}
                      >
                        <Box className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {project.projectName}
                          </p>
                          <p className={`text-xs flex items-center gap-1 mt-0.5 ${overdue ? "text-rose-600" : "text-muted-foreground"}`}>
                            {overdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {overdue ? "Overdue" : "Due"} {format(due, "MMM d, yyyy")}
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
          <Card>
            <CardHeader>
              <Flex className="items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <button
                  onClick={() => navigate("/clients/activity")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  {t("appSidebar.messages", "Messages")}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </Flex>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Stack className="gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </Stack>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No recent activity yet.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {recentActivity.map((item) => (
                    <Box key={item.id} className="py-3">
                      <Flex className="items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {item.user?.name || "Team"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ACTIVITY_LABEL[item.type] || item.type}
                        </span>
                      </Flex>
                      <p className="text-sm text-foreground/90 mt-0.5 line-clamp-2">{item.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </Box>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Box>
    </PageWrapper>
  );
};

export default ClientDashboardPage;
