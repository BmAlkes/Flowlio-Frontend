import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, PlayCircle, Zap } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AUTOMATIONS,
  useRunAutomation,
  type AutomationKey,
  type RunAutomationResult,
} from "@/hooks/useAutomations";

const SuperAdminAutomationsPage = () => {
  const runAutomation = useRunAutomation();
  const [results, setResults] = useState<
    Partial<Record<AutomationKey, RunAutomationResult>>
  >({});

  const handleRun = (key: AutomationKey) => {
    runAutomation.mutate(key, {
      onSuccess: (data) => {
        setResults((prev) => ({ ...prev, [key]: data.data }));
      },
    });
  };

  return (
    <Box className="px-2">
      <Stack className="gap-1 mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Automations
        </h1>
        <p className="text-muted-foreground">
          Background jobs that notify users automatically. Use "Run now" to
          trigger a job manually for QA without waiting for its schedule.
        </p>
      </Stack>

      <Stack className="gap-4">
        {AUTOMATIONS.map((automation) => {
          const result = results[automation.key];
          const isRunningThis =
            runAutomation.isPending &&
            runAutomation.variables === automation.key;

          return (
            <Card key={automation.key}>
              <CardHeader>
                <Flex className="items-center justify-between gap-4">
                  <CardTitle className="text-lg">
                    {automation.title}
                  </CardTitle>
                  <Badge variant="secondary">{automation.schedule}</Badge>
                </Flex>
              </CardHeader>
              <CardContent>
                <Flex className="items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    {automation.description}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleRun(automation.key)}
                    disabled={isRunningThis}
                    className="shrink-0"
                  >
                    {isRunningThis ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Run now
                      </>
                    )}
                  </Button>
                </Flex>

                {result &&
                  (() => {
                    const skipped = result.errors.filter((e) =>
                      e.toLowerCase().includes("skipping email"),
                    );
                    const failures = result.errors.filter(
                      (e) => !e.toLowerCase().includes("skipping email"),
                    );

                    return (
                      <Box
                        className={`mt-4 rounded-lg border p-3 text-sm ${
                          failures.length > 0
                            ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-900/20"
                            : "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-900/20"
                        }`}
                      >
                        <Flex className="items-center gap-2 font-medium">
                          {failures.length > 0 ? (
                            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          Last run: {result.tasksFound} task(s) found,{" "}
                          {result.emailsSent} email(s) sent,{" "}
                          {result.emailsFailed} failed
                        </Flex>
                        {result.tasksFound === 0 && (
                          <p className="text-muted-foreground mt-1">
                            No matching tasks — nothing to notify. If you
                            expected a task to be found, check it isn't
                            already marked as notified.
                          </p>
                        )}
                        {failures.length > 0 && (
                          <ul className="mt-2 list-disc pl-5 space-y-0.5 text-rose-700 dark:text-rose-400">
                            {failures.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        )}
                        {skipped.length > 0 && (
                          <details className="mt-2 text-muted-foreground">
                            <summary className="cursor-pointer select-none">
                              {skipped.length} task(s) skipped — no assignee
                              or project manager to notify
                            </summary>
                            <ul className="mt-1.5 list-disc pl-5 space-y-0.5">
                              {skipped.map((msg, i) => (
                                <li key={i}>{msg}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </Box>
                    );
                  })()}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default SuperAdminAutomationsPage;
