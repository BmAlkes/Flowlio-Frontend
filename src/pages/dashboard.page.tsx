import { BarChartComponent } from "@/components/admin/dashboard/barchart/barchart";
import { RecentActivities } from "@/components/admin/dashboard/recentactivities";
import { OngoingTasks } from "@/components/admin/dashboard/ongoingtasks";
import { Stat, Stats } from "@/components/admin/dashboard/stats";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { ProjectStatusPieChart } from "@/components/admin/dashboard/barchart/piechart";
import TimeModal from "@/components/timemodal";
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
import img1 from "/dashboard/1.svg";
import img2 from "/dashboard/2.svg";
import img3 from "/dashboard/3.svg";
import img4 from "/dashboard/4.svg";
import Img1 from "/dashboard/prostat1.svg";
import Img2 from "/dashboard/prostat2.svg";
import Img3 from "/dashboard/projstat3.svg";
import { DemoPasswordChangeModal } from "@/components/dempasswordchangemodal";
import { TeamProductivityChart } from "@/components/admin/dashboard/barchart/teamproductivitychart";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useuserprofile";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardAIBot } from "@/components/ai assist/DashboardAIBot";
import { DashboardSkeleton, SkeletonWrapper } from "@/components/skeletons";
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

  const { data: totalClientsResponse, isLoading: isLoadingClients, isFetching: isFetchingClients } = useFetchOrganizationTotalClients();
  const { data: activeProjectsResponse, isLoading: isLoadingProjects, isFetching: isFetchingProjects } = useFetchOrganizationActiveProjects();
  const { data: weeklyHoursResponse, isLoading: isLoadingHours, isFetching: isFetchingHours } = useFetchOrganizationWeeklyHoursTracked();
  const { data: pendingTasksResponse, isLoading: isLoadingTasks, isFetching: isFetchingTasks } = useFetchOrganizationPendingTasks();
  const { data: completedTasksResponse } = useFetchOrganizationCompletedTasks();
  const { data: projectStatusResponse, isLoading: isLoadingStatus, isFetching: isFetchingStatus } = useFetchProjectStatusData();
  const { data: aiFeatureAccess } = useHasFeatureAccess("aiAssist");
  const hasAIAssist = aiFeatureAccess?.data?.hasAccess ?? false;

  const isAnyLoading =
    isLoadingClients || isLoadingProjects || isLoadingHours || isLoadingTasks || isLoadingStatus ||
    isFetchingClients || isFetchingProjects || isFetchingHours || isFetchingTasks || isFetchingStatus;

  const totalClients = totalClientsResponse?.data?.totalClients ?? 0;
  const activeProjects = activeProjectsResponse?.data?.activeProjects ?? 0;
  const weeklyHours = weeklyHoursResponse?.data?.weeklyHours ?? 0;
  const pendingTasks = pendingTasksResponse?.data?.pendingTasks ?? 0;
  const completedTasks = completedTasksResponse?.data?.completedTasks ?? 0;

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
      count: String(totalClients),
    },
    {
      link: "/dashboard/project",
      title: t("dashboard.activeProjects"),
      description: t("dashboard.ongoingProjectsDesc"),
      icon: img2,
      count: String(activeProjects),
    },
    {
      link: "/dashboard/time-tracking",
      title: t("dashboard.hoursTracked"),
      description: t("dashboard.timeLoggedDesc"),
      icon: img3,
      count: formatHours(weeklyHours),
    },
    {
      link: "/dashboard/task-management",
      title: t("dashboard.pendingTasks"),
      description: t("dashboard.tasksNotCompletedDesc"),
      icon: img4,
      count: String(pendingTasks),
    },
    {
      link: "/dashboard/task-management",
      title: t("dashboard.tasksCompleted"),
      description: t("dashboard.tasksCompletedDesc"),
      icon: img2,
      count: String(completedTasks),
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
    <SkeletonWrapper
      isLoading={isAnyLoading}
      skeleton={<DashboardSkeleton />}
    >
      {/* Gradient background — makes glassmorphism visible */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 right-1/3 w-[600px] h-[400px] bg-blue-400/20 dark:bg-blue-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[400px] bg-violet-400/15 dark:bg-violet-500/12 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/15 dark:bg-cyan-500/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-emerald-400/12 dark:bg-emerald-500/10 rounded-full blur-[80px]" />
      </div>

      <Stack className="pt-5 gap-4 px-2">

        {/* Greeting header */}
        <div className="px-1">
          <h1 className="text-2xl font-bold text-foreground">
            {t(`dashboard.${greetingKey}`)}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("dashboard.greetingSubtitle")}
          </p>
        </div>

        {hasAIAssist && <AITokenUsageWidget />}
        <Stats stats={stats} />
        <Flex className="max-[950px]:flex-col items-start gap-3">
          <Stack className="flex-1 min-w-0 gap-3">
            <BarChartComponent />
            <OngoingTasks />
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

        <TimeModal />

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

        <DashboardAIBot />
      </Stack>
    </SkeletonWrapper>
  );
};

export default DashboardPage;
