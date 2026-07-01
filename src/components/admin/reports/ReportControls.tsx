import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Download, FileDown, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ReportPeriod } from "@/hooks/useReports";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "7d",  label: "7 days"   },
  { value: "30d", label: "30 days"  },
  { value: "90d", label: "90 days"  },
  { value: "ytd", label: "Year"     },
  { value: "all", label: "All time" },
];

interface ReportControlsProps {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  updatedAt?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export const ReportControls = ({
  period,
  onPeriodChange,
  updatedAt,
  onRefresh,
  isRefreshing,
  onExportCSV,
  onExportPDF,
}: ReportControlsProps) => (
  <Flex className="items-center justify-between flex-wrap gap-3 mb-2">
    {/* Period toggle */}
    <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            period === p.value
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>

    <Flex className="items-center gap-2">
      {updatedAt && (
        <span className="text-xs text-muted-foreground hidden sm:block">
          Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </span>
      )}
      {onRefresh && (
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      )}
      {(onExportCSV || onExportPDF) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onExportCSV && (
              <DropdownMenuItem onClick={onExportCSV} className="gap-2 cursor-pointer">
                <FileDown className="h-4 w-4" /> Export CSV
              </DropdownMenuItem>
            )}
            {onExportPDF && (
              <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" /> Export PDF
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Flex>
  </Flex>
);

// ─── Trending badge ───────────────────────────────────────────────────────────

export const TrendBadge = ({ change }: { change: number | null | undefined }) => {
  if (change == null) return null;
  const isUp = change > 0;
  const isDown = change < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const color = isUp ? "text-green-600" : isDown ? "text-rose-600" : "text-muted-foreground";
  const bg   = isUp ? "bg-green-50 dark:bg-green-900/20" : isDown ? "bg-rose-50 dark:bg-rose-900/20" : "bg-muted/50";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${color} ${bg}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
};
