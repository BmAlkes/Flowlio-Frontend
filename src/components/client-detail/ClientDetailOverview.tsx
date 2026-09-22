import {
  ArrowUpRight,
  Check,
  CircleAlert,
  FolderOpen,
  ListChecks,
  Receipt,
  FileCheck2,
  Paperclip,
  MessagesSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUpdateMilestone } from "@/hooks/useProjectMilestones";
import { toast } from "sonner";
import type { ClientDetailData } from "./useClientDetailData";
import { Section, ResourceContent, type ResourceState } from "./ClientDetailUI";
import {
  ProjectList,
  TaskList,
  InvoiceList,
  ProposalList,
  FileList,
  ActivityList,
} from "./ClientDetailLists";

export function ClientDetailOverview({
  data,
  onTab,
}: {
  data: ClientDetailData;
  onTab: (tab: string) => void;
}) {
  const { t } = useTranslation();
  const updateMilestone = useUpdateMilestone();
  const metric = (state: ResourceState, value: string | number) =>
    state.isLoading || state.isError ? "—" : value;
  const metrics = [
    {
      tab: "projects",
      icon: FolderOpen,
      label: t("clientDetail.activeProjects"),
      value: metric(data.projectsQuery, data.activeProjects.length),
    },
    {
      tab: "tasks",
      icon: ListChecks,
      label: t("clientDetail.tasksCompleted"),
      value: metric(
        data.tasksQuery,
        `${data.taskSummary.completed} / ${data.taskSummary.total}`,
      ),
    },
    {
      tab: "proposals",
      icon: FileCheck2,
      label: t("clientDetail.pendingProposals"),
      value: metric(data.proposalsQuery, data.pendingProposals),
    },
    {
      tab: "invoices",
      icon: Receipt,
      label: t("clientDetail.openInvoices"),
      value: metric(data.invoicesQuery, data.invoiceSummary.open),
    },
  ];
  return (
    <div className="cd-overview">
      <div className="cd-metrics">
        {metrics.map(({ tab, icon: Icon, label, value }) => (
          <button key={tab} onClick={() => onTab(tab)} className={`cd-metric cd-metric-${tab}`}>
            <span className="cd-metric-top">
              <span className="cd-metric-icon"><Icon size={20} /></span>
              <ArrowUpRight
                size={13}
                className="cd-metric-arrow rtl:-scale-x-100"
              />
            </span>
            <strong>
              <bdi dir="ltr">{value}</bdi>
            </strong>
            <span className="cd-metric-label">{label}</span>
          </button>
        ))}
      </div>
      <div className="cd-overview-columns">
        <div className="cd-column">
          <Section
            icon={FolderOpen}
            title={t("clientDetail.delivery")}
            subtitle={t("clientDetail.deliveryDescription")}
            action={() => onTab("projects")}
          >
            <ResourceContent
              state={data.projectsQuery}
              empty={
                !data.activeProjects.length
                  ? t("clientDetail.noActiveProjects")
                  : undefined
              }
            >
              <ProjectList projects={data.activeProjects.slice(0, 3)} />
              {data.focusProject && (
                <div className="cd-milestones">
                  <p className="cd-eyebrow">
                    {t("clientDetail.milestones")} ·{" "}
                    {data.focusProject.projectName}
                  </p>
                  <ResourceContent
                    state={data.milestonesQuery}
                    empty={
                      !data.milestones.length
                        ? t("clientDetail.noMilestones")
                        : undefined
                    }
                  >
                    {data.milestones.slice(0, 4).map((milestone) => (
                      <button
                        key={milestone.id}
                        className="cd-milestone"
                        role="checkbox"
                        aria-checked={milestone.status === "completed"}
                        disabled={updateMilestone.isPending}
                        onClick={() =>
                          updateMilestone.mutate(
                            {
                              projectId: data.focusProject!.id,
                              milestoneId: milestone.id,
                              data: {
                                status:
                                  milestone.status === "completed"
                                    ? "pending"
                                    : "completed",
                              },
                            },
                            {
                              onError: () =>
                                toast.error(t("clientDetail.updateError")),
                            },
                          )
                        }
                      >
                        <span
                          className={`cd-milestone-check ${milestone.status === "completed" ? "is-complete" : ""}`}
                        >
                          {milestone.status === "completed" && (
                            <Check size={12} />
                          )}
                        </span>
                        <span
                          className={
                            milestone.status === "completed"
                              ? "cd-completed"
                              : ""
                          }
                        >
                          {milestone.title}
                        </span>
                      </button>
                    ))}
                  </ResourceContent>
                </div>
              )}
            </ResourceContent>
          </Section>
          <Section
            icon={ListChecks}
            tone="green"
            title={t("clientDetail.nextTasks")}
            action={() => onTab("tasks")}
          >
            {!data.tasksQuery.isError &&
              !data.tasksQuery.isLoading &&
              data.taskSummary.overdue > 0 && (
                <p className="cd-attention">
                  <CircleAlert size={15} />
                  {t("clientDetail.overdueTasks", {
                    count: data.taskSummary.overdue,
                  })}
                </p>
              )}
            <ResourceContent
              state={data.tasksQuery}
              empty={
                !data.priorityTasks.length
                  ? t("clientDetail.noPendingTasks")
                  : undefined
              }
            >
              <TaskList tasks={data.priorityTasks.slice(0, 4)} />
            </ResourceContent>
          </Section>
          <Section
            icon={Paperclip}
            title={t("clientDetail.recentFiles")}
            action={() => onTab("files")}
          >
            <ResourceContent
              state={data.filesQuery}
              empty={!data.files.length ? t("clientDetail.noFiles") : undefined}
            >
              <FileList files={data.files.slice(0, 3)} />
            </ResourceContent>
          </Section>
        </div>
        <div className="cd-column">
          <Section
            icon={FileCheck2}
            tone="purple"
            title={t("clientDetail.proposals")}
            subtitle={t("clientDetail.proposalsDescription")}
            action={() => onTab("proposals")}
          >
            <ResourceContent
              state={data.proposalsQuery}
              empty={
                !data.proposals.length
                  ? t("clientDetail.noProposals")
                  : undefined
              }
            >
              <ProposalList proposals={data.proposals.slice(0, 2)} />
            </ResourceContent>
          </Section>
          <Section
            icon={Receipt}
            tone="amber"
            title={t("clientDetail.billing")}
            action={() => onTab("invoices")}
          >
            <ResourceContent
              state={data.invoicesQuery}
              empty={
                !data.invoices.length ? t("clientDetail.noInvoices") : undefined
              }
            >
              <div className="cd-billing-summary">
                <div>
                  <strong>{data.invoiceSummary.paid}</strong>
                  <span>{t("clientDetail.paid")}</span>
                </div>
                <div>
                  <strong>{data.invoiceSummary.open}</strong>
                  <span>{t("clientDetail.openInvoices")}</span>
                </div>
                <div>
                  <strong
                    className={data.invoiceSummary.overdue ? "cd-danger" : ""}
                  >
                    {data.invoiceSummary.overdue}
                  </strong>
                  <span>{t("clientDetail.overdue")}</span>
                </div>
              </div>
              <InvoiceList invoices={data.invoices.slice(0, 2)} />
            </ResourceContent>
          </Section>
          <Section
            icon={MessagesSquare}
            tone="purple"
            title={t("clientDetail.recentActivity")}
            action={() => onTab("activity")}
          >
            <ResourceContent
              state={data.activityQuery}
              empty={
                !data.activity.length ? t("clientDetail.noActivity") : undefined
              }
            >
              <ActivityList items={data.activity.slice(0, 4)} />
            </ResourceContent>
          </Section>
        </div>
      </div>
    </div>
  );
}
