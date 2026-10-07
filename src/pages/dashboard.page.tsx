import { BarChartComponent } from "@/components/admin/dashboard/barchart/barchart";
import { RecentActivities } from "@/components/admin/dashboard/recentactivities";
import { OngoingTasks } from "@/components/admin/dashboard/ongoingtasks";
import { type Stat } from "@/components/admin/dashboard/stats";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AttentionPreview } from "@/components/admin/dashboard/AttentionPreview";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { ProjectStatusPieChart } from "@/components/admin/dashboard/barchart/piechart";

import { useFetchOrganizationTotalClients } from "@/hooks/useFetchOrganizationTotalClients";
import { useFetchOrganizationActiveProjects } from "@/hooks/useFetchOrganizationActiveProjects";
import { useFetchOrganizationWeeklyHoursTracked } from "@/hooks/useFetchOrganizationWeeklyHoursTracked";
import { useFetchOrganizationPendingTasks } from "@/hooks/useFetchOrganizationPendingTasks";
import { useFetchOrganizationCompletedTasks } from "@/hooks/useFetchOrganizationCompletedTasks";
import {
  useFetchProjectStatusData,
  transformToPieChartData,
} from "@/hooks/useFetchProjectStatusData";
import { formatHours } from "@/utils/timeFormat";
const img1 = "/dashboard/1.svg";
const img2 = "/dashboard/2.svg";
const img3 = "/dashboard/3.svg";
const img4 = "/dashboard/4.svg";
const Img1 = "/dashboard/prostat1.svg";
const Img2 = "/dashboard/prostat2.svg";
const Img3 = "/dashboard/projstat3.svg";
import { DemoPasswordChangeModal } from "@/components/dempasswordchangemodal";
import { TeamProductivityChart } from "@/components/admin/dashboard/barchart/teamproductivitychart";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useuserprofile";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { FollowUpWidget } from "@/components/admin/dashboard/FollowUpWidget";
import { ProjectRiskAlertsWidget } from "@/components/admin/dashboard/ProjectRiskAlertsWidget";
import { AITokenUsageWidget } from "@/components/user section/AITokenUsageWidget";
import { useHasFeatureAccess } from "@/hooks/usePlanAccess";

const DashboardPage = () => {
  const { t } = useTranslation();
  document.title = `${t("dashboard.title")} - Flowlio`;

  const { data: userProfile, refetch } = useUserProfile();
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      userProfile?.data?.demoOrgInfo?.isDemo &&
      !userProfile?.data?.demoOrgInfo?.passwordChanged
    ) {
      setShowPasswordChangeModal(true);
    } else {
      setShowPasswordChangeModal(false);
    }
  }, [userProfile]);

  const user = userProfile?.data;
  const manager = !!user && (["superadmin", "subadmin"].includes(user.role) || (user.role === "user" && !!(user.isOrganizationOwner || user.isOrganizationManager)));
  const { data: totalClientsResponse, isError: clientsError, refetch: reloadClients } = useFetchOrganizationTotalClients(manager);
  const { data: activeProjectsResponse, isError: projectsError, refetch: reloadProjects } = useFetchOrganizationActiveProjects();
  const { data: weeklyHoursResponse, isError: hoursError, refetch: reloadHours } = useFetchOrganizationWeeklyHoursTracked();
  const { data: pendingTasksResponse, isError: tasksError, refetch: reloadTasks } = useFetchOrganizationPendingTasks();
  const { data: completedTasksResponse } = useFetchOrganizationCompletedTasks();
  const { data: projectStatusResponse } = useFetchProjectStatusData();
  const { data: aiFeatureAccess } = useHasFeatureAccess("aiAssist");
  const hasAIAssist = aiFeatureAccess?.data?.hasAccess ?? false;
  const [showReports, setShowReports] = useState(false);


  const totalClients = totalClientsResponse?.data?.totalClients;
  const activeProjects = activeProjectsResponse?.data?.activeProjects;
  const weeklyHours = weeklyHoursResponse?.data?.weeklyHours;
  const pendingTasks = pendingTasksResponse?.data?.pendingTasks;
  const completedTasks = completedTasksResponse?.data?.completedTasks;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";
  const firstName = userProfile?.data?.name?.split(" ")[0] || "";

  const stats: Stat[] = [
    {
      link: "/dashboard/client-management",
      title: t("dashboard.totalClients"),
      description: t("dashboard.activeUsersDesc"),
      icon: img1,
      count: totalClients == null ? "—" : String(totalClients),
    },
    {
      link: "/dashboard/project",
      title: t("dashboard.activeProjects"),
      description: t("dashboard.ongoingProjectsDesc"),
      icon: img2,
      count: activeProjects == null ? "—" : String(activeProjects),
    },
    {
      link: "/dashboard/time-tracking",
      title: t("dashboard.hoursTracked"),
      description: t("dashboard.timeLoggedDesc"),
      icon: img3,
      count: weeklyHours == null ? "—" : formatHours(weeklyHours),
    },
    {
      link: "/dashboard/task-management",
      title: t("dashboard.pendingTasks"),
      description: t("dashboard.tasksNotCompletedDesc"),
      icon: img4,
      count: pendingTasks == null ? "—" : String(pendingTasks),
    },
    {
      link: "/dashboard/task-management",
      title: t("dashboard.tasksCompleted"),
      description: t("dashboard.tasksCompletedDesc"),
      icon: img2,
      count: completedTasks == null ? "—" : String(completedTasks),
    },
  ];

  const pieChartData = projectStatusResponse?.data
    ? transformToPieChartData(projectStatusResponse.data)
    : [
        { name: t("dashboard.ongoing"), value: 0, icon: Img2, color: "#6366f1" },
        { name: t("dashboard.delayed"), value: 0, icon: Img3, color: "#f43f5e" },
        { name: t("dashboard.finished"), value: 0, icon: Img1, color: "#10b981" },
      ];

  return (
    <>
      <Stack className="pt-5 gap-5 px-2">

        {/* Greeting header */}
        <div className="px-1">
          <h1 className="text-2xl font-bold text-foreground">
            {t(`dashboard.${greetingKey}`)}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("dashboard.operationalSubtitle")}
          </p>
        </div>

        <nav aria-label={t("dashboard.quickActions")} className="flex flex-wrap items-center gap-3 rounded-xl bg-[#1797B9] p-4 text-white">
          <span className="text-sm font-semibold">{t("dashboard.quickActions")}</span>
          {[["/dashboard/time-tracking", "logTime"], ...(manager ? [["/dashboard/client-management/create-client", "newClient"], ["/dashboard/project/create-project", "newProject"]] : [])].map(([path, label]) => <Link key={path} to={path} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">{t(`dashboard.${label}`)}</Link>)}
        </nav>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.slice(manager ? 0 : 1, 4).map(stat => <div key={stat.link} className="rounded-xl border border-border bg-card p-5"><dt className="text-xs font-medium text-muted-foreground">{stat.title}</dt><dd className="mt-3 text-3xl font-semibold tabular-nums">{stat.count}</dd><p className="mt-2 text-xs text-muted-foreground">{stat.description}</p><Link className="mt-3 inline-block text-xs font-medium text-brand-ink hover:underline" to={stat.link}>{t("dashboard.openSection")}</Link></div>)}</dl>
        {((manager && clientsError) || projectsError || hoursError || tasksError) && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4 text-sm"><p>{t("attention.error")}</p><Button variant="outline" onClick={() => { if (manager) void reloadClients(); void reloadProjects(); void reloadHours(); void reloadTasks(); }}>{t("attention.refresh")}</Button></div>}
        {manager && <AttentionPreview />}
        <OngoingTasks />
        <Button variant="outline" aria-expanded={showReports} onClick={() => setShowReports(!showReports)}>{t("dashboard.reportsAndActivity")}</Button>
        {showReports && <>
        <Flex className="max-[950px]:flex-col items-start gap-3">
          <Stack className="flex-1 min-w-0 gap-3">
            <BarChartComponent />

            {(userProfile?.data?.role === "superadmin" ||
              userProfile?.data?.role === "subadmin" ||
              userProfile?.data?.isOrganizationOwner ||
              userProfile?.data?.isOrganizationManager) && (
              <TeamProductivityChart />
            )}
          </Stack>

          <Stack className="w-[300px] shrink-0 max-[950px]:w-full items-start gap-3">
            <ProjectStatusPieChart
              className="w-full"
              data={pieChartData}
              title={t("dashboard.projectStatus")}
            />
            {(userProfile?.data?.role === "superadmin" ||
              userProfile?.data?.role === "subadmin" ||
              userProfile?.data?.isOrganizationOwner ||
              userProfile?.data?.isOrganizationManager) && (
              <ProjectRiskAlertsWidget />
            )}
            <FollowUpWidget />
            <RecentActivities className="w-full" />
          </Stack>
        </Flex>

        {hasAIAssist && <AITokenUsageWidget />}
        </>}

        <DemoPasswordChangeModal
          open={showPasswordChangeModal}
          onOpenChange={(open) => {
            setShowPasswordChangeModal(false);
            if (!open) {
              queryClient.invalidateQueries({ queryKey: ["user-profile"] });
              refetch();
            }
          }}
        />

      </Stack>
    </>
  );
};

export default DashboardPage;
