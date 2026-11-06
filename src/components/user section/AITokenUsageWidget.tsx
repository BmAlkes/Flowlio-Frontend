import { Skeleton } from "@/components/skeletons/Skeleton";
import { useAIOrgUsage } from "@/hooks/useAIOrgUsage";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

function clamp(n: number) { return Math.min(100, Math.max(0, n)); }
function formatPct(pct: number) {
  if (pct === 0 || pct === 100) return pct.toString();
  return pct < 10 ? pct.toFixed(2) : pct.toFixed(1);
}
function barColor(pct: number) {
  if (pct > 80) return "#E5484D";
  if (pct > 60) return "#F2BC3F";
  return "#14A7D4";
}

export const AITokenUsageWidget = ({ className = "" }: { className?: string }) => {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useAIOrgUsage();
  const number = (n: number) => n.toLocaleString(i18n.language);

  const tokensUsed = data?.currentMonth?.totalTokens ?? 0;
  const tokenLimit = data?.limit?.tokenLimit ?? null;
  const pct = clamp(data?.usagePercent ?? 0);
  const isUnlimited = tokenLimit === null;
  const isExceeded = !isUnlimited && tokensUsed >= (tokenLimit ?? Infinity);
  const remaining = isUnlimited ? null : Math.max(0, (tokenLimit ?? 0) - tokensUsed);

  return <section className={`rounded-2xl border border-border bg-card p-5 ${className}`} aria-labelledby="home-tokens-title">
    <header className="flex items-center justify-between gap-3">
      <h2 id="home-tokens-title" className="home-title">{t("dashboard.home.tokensTitle")}</h2>
      <Link to="/dashboard/subscription" className="home-button-primary"><ShoppingCart className="size-3.5" aria-hidden="true" />{t("dashboard.home.buyTokens")}</Link>
    </header>
    {isLoading ? <div className="mt-4 space-y-3"><Skeleton className="h-7 w-40 rounded" /><Skeleton className="h-2 w-full rounded-full" /></div> : <>
      <p className="mt-4 leading-none">
        <span className="home-number text-[1.75rem] font-semibold tabular-nums">{number(tokensUsed)}</span>
        <span className="ms-1.5 text-[13px] font-medium text-muted-foreground">{isUnlimited ? t("dashboard.home.tokensUsed") : t("dashboard.home.tokensOf", { limit: number(tokenLimit ?? 0) })}</span>
      </p>
      {isUnlimited ? <p className="mt-3 text-xs text-muted-foreground">{t("dashboard.home.tokensUnlimited")}</p> : <>
        <div className="home-progress mt-3 h-2" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={t("dashboard.home.tokensTitle")}><span style={{ width: `${pct}%`, background: barColor(pct) }} /></div>
        <p className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span className={isExceeded ? "font-semibold text-destructive" : ""}>{isExceeded ? t("dashboard.home.tokensExceeded") : t("dashboard.home.tokensRemaining", { count: number(remaining ?? 0) })}</span>
          <span>{formatPct(pct)}%</span>
        </p>
      </>}
    </>}
  </section>;
};
