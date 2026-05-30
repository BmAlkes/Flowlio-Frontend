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
  useLeadInsights,
  LeadTemperature,
} from "@/hooks/useCRM";
import { DollarSign, Building2, RotateCcw, ArrowRight, X, TrendingUp, Pencil, Check } from "lucide-react";

const STAGES = [
  "New Lead",
  "In Negotiation",
  "Contract Signed",
  "Project In Progress",
  "Completed",
  "Inactive Client",
];

const STAGE_COLORS: Record<string, string> = {
  "New Lead": "bg-blue-500",
  "In Negotiation": "bg-amber-500",
  "Contract Signed": "bg-indigo-500",
  "Project In Progress": "bg-violet-500",
  "Completed": "bg-emerald-500",
  "Inactive Client": "bg-rose-500",
};

const STAGE_TEXT: Record<string, string> = {
  "New Lead": "text-blue-600 dark:text-blue-400",
  "In Negotiation": "text-amber-600 dark:text-amber-400",
  "Contract Signed": "text-indigo-600 dark:text-indigo-400",
  "Project In Progress": "text-violet-600 dark:text-violet-400",
  "Completed": "text-emerald-600 dark:text-emerald-400",
  "Inactive Client": "text-rose-600 dark:text-rose-400",
};

const TEMP_STAGE_SUGGESTION: Partial<Record<LeadTemperature, string>> = {
  Close: "Contract Signed",
  Hot: "Project In Progress",
  Warm: "In Negotiation",
  Cold: "New Lead",
};

const TEMPERATURES: {
  value: LeadTemperature;
  label: string;
  ring: string;
  activeText: string;
  activeBg: string;
  badge: string;
}[] = [
  {
    value: "Hot",
    label: "Hot",
    ring: "ring-orange-400",
    activeText: "text-orange-700 dark:text-orange-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-500/30",
  },
  {
    value: "Warm",
    label: "Warm",
    ring: "ring-amber-400",
    activeText: "text-amber-700 dark:text-amber-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500/30",
  },
  {
    value: "Cold",
    label: "Cold",
    ring: "ring-sky-400",
    activeText: "text-sky-700 dark:text-sky-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500/30",
  },
  {
    value: "Close",
    label: "Close",
    ring: "ring-emerald-400",
    activeText: "text-emerald-700 dark:text-emerald-300",
    activeBg: "bg-white dark:bg-gray-800 shadow-sm",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/30",
  },
];

interface ClientDetailSheetProps {
  client: any | null;
  open: boolean;
  onClose: () => void;
}

export const ClientDetailSheet = ({ client, open, onClose }: ClientDetailSheetProps) => {
  const updateStatus = useUpdateLeadStatus();
  const updateTemperature = useUpdateLeadTemperature();
  const updateValue = useUpdateLeadValue();
  const { data: insights } = useLeadInsights(client?.id ?? "");

  const [currentStatus, setCurrentStatus] = useState(client?.status ?? "");
  const [stageSuggestion, setStageSuggestion] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState(false);
  const [valueInput, setValueInput] = useState("");

  useEffect(() => {
    setCurrentStatus(client?.status ?? "");
    setStageSuggestion(null);
    setEditingValue(false);
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
      { onError: () => setCurrentStatus(prev) }
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
  const activeIdx = STAGES.indexOf(currentStatus);
  const currentTemp = insights?.temperature;
  const tempConfig = TEMPERATURES.find((t) => t.value === currentTemp);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-[480px] w-[480px] p-0 flex flex-col gap-0 overflow-hidden h-full">

        {/* Header */}
        <div className="px-6 pt-7 pb-6 border-b border-border/40 shrink-0">

          {/* Client identity */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative shrink-0">
              <Avatar className={`h-14 w-14 rounded-2xl ring-[2.5px] ring-offset-2 ring-offset-background ${tempConfig?.ring ?? "ring-border/40"}`}>
                <AvatarImage src={client.image} />
                <AvatarFallback className="rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-base">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold text-lg text-foreground leading-snug truncate">
                  {client.name}
                </h2>
                {currentTemp && tempConfig && (
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tempConfig.badge}`}>
                    {currentTemp}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                <p className="text-[13px] text-muted-foreground truncate">
                  {client.businessIndustry || "No industry"}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-3">
                {/* Inline value edit */}
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
                  <button
                    onClick={handleValueEdit}
                    className="flex items-center gap-1.5 group/val"
                  >
                    <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 group-hover/val:underline">
                      {formattedValue}
                    </span>
                    <Pencil className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover/val:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <button
                    onClick={handleValueEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-600/50 bg-emerald-50/60 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group/val"
                  >
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Add value
                    </span>
                    <Pencil className="h-3 w-3 text-emerald-400/60 opacity-0 group-hover/val:opacity-100 transition-opacity" />
                  </button>
                )}

                {insights?.score !== undefined && (
                  <div className="flex items-center gap-1 ml-1">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-[13px] font-medium text-muted-foreground">
                      {insights.score}% score
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Temperature segmented control */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Temperature
                {insights?.isManualTemperature && (
                  <span className="ml-2 normal-case font-semibold text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                    manual
                  </span>
                )}
              </span>
              {insights?.isManualTemperature && (
                <button
                  onClick={() => handleTemperatureChange(null)}
                  disabled={updateTemperature.isPending}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  Auto
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 dark:bg-muted/20 rounded-xl">
              {TEMPERATURES.map((t) => {
                const isActive = currentTemp === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => handleTemperatureChange(t.value)}
                    disabled={updateTemperature.isPending}
                    className={`h-8 rounded-lg text-[12px] font-semibold transition-all duration-150 disabled:opacity-50 ${
                      isActive
                        ? `${t.activeBg} ${t.activeText}`
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Inline stage suggestion */}
            {stageSuggestion && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200/70 dark:border-amber-500/20">
                <ArrowRight className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-[12px] text-amber-800 dark:text-amber-300 flex-1">
                  Move to <span className="font-semibold">{stageSuggestion}</span>?
                </p>
                <button
                  onClick={() => handleStatusChange(stageSuggestion)}
                  disabled={updateStatus.isPending}
                  className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors disabled:opacity-50 shrink-0"
                >
                  Move
                </button>
                <button
                  onClick={() => setStageSuggestion(null)}
                  className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Pipeline stage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pipeline Stage
              </span>
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={updateStatus.isPending}
              >
                <SelectTrigger size="sm" className="h-7 text-[12px] w-auto border-border/50 gap-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STAGE_COLORS[currentStatus] ?? "bg-gray-400"}`} />
                    <span className={STAGE_TEXT[currentStatus] ?? ""}>
                      <SelectValue />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage} className="text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STAGE_COLORS[stage]}`} />
                        {stage}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              {STAGES.slice(0, 5).map((stage, idx) => {
                const isActive = stage === currentStatus;
                const isPast = currentStatus !== "Inactive Client" && idx < activeIdx;
                return (
                  <button
                    key={stage}
                    onClick={() => handleStatusChange(stage)}
                    title={stage}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 focus:outline-none ${
                      isActive
                        ? `${STAGE_COLORS[stage]} opacity-100`
                        : isPast
                        ? `${STAGE_COLORS[stage]} opacity-35`
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                );
              })}
            </div>

            {currentStatus === "Inactive Client" && (
              <p className="text-[11px] text-rose-500 mt-2 font-medium">Marked as inactive</p>
            )}
          </div>
        </div>

        {/* Suggested action strip */}
        {insights?.recommendedAction && (
          <div className="px-6 py-3 border-b border-border/40 flex items-center gap-3 bg-muted/20 shrink-0">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-0.5">
                AI Suggestion
              </p>
              <p className="text-[12px] text-foreground/75 truncate">{insights.recommendedAction}</p>
            </div>
          </div>
        )}

        {/* Activity */}
        <div className="px-6 pt-4 pb-1 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Activity
          </span>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            <ClientTimeline clientId={client.id} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
