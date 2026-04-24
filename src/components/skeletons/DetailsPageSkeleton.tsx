import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface DetailsPageSkeletonProps {
  /** Show a right sidebar for metadata */
  withSidebar?: boolean;
  /** Show tab navigation skeleton */
  withTabs?: boolean;
  /** Extra className */
  className?: string;
}

/**
 * Matches project-view / client detail page layout:
 * - Hero header area (name, status badge, actions)
 * - Optional tabs row
 * - Content area + optional right sidebar
 */
export const DetailsPageSkeleton = memo(
  ({
    withSidebar = true,
    withTabs = true,
    className,
  }: DetailsPageSkeletonProps) => {
    return (
      <div className={cn("w-full flex flex-col gap-5 px-4 py-6", className)}>
        {/* Hero header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-64" />
            <div className="flex items-center gap-3 mt-1">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border w-full" />

        {/* Tabs */}
        {withTabs && (
          <div className="flex gap-6 border-b border-border pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-20" />
            ))}
          </div>
        )}

        {/* Content area */}
        <div className={cn("flex gap-6", withSidebar ? "items-start" : "")}>
          {/* Main content */}
          <div className="flex-1 flex flex-col gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            {/* Nested table mock */}
            <div className="mt-4 rounded-lg border border-border overflow-hidden">
              <div className="bg-muted px-4 py-3">
                <Skeleton className="h-4 w-32" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 border-t border-border"
                >
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          {withSidebar && (
            <div className="w-64 flex-shrink-0 flex flex-col gap-4">
              <div className="bg-card rounded-xl border p-4 flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DetailsPageSkeleton.displayName = "DetailsPageSkeleton";
