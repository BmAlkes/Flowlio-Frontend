import { BarChartComponent } from "@/components/admin/dashboard/barchart/barchart";
import { RecentActivities } from "@/components/admin/dashboard/recentactivities";
import { OngoingTasks } from "@/components/admin/dashboard/ongoingtasks";
import { type Stat } from "@/components/admin/dashboard/stats";
import { HomeMetrics } from "@/components/admin/dashboard/HomeMetrics";
import { Plus, Clock3 } from "lucide-react";
import "./dashboard.css";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AttentionPreview } from "@/components/admin/dashboard/AttentionPreview";
import { Stack } from "@/components/ui/stack";
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
      <Stack className="home-dashboard mx-auto w-full max-w-[1600px] gap-5 px-2 py-6 sm:px-4">

        {/* Greeting header */}
        <div className="flex flex-wrap items-end justify-between gap-4 px-1 pb-1">
          <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-ink">{t("dashboard.title")}</p>
          <h1 className="text-2xl font-bold text-foreground">
            {t(`dashboard.${greetingKey}`)}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("dashboard.greetingSubtitle")}
          </p>
          </div>
          <nav aria-label={t("dashboard.quickActions")} className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 rounded-lg bg-card"><Link to="/dashboard/time-tracking"><Clock3 className="size-4" aria-hidden="true" />{t("dashboard.logTime")}</Link></Button>
            {manager && <Button asChild className="h-10 rounded-lg bg-[#1797B9] text-white hover:bg-[#117e9b]"><Link to="/dashboard/project/create-project"><Plus className="size-4" aria-hidden="true" />{t("dashboard.newProject")}</Link></Button>}
          </nav>
        </div>

        <HomeMetrics stats={stats} manager={manager} />
        {((manager && clientsError) || projectsError || hoursError || tasksError) && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4 text-sm"><p>{t("attention.error")}</p><Button variant="outline" onClick={() => { if (manager) void reloadClients(); void reloadProjects(); void reloadHours(); void reloadTasks(); }}>{t("attention.refresh")}</Button></div>}
        <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <BarChartComponent className="home-panel min-w-0" />
          <ProjectStatusPieChart className="home-panel" data={pieChartData} title={t("dashboard.projectStatus")} unavailable={!projectStatusResponse?.data} />
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Stack className="min-w-0 gap-5">
            <OngoingTasks className="home-panel" />
            {manager && <TeamProductivityChart className="home-panel" />}
          </Stack>
          {manager && <Stack className="min-w-0 gap-5">
            <RecentActivities className="home-panel" />
            <ProjectRiskAlertsWidget />
            <FollowUpWidget />
          </Stack>}
        </div>
        {manager && <AttentionPreview />}
        {hasAIAssist && <AITokenUsageWidget />}

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
