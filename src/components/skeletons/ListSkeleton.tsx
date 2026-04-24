import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  /** Number of list items (default: 5) */
  rows?: number;
  /** Show avatar circle beside each item */
  withAvatar?: boolean;
  /** Extra className for outer container */
  className?: string;
}

/**
 * Matches activity feeds, ongoing-task lists, inbox rows.
 * Each row is a dot/avatar + two lines of text (title + subtitle).
 */
export const ListSkeleton = memo(
  ({ rows = 5, withAvatar = false, className }: ListSkeletonProps) => {
    return (
      <div className={cn("space-y-5 w-full", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 pl-1">
            {/* Dot or avatar */}
            {withAvatar ? (
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 mt-0.5" />
            ) : (
              <Skeleton className="h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1.5" />
            )}

            {/* Text block */}
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton
                className="h-3 w-full"
                style={{
                  maxWidth: `${60 + (i * 11) % 35}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ListSkeleton.displayName = "ListSkeleton";
