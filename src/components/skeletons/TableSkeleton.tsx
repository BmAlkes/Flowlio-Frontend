import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  /** Number of body rows to render (default: 7) */
  rows?: number;
  /** Number of columns to render (default: 5) */
  columns?: number;
  /** Show an avatar circle in the first column */
  withAvatar?: boolean;
  /** Show action button placeholders in the last column */
  withActions?: boolean;
  /** Extra className for the outer container */
  className?: string;
}

/**
 * Matches the exact layout of ReusableTable / DraggableTable:
 * - Search bar + filter button row
 * - Header row with column labels
 * - N placeholder body rows
 *
 * Spacing, padding and border-radius mirror the real table to prevent CLS.
 */
export const TableSkeleton = memo(
  ({
    rows = 7,
    columns = 5,
    withAvatar = false,
    withActions = false,
    className,
  }: TableSkeletonProps) => {
    const bodyColumns = columns - (withAvatar ? 1 : 0) - (withActions ? 1 : 0);

    return (
      <div className={cn("w-full px-4 py-0", className)}>
        {/* Search + Filter row */}
        <div className="flex justify-between items-center gap-4 mb-6">
          <Skeleton className="h-10 w-full max-w-[400px]" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table container */}
        <div className="rounded-md border overflow-hidden mt-6">
          {/* Header row */}
          <div className="bg-muted flex items-center px-4 py-3 gap-4">
            {withAvatar && <Skeleton className="h-4 w-28 flex-shrink-0" />}
            {Array.from({ length: bodyColumns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
            {withActions && <Skeleton className="h-4 w-24 flex-shrink-0" />}
          </div>

          {/* Body rows */}
          <div className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="flex items-center px-4 py-4 gap-4"
              >
                {withAvatar && (
                  <div className="flex items-center gap-2 flex-shrink-0 w-28">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                )}
                {Array.from({ length: bodyColumns }).map((_, colIdx) => (
                  <Skeleton
                    key={colIdx}
                    className="h-4 flex-1"
                    style={{
                      // Vary widths for a more natural look
                      maxWidth: `${70 + ((rowIdx * 3 + colIdx * 7) % 30)}%`,
                    }}
                  />
                ))}
                {withActions && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

TableSkeleton.displayName = "TableSkeleton";
