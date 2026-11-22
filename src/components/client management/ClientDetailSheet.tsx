import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ContactRound, RotateCcw, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { AgentContextButton } from "@/components/ai assist/AgentContextButton";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ClientTimeline } from "./ClientTimeline";
import { useLeadInsights, useUpdateLeadStatus, useUpdateLeadTemperature, type LeadTemperature } from "@/hooks/useCRM";
import { useConvertLead } from "@/hooks/useLeads";
import { useAssignLead } from "@/hooks/useLeadExtras";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { LeadCustomFieldsSection } from "@/components/leads/LeadCustomFieldsSection";
import { LeadContactActions } from "@/components/leads/LeadContactActions";
import { FollowUpBlock, Property, ScoreMeter, TagsEditor, ValueEditor } from "@/components/leads/LeadSheetParts";
import { CLOSED_STAGES, LEAD_STAGES, SALES_STAGES, TEMPERATURES, TEMP_TONE, avatarTone, initialsOf, realEmail, stageTone } from "@/components/leads/lead-ui";
import "@/components/leads/leads-layout.css";

// Choosing a temperature suggests the matching stage.
const TEMP_STAGE_SUGGESTION: Partial<Record<LeadTemperature, string>> = { Hot: "Project In Progress", Warm: "Proposal Sent", Cold: "New Lead", Lost: "Lost" };

interface ClientDetailSheetProps {
  client: any | null;
  open: boolean;
  onClose: () => void;
  isLead?: boolean;
  onConverted?: () => void;
}

// Lead details: who the lead is and how to reach them first, then the properties, then the activity.
export const ClientDetailSheet = ({ client, open, onClose, onConverted }: ClientDetailSheetProps) => {
  const { t, i18n } = useTranslation();
  const updateStatus = useUpdateLeadStatus();
  const updateTemperature = useUpdateLeadTemperature();
  const convertLead = useConvertLead();
  const assignLead = useAssignLead();
  const { data: insights } = useLeadInsights(client?.id ?? "");
  const { data: membersResp } = useGetCurrentOrgUserMembers();
  const members = (membersResp?.data?.userMembers ?? []).map(m => ({ id: m.user?.id ?? m.id, name: m.user?.name ?? `${m.firstname} ${m.lastname}`.trim() }));

  const [status, setStatus] = useState(client?.status ?? "");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [followUpEditing, setFollowUpEditing] = useState(false);
  const [tab, setTab] = useState("activity");
  useEffect(() => { setStatus(client?.status ?? ""); setSuggestion(null); setFollowUpEditing(false); setTab("activity"); }, [client?.id]);
  useEffect(() => { setStatus(client?.status ?? ""); }, [client?.status]);

  if (!client) return null;
  const stageName = (stage: string) => t(`pipeline.clientStatuses.${stage}`, { defaultValue: stage });

  const changeStatus = (next: string) => {
    if (next === status) return;
    const previous = status;
    setStatus(next); setSuggestion(null);
    updateStatus.mutate({ clientId: client.id, newStatus: next, oldStatus: previous }, {
      onSuccess: () => setFollowUpEditing(true),
      onError: () => setStatus(previous),
    });
  };
  const changeTemperature = (temp: LeadTemperature | null) => updateTemperature.mutate({ clientId: client.id, temperature: temp }, {
    onSuccess: () => {
      const suggested = temp ? TEMP_STAGE_SUGGESTION[temp] : null;
      setSuggestion(suggested && suggested !== status ? suggested : null);
      if (temp) setFollowUpEditing(true);
    },
  });

  const temp = insights?.temperature ?? null;
  const email = realEmail(client.email);
  const created = client.createdAt ? new Date(client.createdAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" }) : null;
  const source = client.webhookName ?? t("leadsLayout.manual");
  const step = (SALES_STAGES as readonly string[]).indexOf(status);
  const closed = (CLOSED_STAGES as readonly string[]).includes(status);
  const tone = stageTone(status);

  return (
    <Sheet open={open} onOpenChange={value => !value && onClose()}>
      <SheetContent side={i18n.dir() === "rtl" ? "left" : "right"} aria-describedby={undefined} className="lead-details w-full sm:max-w-[560px] p-0 flex flex-col gap-0 overflow-hidden h-full z-50">
        <div className="ld-sheet-top"><ContactRound size={18} aria-hidden="true" /><span>{t("leadsLayout.details")}</span></div>
        <div className="ld-sheet-scroll">

          <section className="ld-sheet-hero">
            <div className="flex items-start gap-3.5">
              <Avatar className="size-13 rounded-[14px] shrink-0">
                <AvatarImage src={client.image} />
                <AvatarFallback className={`rounded-[14px] text-lg font-bold ${avatarTone(client.id)}`}>{initialsOf(client.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-xl font-bold leading-snug break-words">{client.name}</SheetTitle>
                <p className="mt-1 text-sm text-muted-foreground break-words">{[email ?? client.phone, source, created && t("leadsLayout.createdOn", { date: created })].filter(Boolean).join(" · ")}</p>
              </div>
              <Select value={temp ?? "none"} onValueChange={value => changeTemperature(value === "auto" ? null : value as LeadTemperature)} disabled={updateTemperature.isPending}>
                <SelectTrigger size="sm" aria-label={t("pipeline.temperature")} className={`ld-temp-trigger ${temp ? TEMP_TONE[temp].pill : ""}`}><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent align="end">
                  {temp === null && <SelectItem value="none" disabled>—</SelectItem>}
                  {TEMPERATURES.map(value => <SelectItem key={value} value={value}><span className={`size-2 rounded-full ${TEMP_TONE[value].dot}`} />{t(`pipeline.temperatures.${value}`)}</SelectItem>)}
                  {insights?.isManualTemperature && <SelectItem value="auto"><RotateCcw className="size-3.5" />{t("pipeline.temperatureAuto")}</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LeadContactActions lead={client} />
              <span className="flex-1" />
              <AgentContextButton scope={{ area: "leads", clientId: client.id }} onOpen={onClose} />
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={convertLead.isPending}
                onClick={() => convertLead.mutate(client.id, { onSuccess: () => { onClose(); onConverted?.(); } })}>
                <UserCheck className="size-4" />{convertLead.isPending ? t("leadsLayout.converting") : t("leadsLayout.convert")}<ArrowRight className="size-4 rtl:rotate-180" />
              </Button>
            </div>
          </section>

          {suggestion && (
            <div className="ld-suggestion" role="status">
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 rtl:rotate-180" />
              <p className="flex-1">{t("leadsLayout.moveSuggestion", { stage: stageName(suggestion) })}</p>
              <button type="button" className="font-semibold" disabled={updateStatus.isPending} onClick={() => changeStatus(suggestion)}>{t("pipeline.move")}</button>
              <button type="button" aria-label={t("leadsLayout.dismiss")} onClick={() => setSuggestion(null)}><X className="size-4" /></button>
            </div>
          )}

          <section className="ld-props" aria-label={t("leadsLayout.properties")}>
            <Property label={t("leadsLayout.colStage")} wide>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{closed ? stageName(status) : step >= 0 ? t("pipeline.stepOf", { current: step + 1, total: SALES_STAGES.length }) : ""}</span>
                <Select value={status} onValueChange={changeStatus} disabled={updateStatus.isPending}>
                  <SelectTrigger size="sm" aria-label={t("pipeline.pipelineStage")} className="w-auto gap-2 font-medium"><span className={`size-2 rounded-full ${tone.dot}`} /><SelectValue /></SelectTrigger>
                  <SelectContent>{LEAD_STAGES.map(stage => <SelectItem key={stage} value={stage}><span className={`size-2 rounded-full ${stageTone(stage).dot}`} />{stageName(stage)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="ld-steps" aria-hidden="true">
                {SALES_STAGES.map((stage, index) => <span key={stage} className={closed ? tone.bar : index <= step ? stageTone(SALES_STAGES[Math.max(step, 0)]).bar : ""} />)}
              </div>
            </Property>
            <Property label={t("leadsLayout.colFollowUp")} wide><FollowUpBlock client={client} editing={followUpEditing} setEditing={setFollowUpEditing} /></Property>
            <Property label={t("leadsLayout.value")}><ValueEditor client={client} /></Property>
            <Property label={t("leadsLayout.assigned")}>
              <Select value={client.assignedTo ?? "unassigned"} onValueChange={value => {
                const userId = value === "unassigned" ? null : value;
                assignLead.mutate({ leadId: client.id, userId }, { onSuccess: () => toast.success(t(userId ? "leadsLayout.assignedDone" : "leadsLayout.unassignedDone")) });
              }}>
                <SelectTrigger size="sm" aria-label={t("leadsLayout.assigned")} className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">{t("leadsLayout.unassigned")}</SelectItem>
                  {members.map(member => <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Property>
            <Property label={t("leadsLayout.score")} wide><ScoreMeter insights={insights} /></Property>
            <Property label={t("leadsLayout.tags")} wide><TagsEditor client={client} /></Property>
          </section>

          <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <TabsList className="ld-tabs">
              <TabsTrigger value="activity">{t("leadsLayout.tabActivity")}</TabsTrigger>
              <TabsTrigger value="details">{t("leadsLayout.tabDetails")}</TabsTrigger>
              <TabsTrigger value="fields">{t("leadsLayout.fields")}</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="ld-tab-panel ld-sheet-history"><ClientTimeline clientId={client.id} /></TabsContent>
            <TabsContent value="details" className="ld-tab-panel">
              <dl className="ld-details">
                <dt>{t("leadsLayout.emailLabel")}</dt><dd>{email ?? "—"}</dd>
                <dt>{t("leadsLayout.phone")}</dt><dd dir="ltr">{client.phone || "—"}</dd>
                <dt>{t("leadsLayout.source")}</dt><dd>{source}</dd>
                <dt>{t("leadsLayout.industry")}</dt><dd>{client.businessIndustry || "—"}</dd>
                <dt>{t("leadsLayout.created")}</dt><dd>{created ?? "—"}</dd>
                <dt>{t("leadsLayout.lastContact")}</dt><dd>{client.lastInteractionAt ? new Date(client.lastInteractionAt).toLocaleDateString(i18n.language) : t("pipeline.noContactYet")}</dd>
              </dl>
            </TabsContent>
            <TabsContent value="fields" className="ld-tab-panel ld-custom-fields"><LeadCustomFieldsSection leadId={client.id} rawCustomFields={client.customFields} /></TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
