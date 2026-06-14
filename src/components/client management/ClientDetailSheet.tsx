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
import { DollarSign, Building2, RotateCcw, ArrowRight, X, TrendingUp, Pencil, Check, Bell, Trash2, UserCheck, Phone, Mail } from "lucide-react";
import { FollowUpPicker } from "./FollowUpPicker";
import { differenceInDays, isPast, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useConvertLead } from "@/hooks/useLeads";
import { LeadCustomFieldsSection } from "@/components/leads/LeadCustomFieldsSection";

const STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Contract Signed",
  "Project In Progress",
  "Completed",
  "Inactive",
  "Lost",
];

// Stages that count toward progress (exclude terminal/negative ones)
const PROGRESS_STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Contract Signed",
  "Project In Progress",
  "Completed",
];

const STAGE_EMOJI: Record<string, string> = {
  "New Lead": "🔵",
  "Contacted": "🟣",
  "Qualified": "🟡",
  "Proposal Sent": "🟠",
  "Contract Signed": "🟢",
  "Project In Progress": "🔷",
  "Completed": "✅",
  "Inactive": "⚫",
  "Lost": "🔴",
};


const STAGE_TEXT: Record<string, string> = {
  "New Lead": "text-blue-600 dark:text-blue-400",
  "Contacted": "text-violet-600 dark:text-violet-400",
  "Qualified": "text-yellow-600 dark:text-yellow-400",
  "Proposal Sent": "text-amber-600 dark:text-amber-400",
  "Contract Signed": "text-emerald-600 dark:text-emerald-400",
  "Project In Progress": "text-indigo-600 dark:text-indigo-400",
  "Completed": "text-green-600 dark:text-green-400",
  "Inactive": "text-gray-500 dark:text-gray-400",
  "Lost": "text-rose-600 dark:text-rose-400",
};

const TEMP_STAGE_SUGGESTION: Partial<Record<LeadTemperature, string>> = {
  Hot: "Project In Progress",
  Warm: "Proposal Sent",
  Cold: "New Lead",
  Lost: "Lost",
};

const TEMPERATURES: {
  value: LeadTemperature;
  emoji: string;
  label: string;
  ring: string;
  activeText: string;
  activeBg: string;
  badge: string;
}[] = [
  {
    value: "Hot",
    emoji: "🔥",
    label: "Hot",
    ring: "ring-orange-400",
    activeText: "text-orange-700 dark:text-orange-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-500/30",
  },
  {
    value: "Warm",
    emoji: "🟠",
    label: "Warm",
    ring: "ring-amber-400",
    activeText: "text-amber-700 dark:text-amber-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500/30",
  },
  {
    value: "Cold",
    emoji: "🔵",
    label: "Cold",
    ring: "ring-sky-400",
    activeText: "text-sky-700 dark:text-sky-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500/30",
  },
  {
    value: "Lost",
    emoji: "⚫",
    label: "Lost",
    ring: "ring-gray-400",
    activeText: "text-gray-700 dark:text-gray-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-600/40",
  },
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
  const tempConfig = TEMPERATURES.find((t) => t.value === currentTemp);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-[500px] w-[500px] p-0 flex flex-col gap-0 overflow-hidden h-full">

        {/* Header */}
        <div className="px-6 pt-7 pb-6 border-b border-border/40 shrink-0">

          {/* Client identity */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative shrink-0">
              <Avatar className={`h-16 w-16 rounded-2xl ring-[2.5px] ring-offset-2 ring-offset-background ${tempConfig?.ring ?? "ring-border/40"}`}>
                <AvatarImage src={client.image} />
                <AvatarFallback className="rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold text-xl text-foreground leading-snug truncate">
                  {client.name}
                </h2>
                {currentTemp && tempConfig && (
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${tempConfig.badge}`}>
                    {currentTemp}
                  </span>
                )}
              </div>

              {!isLead && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                  <p className="text-sm text-muted-foreground truncate">
                    {client.businessIndustry || t("pipeline.noIndustry")}
                  </p>
                </div>
              )}
              {isLead && (client.phone || (client.email && !client.email.includes("@noemail.invalid"))) && (
                <div className="flex flex-col gap-1 mt-1.5">
                  {client.email && !client.email.includes("@noemail.invalid") && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
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
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover/val:opacity-100 transition-opacity" />
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
                    <Pencil className="h-3 w-3 text-emerald-400/60 opacity-0 group-hover/val:opacity-100 transition-opacity" />
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
                  <span className="ml-2 normal-case font-semibold text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 px-1.5 py-0.5 rounded-full">
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

            <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 dark:bg-muted/20 rounded-xl">
              {TEMPERATURES.map((temp) => {
                const isActive = currentTemp === temp.value;
                return (
                  <button
                    key={temp.value}
                    onClick={() => handleTemperatureChange(temp.value)}
                    disabled={updateTemperature.isPending}
                    className={`h-10 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? `${temp.activeBg} ${temp.activeText}`
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-base leading-none">{temp.emoji}</span>
                    <span>{t(`pipeline.temperatures.${temp.value}`)}</span>
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
                    <span className="text-sm leading-none">{STAGE_EMOJI[currentStatus]}</span>
                    <span className={STAGE_TEXT[currentStatus] ?? ""}>
                      <SelectValue />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span>{STAGE_EMOJI[stage]}</span>
                        {t(`pipeline.clientStatuses.${stage}` as any)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Percentage progress bar */}
            {(() => {
              const progressIdx = PROGRESS_STAGES.indexOf(currentStatus);
              const isTerminal = currentStatus === "Lost" || currentStatus === "Inactive";
              const pct = progressIdx >= 0
                ? Math.round((progressIdx / (PROGRESS_STAGES.length - 1)) * 100)
                : 0;
              return (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">
                      {isTerminal
                        ? t(`pipeline.clientStatuses.${currentStatus}` as any)
                        : t("pipeline.stepOf", { current: progressIdx + 1, total: PROGRESS_STAGES.length })}
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
                    <p className="text-[11px] text-muted-foreground">{format(date, "d MMM yyyy")}</p>
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
                    className="text-muted-foreground/50 hover:text-rose-500 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })()}

            {/* Follow-up picker */}
            {showFollowUp && (
              <FollowUpPicker
                clientId={client.id}
                onDismiss={() => setShowFollowUp(false)}
              />
            )}
          </div>
        </div>

        {/* Convert to Client (leads only) */}
        {isLead && (
          <div className="px-6 pt-4 pb-2 shrink-0">
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

        {/* Custom fields (leads only) */}
        {isLead && <LeadCustomFieldsSection leadId={client.id} />}

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
