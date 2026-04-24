import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  /** Number of stat cards (default: 4) */
  count?: number;
  /** Height of each card (default: 110px) */
  height?: number;
  /** Extra className */
  className?: string;
}

/**
 * Matches the Stats component grid layout exactly:
 * grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
 * Same padding, spacing, and sizing as ComponentWrapper cards.
 */
export const CardSkeleton = memo(
  ({ count = 4, height = 110, className }: CardSkeletonProps) => {
    return (
      <div
        className={cn(
          "grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl shadow-[0_5px_10px_rgba(0,0,0,0.1)] px-2.5 py-3"
            style={{ minHeight: height }}
          >
            {/* Title + Icon row */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
            </div>
            {/* Count */}
            <Skeleton className="h-6 w-20 mt-5" />
          </div>
        ))}
      </div>
    );
  }
);

CardSkeleton.displayName = "CardSkeleton";
