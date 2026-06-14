import { Skeleton } from "@/components/skeletons/Skeleton";
import { Badge } from "@/components/ui/badge";
import { useAIOrgUsage } from "@/hooks/useAIOrgUsage";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

function clamp(n: number) { return Math.min(100, Math.max(0, n)); }
function formatPct(pct: number) {
  if (pct === 0 || pct === 100) return pct.toString();
  return pct < 10 ? pct.toFixed(2) : pct.toFixed(1);
}
function barColor(pct: number) {
  if (pct > 80) return "bg-red-500";
  if (pct > 60) return "bg-amber-400";
  return "bg-blue-500";
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
    <div className={[
      "relative overflow-hidden border border-border rounded-2xl p-5",
      "bg-gradient-to-br from-card via-card to-blue-50/60 dark:to-blue-950/30",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
    ].join(" ")}>
      {/* Same decorative blobs as OngoingTaskCard */}
      <div className="pointer-events-none absolute -top-8 -right-8 size-36 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-xl" />

      {isLoading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      ) : (
        <div className="relative flex items-center gap-5 flex-wrap">

          {/* Icon — dark pill same as stat cards */}
          <div className="p-2.5 rounded-xl bg-foreground shrink-0">
            <Sparkles className="size-5 text-background" />
          </div>

          {/* Label + count */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-foreground text-sm">
                {t("dashboard.aiTokenUsage", "AI Token Usage")}
              </p>
              {isExceeded && (
                <Badge variant="destructive" className="text-[10px] px-2 py-0 h-4">
                  {t("dashboard.limitExceeded", "Exceeded")}
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-foreground leading-none">
              {tokensUsed.toLocaleString()}
              <span className="text-sm font-medium text-muted-foreground ml-1.5">tokens</span>
            </p>
          </div>

          {/* Progress section */}
          <div className="flex-1 min-w-[180px] space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("dashboard.tokenLimit", "Limit")}:{" "}
                <span className="font-semibold text-foreground">
                  {isUnlimited ? "∞ Unlimited" : (tokenLimit ?? 0).toLocaleString()}
                </span>
              </span>
              {!isUnlimited && (
                <span className={isExceeded ? "text-red-500 font-semibold" : ""}>{formatPct(pct)}%</span>
              )}
            </div>

            {!isUnlimited ? (
              <>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isExceeded
                    ? t("dashboard.limitExceededDetail", "Limit exceeded")
                    : t("dashboard.tokensRemaining", "{{count}} remaining", { count: remaining ?? 0 })}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("dashboard.unlimitedDesc", "No token limit on your plan")}
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
