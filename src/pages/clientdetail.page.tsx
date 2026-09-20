import { clientStatusSchema } from "@/contracts/core-api";
import { useSearchParams, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  LayoutDashboard,
  FolderOpen,
  ListTodo,
  FileText,
  Receipt,
  History,
  Paperclip,
  Pencil,
  Plus,
  MoreHorizontal,
  Trash2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/providers/user.provider";
import { useUpdateClient } from "@/hooks/useupdateclient";
import { useDeleteClient } from "@/hooks/usedeleteclient";
import { ClientTimeline } from "@/components/client management/ClientTimeline";
import { ClientMediaCenter } from "@/components/client management/clientmediacenter";
import { toast } from "sonner";
import { useClientDetailData } from "@/components/client-detail/useClientDetailData";
import { ClientDetailSidebar } from "@/components/client-detail/ClientDetailSidebar";
import { ClientDetailOverview } from "@/components/client-detail/ClientDetailOverview";
import {
  Section,
  ResourceContent,
} from "@/components/client-detail/ClientDetailUI";
import {
  ProjectList,
  TaskList,
  InvoiceList,
  ProposalList,
} from "@/components/client-detail/ClientDetailLists";
import "@/components/client-detail/client-detail.css";

const TABS = [
  { id: "overview", icon: LayoutDashboard },
  { id: "projects", icon: FolderOpen },
  { id: "tasks", icon: ListTodo },
  { id: "proposals", icon: FileText },
  { id: "invoices", icon: Receipt },
  { id: "files", icon: Paperclip },
  { id: "activity", icon: History },
];

export default function ClientDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { data: userData } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get("tab") || "overview";
  const tab = TABS.some(({ id }) => id === selectedTab)
    ? selectedTab
    : "overview";
  const setTab = (value: string) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value === "overview") next.delete("tab");
      else next.set("tab", value);
      return next;
    });
  const data = useClientDetailData(clientId, userData?.user.organizationId);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const { client } = data;
  const back = () => navigate("/dashboard/client-management");
  const edit = (portal = false) =>
    navigate("/dashboard/client-management/create-client", {
      state: { mode: "edit", client, focusPortalAccess: portal },
    });
  const createProject = () =>
    navigate(
      `/dashboard/project/create-project?clientId=${encodeURIComponent(clientId || "")}`,
    );
  const handleDelete = () => {
    if (
      !client ||
      !window.confirm(
        t("clientManagement.confirmDelete", { email: client.email }),
      )
    )
      return;
    deleteClient.mutate(client.id, {
      onSuccess: () => {
        toast.success(t("clientManagement.toastDeleted"));
        back();
      },
      onError: () => toast.error(t("clientManagement.toastDeleteFailed")),
    });
  };
  const changeStatus = (status: string) => {
    if (!client || status === client.status) return;
    updateClient.mutate(
      { clientId: client.id, data: { status: clientStatusSchema.parse(status) } },
      {
        onSuccess: () =>
          toast.success(t("clientManagement.toastStatusUpdated")),
        onError: () => toast.error(t("clientManagement.toastStatusFailed")),
      },
    );
  };

  return (
    <div className="client-detail">
      <header className="cd-toolbar">
        <button className="cd-back" onClick={back}>
          <ArrowLeft size={16} className="rtl:-scale-x-100" />
          {t("clientDetail.clients")}
          <span>/</span>
          <strong>{t("clientDetail.workspace")}</strong>
        </button>
        {client && (
          <div className="cd-actions">
            <Button variant="outline" size="sm" onClick={() => edit()}>
              <Pencil size={14} />
              {t("clientManagement.editClient")}
            </Button>
            <Button size="sm" className="cd-primary" onClick={createProject}>
              <Plus size={16} />
              {t("clientDetail.newProject")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("clientDetail.moreActions")}
                >
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => edit(true)}>
                  <KeyRound size={15} />
                  {t("clientManagement.grantPortalAccess")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={handleDelete}
                  disabled={deleteClient.isPending}
                >
                  <Trash2 size={15} />
                  {t("clientManagement.deleteClient")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </header>
      <ResourceContent
        state={data.clientsQuery}
        empty={!client ? t("clientDetail.clientNotFound") : undefined}
      >
        {client && (
          <div className="cd-workspace">
            <ClientDetailSidebar
              client={client}
              updating={updateClient.isPending}
              onStatusChange={changeStatus}
              onPortal={() => edit(true)}
            />
            <main className="cd-main">
              <Tabs
                value={tab}
                onValueChange={setTab}
                className="cd-tabs"
                dir={i18n.dir()}
              >
                <div className="cd-tabs-scroll">
                  <TabsList
                    className="cd-tab-list"
                    aria-label={t("clientDetail.navigation")}
                  >
                    {TABS.map(({ id, icon: Icon }) => (
                      <TabsTrigger key={id} value={id} className="cd-tab">
                        <Icon size={15} />
                        <span>{t(`clientDetail.${id}`)}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="cd-page-heading">
                  <div>
                    <p className="cd-eyebrow">
                      {t("clientDetail.relationship")}
                    </p>
                    <h2>{t(`clientDetail.${tab}`)}</h2>
                    <p>{t(`clientDetail.description.${tab}`)}</p>
                  </div>
                </div>
                <TabsContent value="overview">
                  <ClientDetailOverview data={data} onTab={setTab} />
                </TabsContent>
                <TabsContent value="projects">
                  <Section
                    title={t("clientDetail.projects")}
                    action={createProject}
                    actionLabel={t("clientDetail.newProject")}
                  >
                    <ResourceContent
                      state={data.projectsQuery}
                      empty={
                        !data.projects.length
                          ? t("clientDetail.noProjects")
                          : undefined
                      }
                    >
                      <ProjectList projects={data.projects} />
                    </ResourceContent>
                  </Section>
                </TabsContent>
                <TabsContent value="tasks">
                  <Section title={t("clientDetail.tasks")}>
                    <ResourceContent
                      state={data.tasksQuery}
                      empty={
                        !data.tasks.length
                          ? t("clientDetail.noTasks")
                          : undefined
                      }
                    >
                      <TaskList tasks={data.tasks} />
                    </ResourceContent>
                  </Section>
                </TabsContent>
                <TabsContent value="proposals">
                  <Section title={t("clientDetail.proposals")}>
                    <ResourceContent
                      state={data.proposalsQuery}
                      empty={
                        !data.proposals.length
                          ? t("clientDetail.noProposals")
                          : undefined
                      }
                    >
                      <ProposalList proposals={data.proposals} />
                    </ResourceContent>
                  </Section>
                </TabsContent>
                <TabsContent value="invoices">
                  <Section title={t("clientDetail.invoices")}>
                    <ResourceContent
                      state={data.invoicesQuery}
                      empty={
                        !data.invoices.length
                          ? t("clientDetail.noInvoices")
                          : undefined
                      }
                    >
                      <InvoiceList invoices={data.invoices} />
                    </ResourceContent>
                  </Section>
                </TabsContent>
                <TabsContent value="activity">
                  <Section title={t("clientDetail.activity")}>
                    <ResourceContent state={data.activityQuery}>
                      <ClientTimeline
                        key={client.id}
                        clientId={client.id}
                        mode="admin"
                      />
                    </ResourceContent>
                  </Section>
                </TabsContent>
                <TabsContent value="files">
                  <Section title={t("clientDetail.files")}>
                    <ResourceContent state={data.filesQuery}>
                      <ClientMediaCenter
                        key={client.id}
                        clientIdOverride={client.id}
                      />
                    </ResourceContent>
                  </Section>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        )}
      </ResourceContent>
    </div>
  );
}
