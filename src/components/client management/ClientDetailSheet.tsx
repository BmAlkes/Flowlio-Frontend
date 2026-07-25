import React, { useState, useEffect } from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { ClientTimeline } from "./ClientTimeline";
import {
  useUpdateLeadStatus,
  useUpdateLeadTemperature,
  useUpdateLeadValue,
  useSetFollowUp,
  useLeadInsights,
  LeadTemperature,
} from "@/hooks/useCRM";
import { DollarSign, Building2, RotateCcw, ArrowRight, X, TrendingUp, Pencil, Check, Bell, Trash2, UserCheck, Phone, Mail, Users } from "lucide-react";
import { FollowUpPicker } from "./FollowUpPicker";
import { differenceInDays, isPast, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useConvertLead } from "@/hooks/useLeads";
import { LeadCustomFieldsSection } from "@/components/leads/LeadCustomFieldsSection";
import { useAssignLead, useLeadTags, useSetLeadTags } from "@/hooks/useLeadExtras";
import { useGetCurrentOrgUserMembers } from "@/hooks/usegetallusermembers";
import { toast } from "sonner";

const LEAD_STAGES = [
  "New Lead", "Contacted", "Qualified", "Proposal Sent",
  "Contract Signed", "Project In Progress", "Completed", "Inactive", "Lost",
];

const CLIENT_STAGES = [
  "Active", "Onboarding", "On Hold", "Inactive", "Completed", "Churned",
];

const LEAD_PROGRESS_STAGES = [
  "New Lead", "Contacted", "Qualified", "Proposal Sent",
  "Contract Signed", "Project In Progress", "Completed",
];

const CLIENT_PROGRESS_STAGES = [
  "Onboarding", "Active", "Completed",
];

const STAGE_DOT: Record<string, string> = {
  "New Lead": "bg-blue-500", "Contacted": "bg-violet-500", "Qualified": "bg-yellow-500",
  "Proposal Sent": "bg-amber-500", "Contract Signed": "bg-emerald-500",
  "Project In Progress": "bg-indigo-500", "Completed": "bg-green-500",
  "Inactive": "bg-gray-400", "Lost": "bg-rose-500",
  "Active": "bg-green-600", "Onboarding": "bg-blue-500",
  "On Hold": "bg-amber-500", "Churned": "bg-rose-500",
};

const TEMP_STAGE_SUGGESTION: Partial<Record<LeadTemperature, string>> = {
  Hot: "Project In Progress",
  Warm: "Proposal Sent",
  Cold: "New Lead",
  Lost: "Lost",
};

const TEMPERATURES: {
  value: LeadTemperature;
  label: string;
  dot: string;
  active: string;
}[] = [
  { value: "Hot",  label: "Hot",  dot: "bg-orange-500", active: "bg-muted font-medium" },
  { value: "Warm", label: "Warm", dot: "bg-amber-400",  active: "bg-muted font-medium" },
  { value: "Cold", label: "Cold", dot: "bg-sky-500",    active: "bg-muted font-medium" },
  { value: "Lost", label: "Lost", dot: "bg-gray-400",   active: "bg-muted font-medium" },
];

interface ClientDetailSheetProps {
  client: any | null;
  open: boolean;
  onClose: () => void;
  isLead?: boolean;
  onConverted?: () => void;
}

export const ClientDetailSheet = ({ client, open, onClose, isLead, onConverted }: ClientDetailSheetProps) => {
  const { t } = useTranslation();
  const updateStatus = useUpdateLeadStatus();
  const updateTemperature = useUpdateLeadTemperature();
  const updateValue = useUpdateLeadValue();
  const cancelFollowUp = useSetFollowUp();
  const { data: insights } = useLeadInsights(client?.id ?? "");
  const convertLead = useConvertLead();
  const assignLead = useAssignLead();
  const setLeadTags = useSetLeadTags();
  const { data: membersResp } = useGetCurrentOrgUserMembers();
  const { data: allTags = [] } = useLeadTags();
  const members = (membersResp?.data?.userMembers ?? []).map((m) => ({
    id: m.user?.id ?? m.id,
    name: m.user?.name ?? `${m.firstname} ${m.lastname}`.trim(),
  }));

  const [currentStatus, setCurrentStatus] = useState(client?.status ?? "");
  const [stageSuggestion, setStageSuggestion] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);

  useEffect(() => {
    setCurrentStatus(client?.status ?? "");
    setStageSuggestion(null);
    setEditingValue(false);
    setShowFollowUp(false);
  }, [client?.id]);

  useEffect(() => {
    setCurrentStatus(client?.status ?? "");
  }, [client?.status]);

  const handleStatusChange = (newStatus: string) => {
    if (!client || newStatus === currentStatus) return;
    const prev = currentStatus;
    setCurrentStatus(newStatus);
    setStageSuggestion(null);
    updateStatus.mutate(
      { clientId: client.id, newStatus, oldStatus: prev },
      {
        onSuccess: () => setShowFollowUp(true),
        onError: () => setCurrentStatus(prev),
      }
    );
  };

  const handleValueEdit = () => {
    const current = client?.leadValue ? String(Number(client.leadValue)) : "";
    setValueInput(current);
    setEditingValue(true);
  };

  const handleValueSave = () => {
    if (!client) return;
    const parsed = parseFloat(valueInput.replace(/[^0-9.]/g, ""));
    setEditingValue(false);
    if (isNaN(parsed) || parsed === Number(client.leadValue)) return;
    updateValue.mutate({ clientId: client.id, leadValue: parsed });
  };

  const handleValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleValueSave();
    if (e.key === "Escape") setEditingValue(false);
  };

  const handleTemperatureChange = (temp: LeadTemperature | null) => {
    if (!client) return;
    updateTemperature.mutate(
      { clientId: client.id, temperature: temp },
      {
        onSuccess: () => {
          if (!temp) { setStageSuggestion(null); return; }
          const suggested = TEMP_STAGE_SUGGESTION[temp];
          setStageSuggestion(suggested && suggested !== currentStatus ? suggested : null);
          setShowFollowUp(true);
        },
      }
    );
  };

  if (!client) return null;

  const initials =
    client.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() ?? "?";

  const formatValue = (val: any) => {
    const n = Number(val);
    if (!val || n === 0) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const formattedValue = formatValue(client.leadValue);
  const currentTemp = insights?.temperature;
  const tempCfg = TEMPERATURES.find((t) => t.value === currentTemp);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col gap-0 overflow-hidden h-full z-50">

        {/* Header */}
        <div className="px-6 pt-7 pb-6 border-b border-border/40 shrink-0">

          {/* Client identity */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative shrink-0">
              <Avatar className="h-14 w-14 rounded-xl">
                <AvatarImage src={client.image} />
                <AvatarFallback className="rounded-xl bg-muted text-muted-foreground font-medium text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-lg text-foreground leading-snug truncate">
                  {client.name}
                </h2>
                {currentTemp && tempCfg && (
                  <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${tempCfg.dot}`} />
                    {currentTemp}
                  </span>
                )}
              </div>

              {!isLead && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground/90 shrink-0" />
                  <p className="text-sm text-muted-foreground truncate">
                    {client.businessIndustry || t("pipeline.noIndustry")}
                  </p>
                </div>
              )}
              {isLead && (client.phone || (client.email && !client.email.includes("@noemail.invalid"))) && (
                <div className="flex flex-col gap-1 mt-1.5">
                  {client.email && !client.email.includes("@noemail.invalid") && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/90 shrink-0" />
                      <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/90 shrink-0" />
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-3">
                {editingValue ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-600/50">
                    <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      inputMode="numeric"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                      onBlur={handleValueSave}
                      onKeyDown={handleValueKeyDown}
                      className="w-28 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-transparent outline-none placeholder:text-emerald-400/50"
                      placeholder="0"
                    />
                    <button
                      onClick={handleValueSave}
                      disabled={updateValue.isPending}
                      className="text-emerald-600 hover:text-emerald-800 transition-colors shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : formattedValue ? (
                  <button onClick={handleValueEdit} className="flex items-center gap-1.5 group/val">
                    <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 group-hover/val:underline">
                      {formattedValue}
                    </span>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground/90 opacity-0 group-hover/val:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <button
                    onClick={handleValueEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-600/50 bg-emerald-50/60 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group/val"
                  >
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {t("pipeline.addValue")}
                    </span>
                    <Pencil className="h-3 w-3 text-emerald-400/90 opacity-0 group-hover/val:opacity-100 transition-opacity" />
                  </button>
                )}

                {insights?.score !== undefined && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {insights.score}% {t("pipeline.score")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("pipeline.temperature")}
                {insights?.isManualTemperature && (
                  <span className="ms-2 normal-case font-semibold text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                    {t("pipeline.temperatureManual")}
                  </span>
                )}
              </span>
              {insights?.isManualTemperature && (
                <button
                  onClick={() => handleTemperatureChange(null)}
                  disabled={updateTemperature.isPending}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("pipeline.temperatureAuto")}
                </button>
              )}
            </div>

            <div className="flex gap-1 p-1 bg-muted/40 rounded-lg">
              {TEMPERATURES.map((temp) => {
                const isActive = currentTemp === temp.value;
                return (
                  <button
                    key={temp.value}
                    onClick={() => handleTemperatureChange(temp.value)}
                    disabled={updateTemperature.isPending}
                    className={`flex-1 h-8 rounded text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                      isActive ? temp.active : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${temp.dot}`} />
                    {t(`pipeline.temperatures.${temp.value}`)}
                  </button>
                );
              })}
            </div>

            {stageSuggestion && (
              <div className="mt-2.5 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200/70 dark:border-amber-500/20">
                <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
                  {t("pipeline.moveTo", { stage: "" }).replace("<1></1>", "")}<span className="font-semibold">{t(`pipeline.clientStatuses.${stageSuggestion}` as any)}</span>?
                </p>
                <button
                  onClick={() => handleStatusChange(stageSuggestion)}
                  disabled={updateStatus.isPending}
                  className="text-sm font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors disabled:opacity-50 shrink-0"
                >
                  {t("pipeline.move")}
                </button>
                <button
                  onClick={() => setStageSuggestion(null)}
                  className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Pipeline stage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("pipeline.pipelineStage")}
              </span>
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={updateStatus.isPending}
              >
                <SelectTrigger size="sm" className="h-8 text-sm w-auto border-border/50 gap-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${STAGE_DOT[currentStatus] ?? "bg-gray-400"}`} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {(isLead ? LEAD_STAGES : CLIENT_STAGES).map((stage) => (
                    <SelectItem key={stage} value={stage} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[stage] ?? "bg-gray-400"}`} />
                        {stage}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Percentage progress bar */}
            {(() => {
              const progressStages = isLead ? LEAD_PROGRESS_STAGES : CLIENT_PROGRESS_STAGES;
              const progressIdx = progressStages.indexOf(currentStatus);
              const isTerminal = currentStatus === "Lost" || currentStatus === "Churned" || currentStatus === "Inactive";
              const pct = progressIdx >= 0
                ? Math.round((progressIdx / (progressStages.length - 1)) * 100)
                : 0;
              return (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">
                      {isTerminal
                        ? currentStatus
                        : `Step ${progressIdx + 1} of ${progressStages.length}`}
                    </span>
                    <span className={`text-xs font-bold ${isTerminal ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400"}`}>
                      {isTerminal ? "—" : `${pct}%`}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isTerminal ? "bg-rose-400" : "bg-indigo-500"}`}
                      style={{ width: isTerminal ? "100%" : `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Existing follow-up badge */}
            {client.followUpAt && !showFollowUp && (() => {
              const date = new Date(client.followUpAt);
              const overdue = isPast(date);
              const daysLeft = differenceInDays(date, new Date());
              return (
                <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  overdue
                    ? "bg-rose-50 dark:bg-rose-900/15 border-rose-200 dark:border-rose-500/30"
                    : "bg-indigo-50 dark:bg-indigo-900/15 border-indigo-200 dark:border-indigo-500/30"
                }`}>
                  <Bell className={`h-3.5 w-3.5 shrink-0 ${overdue ? "text-rose-500" : "text-indigo-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${overdue ? "text-rose-700 dark:text-rose-300" : "text-indigo-700 dark:text-indigo-300"}`}>
                      {overdue ? t("pipeline.followUpOverdue") : daysLeft === 0 ? t("pipeline.followUpToday") : t("pipeline.followUpInDays", { count: daysLeft })}
                    </p>
                    <p className="text-xs text-muted-foreground">{format(date, "d MMM yyyy")}</p>
                  </div>
                  <button
                    onClick={() => setShowFollowUp(true)}
                    className={`text-xs font-semibold transition-colors shrink-0 ${overdue ? "text-rose-600 hover:text-rose-800" : "text-indigo-600 hover:text-indigo-800"}`}
                  >
                    {t("pipeline.followUpChange")}
                  </button>
                  <button
                    onClick={() => cancelFollowUp.mutate({ clientId: client.id, followUpAt: null })}
                    disabled={cancelFollowUp.isPending}
                    className="text-muted-foreground/90 hover:text-rose-500 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })()}

            {/* Set follow-up (only when there's nothing scheduled yet) */}
            {!client.followUpAt && !showFollowUp && (
              <button
                onClick={() => setShowFollowUp(true)}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/15 transition-colors w-full"
              >
                <Bell className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-semibold">{t("pipeline.followUpSet")}</span>
              </button>
            )}

            {/* Follow-up picker */}
            {showFollowUp && (
              <FollowUpPicker
                clientId={client.id}
                onDismiss={() => setShowFollowUp(false)}
              />
            )}
          </div>
        </div>

        {/* Assign to + Tags (leads only) */}
        {isLead && (
          <div className="px-6 pt-4 pb-1 shrink-0 space-y-3">
            {/* Assign to */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Assigned to
              </span>
              <Select
                value={client.assignedTo ?? "unassigned"}
                onValueChange={(v) => {
                  const userId = v === "unassigned" ? null : v;
                  assignLead.mutate({ leadId: client.id, userId }, {
                    onSuccess: () => toast.success(userId ? "Lead assigned" : "Assignment removed"),
                  });
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Unassigned" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => {
                    const active = (client.tags ?? []).some((t: any) => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentIds = (client.tags ?? []).map((t: any) => t.id);
                          const newIds = active ? currentIds.filter((id: string) => id !== tag.id) : [...currentIds, tag.id];
                          setLeadTags.mutate({ leadId: client.id, tagIds: newIds }, {
                            onSuccess: () => toast.success(active ? `Removed "${tag.name}"` : `Added "${tag.name}"`),
                            onError: (err) => toast.error("Failed to update tags", { description: (err as any)?.message }),
                          });
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-full font-medium cursor-pointer transition-all border-2"
                        style={{
                          backgroundColor: active ? tag.color : "transparent",
                          borderColor: tag.color,
                          color: active ? "#fff" : tag.color,
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Convert to Client (leads only) */}
        {isLead && (
          <div className="px-6 pt-3 pb-2 shrink-0">
            <button
              onClick={() =>
                convertLead.mutate(client.id, {
                  onSuccess: () => { onClose(); onConverted?.(); },
                })
              }
              disabled={convertLead.isPending}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              {convertLead.isPending ? "Converting..." : "Convert to Client"}
            </button>
          </div>
        )}

        {/* Custom fields (leads only) — scrollable when data is long */}
        {isLead && (
          <div className="max-h-[200px] overflow-y-auto shrink-0">
            <LeadCustomFieldsSection leadId={client.id} rawCustomFields={client.customFields} />
          </div>
        )}

        {/* Activity label */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("pipeline.activity")}
          </span>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 pb-4">
            <ClientTimeline clientId={client.id} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
