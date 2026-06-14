import { Skeleton } from "@/components/skeletons/Skeleton";
import { Badge } from "@/components/ui/badge";
import { useAIOrgUsage } from "@/hooks/useAIOrgUsage";
import { Sparkles, Infinity as InfinityIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

function clamp(n: number) {
  return Math.min(100, Math.max(0, n));
}

function formatPct(pct: number) {
  if (pct === 0 || pct === 100) return pct.toString();
  return pct < 10 ? pct.toFixed(2) : pct.toFixed(1);
}

function barColor(pct: number) {
  if (pct > 80) return "bg-red-500";
  if (pct > 60) return "bg-amber-400";
  return "bg-violet-500";
}

export const AITokenUsageWidget = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useAIOrgUsage();

  const tokensUsed = data?.currentMonth?.totalTokens ?? 0;
  const tokenLimit = data?.limit?.tokenLimit ?? null;
  const pct = clamp(data?.usagePercent ?? 0);
  const isUnlimited = tokenLimit === null;
  const isExceeded = !isUnlimited && tokensUsed >= (tokenLimit ?? Infinity);
  const remaining = isUnlimited ? null : Math.max(0, (tokenLimit ?? 0) - tokensUsed);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-violet-700/40 bg-gradient-to-r from-violet-500/10 via-purple-400/5 to-card hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
      {/* Top accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-violet-500" />

      {/* Background blob */}
      <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full blur-3xl bg-violet-400/15 dark:bg-violet-500/10" />

      {isLoading ? (
        <div className="p-5 flex items-center gap-6">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
          <div className="flex-1 space-y-2 hidden sm:block">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
      ) : (
        <div className="relative p-5 flex items-center gap-6 flex-wrap">

          {/* Icon + label */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-violet-500/15 dark:bg-violet-500/20">
              <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("dashboard.aiTokenUsage", "AI Token Usage")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.tokensUsedThisMonth", "This month")}
              </p>
            </div>
          </div>

          {/* Big number */}
          <div className="shrink-0">
            <p className="text-4xl font-black text-violet-700 dark:text-violet-300 leading-none">
              {tokensUsed.toLocaleString()}
              <span className="text-base font-medium text-muted-foreground ml-1.5">tokens</span>
            </p>
          </div>

          {/* Limit + bar */}
          <div className="flex-1 min-w-[180px] space-y-2">
            {!isUnlimited ? (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("dashboard.tokenLimit", "Limit")}:{" "}
                    <span className="font-semibold text-foreground">
                      {(tokenLimit ?? 0).toLocaleString()}
                    </span>
                  </span>
                  <span className={isExceeded ? "text-red-500 font-semibold" : ""}>{formatPct(pct)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-violet-100 dark:bg-violet-900/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {isExceeded ? (
                    <Badge variant="destructive" className="text-[10px] px-2 py-0">
                      {t("dashboard.limitExceeded", "Limit Exceeded")}
                    </Badge>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.tokensRemaining", "{{count}} remaining", { count: remaining ?? 0 })}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <InfinityIcon className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                  {t("dashboard.unlimited", "Unlimited")}
                </p>
                <span className="text-xs text-muted-foreground">
                  — {t("dashboard.unlimitedDesc", "no limit on your plan")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
