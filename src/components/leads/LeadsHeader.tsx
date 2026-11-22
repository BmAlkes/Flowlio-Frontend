import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GeneralModal, useGeneralModalDisclosure } from "@/components/common/generalmodal";
import { CirclePlus, LayoutGrid, List, Settings2, Webhook, Download, Tag, ContactRound, ChevronDown, Search } from "lucide-react";
import { LeadsPipeline } from "./LeadsPipeline";
import { LeadsTable } from "./LeadsTable";
import { LeadStats } from "./LeadStats";
import { CreateLeadDialog } from "./CreateLeadDialog";
import { LeadFieldsManager } from "./LeadFieldsManager";
import { LeadTagsManager } from "./LeadTagsManager";
import { useExportLeads } from "@/hooks/useLeadExtras";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { useWebhooks } from "@/hooks/useWebhooks";
import { toast } from "sonner";
import { WorkspaceHeader, workspacePage } from "@/components/ui/workspace-page";
import { LEAD_STAGES, TEMPERATURES, leadTemperature, matchesStat, type LeadStatFilter } from "./lead-ui";
import "./leads-layout.css";

export type LeadFilters = { stage: string; temperature: string; assignee: string; stat: LeadStatFilter };

export const LeadsHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "pipeline">("table");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [webhookId, setWebhookId] = useState("all");
  const [filters, setFilters] = useState<LeadFilters>({ stage: "all", temperature: "all", assignee: "all", stat: null });
  const fieldsModal = useGeneralModalDisclosure();
  const tagsModal = useGeneralModalDisclosure();
  const exportLeads = useExportLeads();
  const { data: webhooks = [] } = useWebhooks();
  const { data, isLoading } = useLeads({ search, webhookId: webhookId !== "all" ? webhookId : undefined });
  const all: Lead[] = data?.data ?? [];

  const assignees = useMemo(() => {
    const seen = new Map<string, string>();
    for (const lead of all) if (lead.assignedUser) seen.set(lead.assignedUser.id, lead.assignedUser.name);
    return [...seen].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [all]);

  // The stage filter belongs to the table: in the pipeline the columns already split by stage.
  const visible = useMemo(() => {
    const now = new Date();
    return all.filter(lead =>
      matchesStat(lead, filters.stat, now)
      && (view === "pipeline" || filters.stage === "all" || lead.status === filters.stage)
      && (filters.temperature === "all" || leadTemperature(lead) === filters.temperature)
      && (filters.assignee === "all" || (filters.assignee === "unassigned" ? !lead.assignedTo : lead.assignedTo === filters.assignee)));
  }, [all, filters, view]);

  const set = <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => setFilters(previous => ({ ...previous, [key]: value }));
  const runExport = () => exportLeads.mutate({}, {
    onSuccess: () => toast.success(t("leadsLayout.exported")),
    onError: error => toast.error(t("leadsLayout.exportError"), { description: error.message }),
  });

  return (
    <main className={`${workspacePage} leads-workspace`}>
      <WorkspaceHeader icon={ContactRound} title={t("leadsLayout.title")} description={t("leadsLayout.description")}
        actions={<>
          <Button variant="outline" onClick={() => navigate("/dashboard/leads/webhooks")}><Webhook size={16} />Webhooks</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">{t("leadsLayout.more")}<ChevronDown size={16} /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => tagsModal.onOpenChange(true)}><Tag size={15} />{t("leadsLayout.tags")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => fieldsModal.onOpenChange(true)}><Settings2 size={15} />{t("leadsLayout.fields")}</DropdownMenuItem>
              <DropdownMenuItem disabled={exportLeads.isPending} onClick={runExport}><Download size={15} />{t(`leadsLayout.${exportLeads.isPending ? "exporting" : "export"}`)}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="ld-primary" onClick={() => setShowCreate(true)}><CirclePlus size={18} />{t("leadsLayout.newLead")}</Button>
        </>} />

      <LeadStats leads={all} active={filters.stat} onSelect={stat => set("stat", filters.stat === stat ? null : stat)} />

      <div className="ld-toolbar">
        <div className="ld-view-toggle" role="group" aria-label={t("leadsLayout.view")}>
          <Button variant="ghost" size="sm" aria-pressed={view === "table"} onClick={() => setView("table")}><List size={16} />{t("leadsLayout.table")}</Button>
          <Button variant="ghost" size="sm" aria-pressed={view === "pipeline"} onClick={() => setView("pipeline")}><LayoutGrid size={16} />{t("leadsLayout.pipeline")}</Button>
        </div>
        <div className="ld-search">
          <Search aria-hidden="true" className="size-4" />
          <Input aria-label={t("leadsLayout.searchLabel")} placeholder={t("leadsLayout.search")} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {view === "table" && (
          <Select value={filters.stage} onValueChange={value => set("stage", value)}>
            <SelectTrigger aria-label={t("leadsLayout.stageFilter")} className="ld-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("leadsLayout.allStages")}</SelectItem>
              {LEAD_STAGES.map(stage => <SelectItem key={stage} value={stage}>{t(`pipeline.clientStatuses.${stage}`, { defaultValue: stage })}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={filters.temperature} onValueChange={value => set("temperature", value)}>
          <SelectTrigger aria-label={t("leadsLayout.temperatureFilter")} className="ld-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("leadsLayout.allTemperatures")}</SelectItem>
            {TEMPERATURES.map(temp => <SelectItem key={temp} value={temp}>{t(`pipeline.temperatures.${temp}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.assignee} onValueChange={value => set("assignee", value)}>
          <SelectTrigger aria-label={t("leadsLayout.assigneeFilter")} className="ld-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("leadsLayout.anyone")}</SelectItem>
            <SelectItem value="unassigned">{t("leadsLayout.unassigned")}</SelectItem>
            {assignees.map(person => <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {webhooks.length > 0 && (
          <Select value={webhookId} onValueChange={setWebhookId}>
            <SelectTrigger aria-label={t("leadsLayout.sourceFilter")} className="ld-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("leadsLayout.allSources")}</SelectItem>
              <SelectItem value="manual">{t("leadsLayout.manual")}</SelectItem>
              {webhooks.map(hook => <SelectItem key={hook.id} value={hook.id}>{hook.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="ld-content">
        {view === "table"
          ? <LeadsTable leads={visible} isLoading={isLoading} filtered={visible.length !== all.length || !!search} />
          : <LeadsPipeline leads={visible} isLoading={isLoading} />}
      </div>
      <CreateLeadDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <GeneralModal {...fieldsModal}><div className="p-1"><LeadFieldsManager /></div></GeneralModal>
      <GeneralModal {...tagsModal} contentProps={{ className: "max-w-lg" }}><div className="p-1"><LeadTagsManager /></div></GeneralModal>
    </main>
  );
};
