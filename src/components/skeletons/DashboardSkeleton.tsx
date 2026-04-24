import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";
import { CardSkeleton } from "./CardSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { ListSkeleton } from "./ListSkeleton";

interface DashboardSkeletonProps {
  className?: string;
}

/**
 * Composite skeleton matching dashboard.page.tsx exactly:
 * - 4 stat cards (top row)
 * - Bar chart + ongoing tasks carousel (left column)
 * - Pie chart + recent activities (right column)
 */
export const DashboardSkeleton = memo(({ className }: DashboardSkeletonProps) => {
  return (
    <div className={cn("pt-5 flex flex-col gap-3 px-2", className)}>
      {/* Stats row */}
      <CardSkeleton count={4} />

      {/* Main content area */}
      <div className="flex max-[950px]:flex-col items-start gap-3">
        {/* Left column */}
        <div className="w-full flex flex-col gap-3">
          {/* Bar chart */}
          <ChartSkeleton height={280} withLegend />

          {/* Ongoing tasks carousel */}
          <div className="bg-card rounded-xl shadow-[0_5px_10px_rgba(0,0,0,0.1)] p-5">
            <div className="flex items-center gap-2 mb-5">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-w-[17.5rem] bg-muted/50 rounded-lg p-4 flex flex-col gap-3"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center gap-2 mt-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Team productivity chart */}
          <ChartSkeleton height={240} />
        </div>

        {/* Right column */}
        <div className="max-[950px]:w-full flex flex-col items-start gap-3">
          {/* Pie chart */}
          <div className="bg-card rounded-xl shadow-[0_5px_10px_rgba(0,0,0,0.1)] p-5 w-full">
            <Skeleton className="h-5 w-36 mb-4" />
            <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            <div className="flex flex-col gap-3 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent activities */}
          <div className="bg-card rounded-xl shadow-[0_5px_10px_rgba(0,0,0,0.1)] p-5 w-full">
            <Skeleton className="h-5 w-40 mb-6" />
            <div className="h-0.5 bg-muted rounded-full mb-5" />
            <ListSkeleton rows={5} />
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardSkeleton.displayName = "DashboardSkeleton";
