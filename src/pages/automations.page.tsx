import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Loader2, PlayCircle, Zap,
  ChevronDown, ChevronUp, History as HistoryIcon,
} from "lucide-react";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useUser } from "@/providers/user.provider";
import {
  AUTOMATIONS,
  useRunAutomation,
  useAutomationSettings,
  useUpdateAutomationSettings,
  useAutomationHistory,
  type AutomationKey,
  type AutomationDefinition,
  type RunAutomationResult,
} from "@/hooks/useAutomations";

// Only "Daily at HH:MM UTC" / "Weekly, <day> at HH:MM UTC" schedules have a
// single fixed hour that makes sense to customize — interval schedules
// ("Every 6 hours") don't.
function parseDefaultHour(schedule: string): number | null {
  const match = schedule.match(/(\d{2}):\d{2}\s*UTC/);
  return match ? parseInt(match[1], 10) : null;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function AutomationCard({
  automation,
  organizationId,
  enabled,
  onToggle,
  isTogglePending,
  scheduleHourUtc,
  onScheduleChange,
}: {
  automation: AutomationDefinition;
  organizationId: string | undefined;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isTogglePending: boolean;
  scheduleHourUtc: number | null;
  onScheduleChange: (hour: number) => void;
}) {
  const defaultHour = parseDefaultHour(automation.schedule);
  const runAutomation = useRunAutomation();
  const [result, setResult] = useState<RunAutomationResult | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { data: historyData, isLoading: historyLoading, isError: historyErrored } = useAutomationHistory(
    automation.key,
    organizationId,
    1,
    historyOpen,
  );
  const runs = historyData?.data?.runs ?? [];

  const isRunningThis =
    runAutomation.isPending && runAutomation.variables === automation.key;

  const handleRun = () => {
    runAutomation.mutate(automation.key, {
      onSuccess: (data) => setResult(data.data),
    });
  };

  return (
    <Card>
      <CardHeader>
        <Flex className="items-center justify-between gap-4">
          <Flex className="items-center gap-3">
            <CardTitle className="text-lg">{automation.title}</CardTitle>
            <Badge variant="secondary">{automation.schedule}</Badge>
          </Flex>
          <Flex className="items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground/90">{enabled ? "On" : "Off"}</span>
            <Switch checked={enabled} onCheckedChange={onToggle} disabled={isTogglePending} />
          </Flex>
        </Flex>
      </CardHeader>
      <CardContent>
        {defaultHour !== null && (
          <Flex className="items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground/90">Runs at</span>
            <Select
              value={String(scheduleHourUtc ?? defaultHour)}
              onValueChange={(v) => onScheduleChange(parseInt(v, 10))}
              disabled={!enabled}
            >
              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {HOURS.map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {String(h).padStart(2, "0")}:00 UTC
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {scheduleHourUtc !== null && scheduleHourUtc !== defaultHour && (
              <span className="text-xs text-muted-foreground/60">(default: {String(defaultHour).padStart(2, "0")}:00 UTC)</span>
            )}
          </Flex>
        )}

        <Flex className="items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground max-w-2xl">
            {automation.description}
          </p>
          <Button
            variant="outline"
            onClick={handleRun}
            disabled={isRunningThis}
            className="shrink-0"
          >
            {isRunningThis ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 me-2" />
                Run now
              </>
            )}
          </Button>
        </Flex>

        {result && (
          <Box
            className={`mt-4 rounded-lg border p-3 text-sm ${
              result.errors.length > 0
                ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-900/20"
                : "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-900/20"
            }`}
          >
            <Flex className="items-center gap-2 font-medium">
              {result.errors.length > 0 ? (
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              Last run: {result.itemsFound} {automation.itemLabel}{" "}
              found, {result.emailsSent} email(s) sent,{" "}
              {result.emailsFailed} failed
            </Flex>
            {result.itemsFound === 0 && (
              <p className="text-muted-foreground mt-1">
                No matching {automation.itemLabel} right now — nothing to notify.
              </p>
            )}
            {result.errors.length > 0 && (
              <ul className="mt-2 list-disc ps-5 space-y-0.5 text-rose-700 dark:text-rose-400">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </Box>
        )}

        <button
          onClick={() => setHistoryOpen((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/90 hover:text-foreground transition-colors"
        >
          <HistoryIcon className="h-3.5 w-3.5" />
          Recent runs
          {historyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {historyOpen && (
          <Box className="mt-2 border border-border rounded-lg divide-y divide-border">
            {historyLoading ? (
              <p className="text-xs text-muted-foreground/90 p-3">Loading history...</p>
            ) : historyErrored ? (
              <p className="text-xs text-muted-foreground/90 p-3">History isn't available yet.</p>
            ) : runs.length ? (
              runs.map((run) => (
                <Flex key={run.id} className="items-center justify-between gap-3 px-3 py-2 text-xs">
                  <Flex className="items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        (run.emailsFailed ?? 0) > 0 ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    <span className="text-muted-foreground/90">
                      {format(new Date(run.runAt), "d MMM HH:mm")}
                    </span>
                    <span className="text-muted-foreground/60 capitalize">({run.triggeredBy})</span>
                  </Flex>
                  <span className="text-foreground">
                    {run.itemsFound ?? 0} found · {run.emailsSent ?? 0} sent
                    {(run.emailsFailed ?? 0) > 0 && `, ${run.emailsFailed} failed`}
                  </span>
                </Flex>
              ))
            ) : (
              <p className="text-xs text-muted-foreground/90 p-3">No runs recorded yet.</p>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

const AutomationsPage = () => {
  const { data: userData } = useUser();
  const organizationId = userData?.user?.organizationId;
  const { data: settingsData } = useAutomationSettings(organizationId);
  const updateSettings = useUpdateAutomationSettings();

  const getEntry = (key: AutomationKey) =>
    settingsData?.data?.find((s) => s.automationKey === key);

  const isEnabled = (key: AutomationKey) => getEntry(key)?.enabled ?? true;
  const getScheduleHour = (key: AutomationKey) => getEntry(key)?.scheduleHourUtc ?? null;

  return (
    <Box className="px-2">
      <Stack className="gap-1 mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Automations
        </h1>
        <p className="text-muted-foreground">
          Background jobs that automatically notify your team by email (and in the notification bell) when something needs attention. Use "Run now" to trigger one manually without waiting for its schedule.
        </p>
      </Stack>

      <Stack className="gap-4">
        {AUTOMATIONS.map((automation) => (
          <AutomationCard
            key={automation.key}
            automation={automation}
            organizationId={organizationId}
            enabled={isEnabled(automation.key)}
            isTogglePending={updateSettings.isPending && updateSettings.variables?.key === automation.key}
            onToggle={(enabled) => {
              if (!organizationId) return;
              updateSettings.mutate({ key: automation.key, enabled, organizationId });
            }}
            scheduleHourUtc={getScheduleHour(automation.key)}
            onScheduleChange={(scheduleHourUtc) => {
              if (!organizationId) return;
              updateSettings.mutate({ key: automation.key, scheduleHourUtc, organizationId });
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default AutomationsPage;
