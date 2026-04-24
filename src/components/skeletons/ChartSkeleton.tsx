import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  /** Height of the chart area in px (default: 280) */
  height?: number;
  /** Extra className */
  className?: string;
  /** Show a legend skeleton row */
  withLegend?: boolean;
}

/**
 * Matches barchart.tsx and teamproductivitychart.tsx layouts:
 * - Title + subtitle row
 * - Chart area placeholder
 * - Optional legend dots
 */
export const ChartSkeleton = memo(
  ({ height = 280, className, withLegend = false }: ChartSkeletonProps) => {
    return (
      <div
        className={cn(
          "bg-card rounded-xl shadow-[0_5px_10px_rgba(0,0,0,0.1)] p-5 w-full",
          className
        )}
      >
        {/* Title row */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-56" />
          </div>
          {/* Calendar / filter control placeholder */}
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>

        {/* Chart area */}
        <Skeleton
          className="w-full rounded-lg"
          style={{ height }}
        />

        {/* Legend */}
        {withLegend && (
          <div className="flex items-center gap-6 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ChartSkeleton.displayName = "ChartSkeleton";
