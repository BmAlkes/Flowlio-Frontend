import { ComponentWrapper } from "@/components/common/componentwrapper";
import { Stack } from "@/components/ui/stack";
import { Flex } from "@/components/ui/flex";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/skeletons/Skeleton";
import { useAIOrgUsage } from "@/hooks/useAIOrgUsage";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Tailwind fill colour class based on usage percentage. */
function usageBarColor(pct: number): string {
  if (pct > 80) return "bg-red-500 dark:bg-red-500";
  if (pct > 60) return "bg-yellow-400 dark:bg-yellow-400";
  return "bg-green-500 dark:bg-green-500";
}

/** Clamped 0-100 percentage. */
function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <Stack className="p-4 gap-3">
      <Skeleton className="h-5 w-36 rounded-md" />
      <Skeleton className="h-8 w-28 rounded-md" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-4 w-40 rounded-md" />
    </Stack>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export const AITokenUsageWidget = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useAIOrgUsage();

  const tokensUsed = data?.currentMonth?.totalTokens ?? 0;
  const tokenLimit = data?.limit?.tokenLimit ?? null;
  const rawPct = data?.usagePercent ?? 0;
  const pct = clamp(rawPct);

  const isUnlimited = tokenLimit === null;
  const isExceeded = !isUnlimited && tokensUsed >= (tokenLimit ?? Infinity);
  const remaining = isUnlimited ? null : Math.max(0, (tokenLimit ?? 0) - tokensUsed);

  return (
    <ComponentWrapper className="w-full">
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <Stack className="p-4 gap-3">
          {/* ── Header ── */}
          <Flex className="items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
            <h2 className="text-base font-medium text-foreground">
              {t("dashboard.aiTokenUsage", "AI Token Usage")}
            </h2>
          </Flex>

          {/* ── Tokens used ── */}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              {t("dashboard.tokensUsedThisMonth", "Tokens used this month")}
            </p>
            <p className="text-2xl font-bold text-foreground leading-none">
              {tokensUsed.toLocaleString()}
            </p>
          </div>

          {/* ── Limit row ── */}
          <Flex className="items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {t("dashboard.tokenLimit", "Token limit")}:{" "}
              <span className="font-medium text-foreground">
                {isUnlimited
                  ? t("dashboard.unlimited", "Unlimited")
                  : (tokenLimit ?? 0).toLocaleString()}
              </span>
            </p>
            {isExceeded && (
              <Badge variant="destructive" className="text-[11px]">
                {t("dashboard.limitExceeded", "Limit Exceeded")}
              </Badge>
            )}
          </Flex>

          {/* ── Progress bar (only when there is a limit) ── */}
          {!isUnlimited && (
            <div className="space-y-1">
              <div className="relative h-2 w-full rounded-full bg-primary/20 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${usageBarColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <Flex className="items-center justify-between">
                <p
                  className={`text-xs font-medium ${
                    isExceeded
                      ? "text-red-500 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {isExceeded
                    ? t("dashboard.limitExceededDetail", "Limit exceeded")
                    : t("dashboard.tokensRemaining", "{{count}} tokens remaining", {
                        count: remaining ?? 0,
                      })}
                </p>
                <p className="text-xs text-muted-foreground">{pct}%</p>
              </Flex>
            </div>
          )}

          {/* ── Unlimited label (no progress bar needed) ── */}
          {isUnlimited && (
            <p className="text-xs text-muted-foreground">
              {t(
                "dashboard.unlimitedDesc",
                "No token limit set for your plan."
              )}
            </p>
          )}
        </Stack>
      )}
    </ComponentWrapper>
  );
};
