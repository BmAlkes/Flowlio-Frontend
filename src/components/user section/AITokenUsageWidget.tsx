import { Skeleton } from "@/components/skeletons/Skeleton";
import { Badge } from "@/components/ui/badge";
import { Flex } from "@/components/ui/flex";
import { useAIOrgUsage } from "@/hooks/useAIOrgUsage";
import { Bot, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

function usageBarColor(pct: number): string {
  if (pct > 80) return "bg-red-500";
  if (pct > 60) return "bg-yellow-400";
  return "bg-violet-500";
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}

function formatUsagePercent(pct: number): string {
  if (pct === 0 || pct === 100) return pct.toString();
  return pct < 10 ? pct.toFixed(2) : pct.toFixed(1);
}

function LoadingSkeleton() {
  return (
    <div className="p-5 flex gap-6 items-center">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export const AITokenUsageWidget = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useAIOrgUsage();

  const tokensUsed = data?.currentMonth?.totalTokens ?? 0;
  const tokenLimit = data?.limit?.tokenLimit ?? null;
  const rawPct = data?.usagePercent ?? 0;
  const pct = clamp(rawPct);
  const displayedPct = formatUsagePercent(pct);

  const isUnlimited = tokenLimit === null;
  const isExceeded = !isUnlimited && tokensUsed >= (tokenLimit ?? Infinity);
  const remaining = isUnlimited ? null : Math.max(0, (tokenLimit ?? 0) - tokensUsed);

  return (
    <div className="relative overflow-hidden border border-border rounded-2xl bg-gradient-to-br from-card via-card to-violet-50/70 dark:to-violet-950/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-8 -right-8 size-40 rounded-full bg-violet-400/10 dark:bg-violet-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-xl" />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="relative p-5 flex items-center gap-6 flex-wrap">
          {/* Icon */}
          <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/40 shrink-0">
            <Bot className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-[160px]">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              {t("dashboard.aiTokenUsage", "AI Token Usage")}
            </h2>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-400 leading-none mt-1">
              {tokensUsed.toLocaleString()}
              <span className="text-sm font-medium text-muted-foreground ml-1.5">tokens</span>
            </p>
          </div>

          {/* Progress + limit */}
          <div className="flex-1 min-w-[200px] space-y-2">
            {!isUnlimited && (
              <>
                <div className="relative h-2 w-full rounded-full bg-violet-100 dark:bg-violet-900/30 overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${usageBarColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <Flex className="items-center justify-between gap-2">
                  <p className={`text-xs font-medium ${isExceeded ? "text-red-500 dark:text-red-400" : "text-muted-foreground"}`}>
                    {isExceeded
                      ? t("dashboard.limitExceededDetail", "Limit exceeded")
                      : t("dashboard.tokensRemaining", "{{count}} tokens remaining", { count: remaining ?? 0 })}
                  </p>
                  <span className="text-xs text-muted-foreground">{displayedPct}%</span>
                </Flex>
              </>
            )}

            <Flex className="items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">
                {t("dashboard.tokenLimit", "Limit")}:{" "}
                <span className="font-semibold text-foreground">
                  {isUnlimited
                    ? t("dashboard.unlimited", "Unlimited ∞")
                    : (tokenLimit ?? 0).toLocaleString()}
                </span>
              </p>
              {isExceeded && (
                <Badge variant="destructive" className="text-[10px] px-2 py-0">
                  {t("dashboard.limitExceeded", "Exceeded")}
                </Badge>
              )}
              {isUnlimited && (
                <span className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                  <Zap className="h-3 w-3" />
                  {t("dashboard.unlimitedDesc", "No limit on your plan")}
                </span>
              )}
            </Flex>
          </div>
        </div>
      )}
    </div>
  );
};
