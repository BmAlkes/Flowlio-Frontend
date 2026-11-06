import { BarChartComponent } from "@/components/admin/dashboard/barchart/barchart";
import { RecentActivities } from "@/components/admin/dashboard/recentactivities";
import { OngoingTasks } from "@/components/admin/dashboard/ongoingtasks";
import { HomeMetrics } from "@/components/admin/dashboard/HomeMetrics";
import { LioBrief } from "@/components/admin/dashboard/LioBrief";
import { WeekCalendar, weekRange } from "@/components/admin/dashboard/WeekCalendar";
import { useFetchCalendarEvents } from "@/hooks/usefetchcalendarevents";
import { WatchPanel } from "@/components/admin/dashboard/WatchPanel";
import { taskUrgency } from "@/components/admin/dashboard/home-insights";
import { Plus, Clock3 } from "lucide-react";
import "./dashboard.css";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ProjectStatusPieChart } from "@/components/admin/dashboard/barchart/piechart";

import { useFetchOrganizationTotalClients } from "@/hooks/useFetchOrganizationTotalClients";
import { useFetchOrganizationActiveProjects } from "@/hooks/useFetchOrganizationActiveProjects";
import { useFetchOrganizationWeeklyHoursTracked } from "@/hooks/useFetchOrganizationWeeklyHoursTracked";
import { useFetchOrganizationPendingTasks } from "@/hooks/useFetchOrganizationPendingTasks";
import { useFetchOrganizationCompletedTasks } from "@/hooks/useFetchOrganizationCompletedTasks";
import { useFetchOngoingTasks } from "@/hooks/useFetchOngoingTasks";
import { useFollowUpsDashboard } from "@/hooks/useCRM";
import { useProjectRiskAlerts } from "@/hooks/useProjectRiskAlerts";
import {
  useFetchProjectStatusData,
  transformToPieChartData,
} from "@/hooks/useFetchProjectStatusData";
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
  const { t, i18n } = useTranslation();
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
  const { data: ongoingResponse } = useFetchOngoingTasks();
  const followUps = useFollowUpsDashboard(manager);
  const risks = useProjectRiskAlerts();
  const week = weekRange(new Date(), i18n.language);
  const { data: calendarEvents } = useFetchCalendarEvents({ startDate: week.start.toISOString(), endDate: week.end.toISOString() });
  const { data: aiFeatureAccess } = useHasFeatureAccess("aiAssist");
  const hasAIAssist = aiFeatureAccess?.data?.hasAccess ?? false;

  const tasks = ongoingResponse?.data ?? undefined;
  const status = projectStatusResponse?.data;
  const urgency = taskUrgency(tasks ?? []);
  const weeklyHours = weeklyHoursResponse?.data?.weeklyHours;

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";
  const firstName = userProfile?.data?.name?.split(" ")[0] || "";

  const pieChartData = status
    ? transformToPieChartData(status)
    : [
        { name: t("dashboard.ongoing"), value: 0, icon: Img2, color: "#F2BC3F" },
        { name: t("dashboard.delayed"), value: 0, icon: Img3, color: "#EE7A5C" },
        { name: t("dashboard.finished"), value: 0, icon: Img1, color: "#14A7D4" },
      ];
  const showSide = manager || hasAIAssist;

  return (
    <div className="home-dashboard mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-2 py-6 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-muted-foreground first-letter:uppercase">{new Date().toLocaleDateString(i18n.language, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
            {t(`dashboard.${greetingKey}`)}{firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <nav aria-label={t("dashboard.quickActions")} className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-11 rounded-[10px] bg-card"><Link to="/dashboard/time-tracking"><Clock3 className="size-4" aria-hidden="true" />{t("dashboard.logTime")}</Link></Button>
          {manager && <Button asChild className="home-button-primary h-11 rounded-[10px] px-4"><Link to="/dashboard/project/create-project"><Plus className="size-4" aria-hidden="true" />{t("dashboard.newProject")}</Link></Button>}
        </nav>
      </div>

      <LioBrief tasks={tasks} weeklyHours={weeklyHours} delayedProjects={status ? Number(status.delayed) : undefined} canAsk={hasAIAssist} />

      <HomeMetrics manager={manager} numbers={{
        clients: totalClientsResponse?.data?.totalClients,
        activeProjects: activeProjectsResponse?.data?.activeProjects,
        weeklyHours,
        pendingTasks: pendingTasksResponse?.data?.pendingTasks,
        completedTasks: completedTasksResponse?.data?.completedTasks,
        projects: status ? { ongoing: Number(status.ongoing), delayed: Number(status.delayed), finished: Number(status.finished), total: Number(status.total) } : undefined,
        overdue: urgency.overdue,
        dueToday: urgency.dueToday,
      }} />
      {((manager && clientsError) || projectsError || hoursError || tasksError) && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4 text-sm"><p>{t("attention.error")}</p><Button variant="outline" onClick={() => { if (manager) void reloadClients(); void reloadProjects(); void reloadHours(); void reloadTasks(); }}>{t("attention.refresh")}</Button></div>}

      <WeekCalendar tasks={tasks ?? []} followUps={manager ? followUps.data : undefined} events={calendarEvents?.data ?? []} />

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <BarChartComponent />
        <ProjectStatusPieChart className="home-panel" data={pieChartData} title={t("dashboard.projectStatus")} unavailable={!status} />
      </div>

      <div className={`grid items-start gap-5 ${showSide ? "xl:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
        <div className="flex min-w-0 flex-col gap-5">
          <OngoingTasks />
          {manager && <FollowUpWidget className="home-panel" />}
        </div>
        {showSide && <div className="flex min-w-0 flex-col gap-5">
          {manager && <TeamProductivityChart className="home-panel" />}
          {manager && <RecentActivities />}
          {manager && <WatchPanel />}
          {manager && !!risks.data?.data?.length && <ProjectRiskAlertsWidget className="home-panel" />}
          {hasAIAssist && <AITokenUsageWidget className="home-panel" />}
        </div>}
      </div>

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
    </div>
  );
};

export default DashboardPage;
