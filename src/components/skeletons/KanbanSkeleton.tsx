import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface KanbanSkeletonProps {
  /** Number of kanban columns (default: 5) */
  columns?: number;
  /** Cards per column (default: 3) */
  cardsPerColumn?: number;
  /** Extra className */
  className?: string;
}

/**
 * Matches KanbanBoard layout:
 * - Horizontal columns with column header + card stack
 * - Each card: title, project tag, due date, avatar
 */
export const KanbanSkeleton = memo(
  ({
    columns = 5,
    cardsPerColumn = 3,
    className,
  }: KanbanSkeletonProps) => {
    return (
      <div className={cn("flex gap-4 overflow-x-auto pb-4 w-full", className)}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="flex-shrink-0 w-64 flex flex-col gap-3"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>

            {/* Cards */}
            {Array.from({ length: cardsPerColumn }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="bg-card rounded-lg p-4 flex flex-col gap-3 shadow-sm border border-border"
              >
                {/* Task title */}
                <Skeleton className="h-4 w-full" />
                <Skeleton
                  className="h-4"
                  style={{ width: `${55 + (cardIdx * 13 + colIdx * 7) % 40}%` }}
                />

                {/* Project tag */}
                <Skeleton className="h-5 w-20 rounded-full" />

                {/* Footer: due date + avatar */}
                <div className="flex items-center justify-between mt-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
);

KanbanSkeleton.displayName = "KanbanSkeleton";
