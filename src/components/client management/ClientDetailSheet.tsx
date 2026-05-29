import { useState, useEffect } from "react";
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
  useLeadInsights,
  LeadTemperature,
} from "@/hooks/useCRM";
import { DollarSign, Building2, ChevronRight, RotateCcw } from "lucide-react";

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

const TEMPERATURES: {
  value: LeadTemperature;
  label: string;
  active: string;
  badge: string;
}[] = [
  {
    value: "Hot",
    label: "Hot",
    active: "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-900/20 dark:border-orange-500/40 dark:text-orange-300",
    badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-500/30",
  },
  {
    value: "Warm",
    label: "Warm",
    active: "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-500/40 dark:text-amber-300",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500/30",
  },
  {
    value: "Cold",
    label: "Cold",
    active: "bg-sky-50 border-sky-300 text-sky-700 dark:bg-sky-900/20 dark:border-sky-500/40 dark:text-sky-300",
    badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500/30",
  },
  {
    value: "Close",
    label: "Close",
    active: "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500/40 dark:text-emerald-300",
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
  const { data: insights } = useLeadInsights(client?.id ?? "");

  const [currentStatus, setCurrentStatus] = useState(client?.status ?? "");

  useEffect(() => {
    setCurrentStatus(client?.status ?? "");
  }, [client?.status]);

  const handleStatusChange = (newStatus: string) => {
    if (!client || newStatus === currentStatus) return;
    const prev = currentStatus;
    setCurrentStatus(newStatus);
    updateStatus.mutate(
      { clientId: client.id, newStatus, oldStatus: prev },
      { onError: () => setCurrentStatus(prev) }
    );
  };

  const handleTemperatureChange = (temp: LeadTemperature | null) => {
    if (!client) return;
    updateTemperature.mutate({ clientId: client.id, temperature: temp });
  };

  if (!client) return null;

  const initials =
    client.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ?? "?";

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
      <SheetContent className="sm:max-w-[460px] w-[460px] p-0 flex flex-col gap-0 overflow-hidden">

        {/* Client header */}
        <div className="px-6 pt-6 pb-5 border-b border-border/50">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 rounded-xl shrink-0 ring-1 ring-border/40">
              <AvatarImage src={client.image} />
              <AvatarFallback className="rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-[15px] text-foreground leading-snug truncate">
                  {client.name}
                </h2>
                {currentTemp && tempConfig && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tempConfig.badge}`}>
                    {currentTemp}
                    {insights?.isManualTemperature && (
                      <span className="ml-1 opacity-60">·</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                <p className="text-xs text-muted-foreground truncate">
                  {client.businessIndustry || "No industry"}
                </p>
              </div>

              {(formattedValue || insights?.score !== undefined) && (
                <div className="flex items-center gap-2.5 mt-2">
                  {formattedValue && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {formattedValue}
                      </span>
                    </div>
                  )}
                  {formattedValue && insights?.score !== undefined && (
                    <span className="w-px h-3 bg-border/60" />
                  )}
                  {insights?.score !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {insights.score}% lead score
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Temperature */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Temperature
                {insights?.isManualTemperature && (
                  <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500/30 px-1 py-0.5 rounded">
                    manual
                  </span>
                )}
              </span>
              {insights?.isManualTemperature && (
                <button
                  onClick={() => handleTemperatureChange(null)}
                  disabled={updateTemperature.isPending}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  Reset to auto
                </button>
              )}
            </div>

            <div className="flex gap-1.5">
              {TEMPERATURES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTemperatureChange(t.value)}
                  disabled={updateTemperature.isPending}
                  className={`flex-1 h-7 text-[11px] font-semibold rounded-lg border transition-all disabled:opacity-60 ${
                    currentTemp === t.value
                      ? t.active
                      : "bg-transparent border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-muted-foreground">Pipeline Stage</span>
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={updateStatus.isPending}
              >
                <SelectTrigger size="sm" className="h-7 text-xs w-auto border-border/60 gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STAGE_COLORS[currentStatus] ?? "bg-gray-400"}`} />
                    <span className={`font-medium ${STAGE_TEXT[currentStatus] ?? ""}`}>
                      <SelectValue />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage} className="text-xs">
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
                    className={`h-1 flex-1 rounded-full transition-all duration-300 focus:outline-none ${
                      isActive
                        ? `${STAGE_COLORS[stage]} opacity-100`
                        : isPast
                        ? `${STAGE_COLORS[stage]} opacity-40`
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

        {/* Suggested action */}
        {insights?.recommendedAction && (
          <div className="px-6 py-3 border-b border-border/50 bg-muted/30 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Suggested action
              </p>
              <p className="text-xs text-foreground/80 truncate">{insights.recommendedAction}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          </div>
        )}

        {/* Timeline */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-5">
            <ClientTimeline clientId={client.id} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
