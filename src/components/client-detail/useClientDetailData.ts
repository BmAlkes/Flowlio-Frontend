import { useFetchOrganizationClients } from "@/hooks/usefetchclients";
import { useFetchClientProjects } from "@/hooks/useFetchClientProjects";
import { useFetchClientTasks } from "@/hooks/useFetchClientTasks";
import { useFetchClientInvoices } from "@/hooks/useFetchClientInvoices";
import { useFetchClientProposals } from "@/hooks/useFetchClientProposals";
import { useFetchClientMedia } from "@/hooks/usefetchclientmedia";
import { useClientTimeline } from "@/hooks/useCRM";
import { useFetchProjectMilestones } from "@/hooks/useProjectMilestones";
import {
  validDate,
  normalizeStatus,
  summarizeInvoices,
  summarizeTasks,
} from "./client-detail.utils";

export function useClientDetailData(
  clientId: string | undefined,
  organizationId: string | undefined,
) {
  const clientsQuery = useFetchOrganizationClients();
  const projectsQuery = useFetchClientProjects(clientId, organizationId);
  const tasksQuery = useFetchClientTasks(clientId, organizationId);
  const invoicesQuery = useFetchClientInvoices(clientId, organizationId);
  const proposalsQuery = useFetchClientProposals(clientId);
  const activityQuery = useClientTimeline(clientId || "");
  const filesQuery = useFetchClientMedia(
    { clientId },
    { enabled: !!clientId && !!organizationId },
  );
  const client = clientsQuery.data?.data.find((item) => item.id === clientId);
  const projects = projectsQuery.data?.data?.projects || [];
  const tasks = tasksQuery.data?.data?.tasks || [];
  const invoices = invoicesQuery.data?.data?.invoices || [];
  const proposals = proposalsQuery.data?.data?.proposals || [];
  const activity = [...(activityQuery.data || [])].sort(
    (a, b) =>
      (validDate(b.createdAt)?.getTime() || 0) -
      (validDate(a.createdAt)?.getTime() || 0),
  );
  const files = [...(filesQuery.data?.data || [])].sort(
    (a, b) =>
      (validDate(b.createdAt)?.getTime() || 0) -
      (validDate(a.createdAt)?.getTime() || 0),
  );
  const activeProjects = projects
    .filter(
      (project) =>
        !["completed", "cancelled", "archived"].includes(
          normalizeStatus(project.status),
        ),
    )
    .sort(
      (a, b) =>
        (validDate(a.endDate)?.getTime() ?? Infinity) -
        (validDate(b.endDate)?.getTime() ?? Infinity),
    );
  const focusProject = activeProjects[0];
  const milestonesQuery = useFetchProjectMilestones(focusProject?.id);
  const priorityTasks = tasks
    .filter((task) => normalizeStatus(task.status) !== "completed")
    .sort(
      (a, b) =>
        (validDate(a.endDate)?.getTime() ?? Infinity) -
        (validDate(b.endDate)?.getTime() ?? Infinity),
    );
  return {
    client,
    clientsQuery,
    projectsQuery,
    tasksQuery,
    invoicesQuery,
    proposalsQuery,
    activityQuery,
    filesQuery,
    milestonesQuery,
    projects,
    tasks,
    invoices,
    proposals,
    activity,
    files,
    activeProjects,
    focusProject,
    priorityTasks,
    milestones: milestonesQuery.data?.data || [],
    taskSummary: summarizeTasks(tasks),
    invoiceSummary: summarizeInvoices(invoices),
    pendingProposals: proposals.filter((proposal) =>
      ["pending", "sent", "under_review"].includes(
        normalizeStatus(proposal.status),
      ),
    ).length,
  };
}

export type ClientDetailData = ReturnType<typeof useClientDetailData>;
