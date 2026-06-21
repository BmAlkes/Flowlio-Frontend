import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ReportPeriod } from "@/hooks/useReports";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "ytd", label: "Year" },
  { value: "all", label: "All time" },
];

interface ReportControlsProps {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  updatedAt?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ReportControls = ({ period, onPeriodChange, updatedAt, onRefresh, isRefreshing }: ReportControlsProps) => (
  <Flex className="items-center justify-between flex-wrap gap-3 mb-6">
    {/* Period toggle */}
    <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            period === p.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>

    <Flex className="items-center gap-2">
      {updatedAt && (
        <span className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </span>
      )}
      {onRefresh && (
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isRefreshing} className="h-7 w-7 p-0">
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </Flex>
  </Flex>
);

// ─── Trending indicator ──────────────────────────────────────────────────────

interface TrendBadgeProps {
  change: number | null | undefined;
  suffix?: string;
}

export const TrendBadge = ({ change, suffix = "vs prev" }: TrendBadgeProps) => {
  if (change == null) return null;

  const isUp = change > 0;
  const isDown = change < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const color = isUp ? "text-green-600" : isDown ? "text-rose-600" : "text-muted-foreground";
  const bg = isUp ? "bg-green-50 dark:bg-green-900/20" : isDown ? "bg-rose-50 dark:bg-rose-900/20" : "bg-muted/50";

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${color} ${bg}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(change).toFixed(1)}% {suffix}
    </span>
  );
};
