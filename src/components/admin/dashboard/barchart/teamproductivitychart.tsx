import { type FC } from "react";
import { cn } from "@/lib/utils";
import { type BoxProps } from "@/components/ui/box";
import { useFetchTeamProductivity } from "@/hooks/useReports";
import { ListSkeleton, ErrorState } from "@/components/skeletons";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function getAvatarColor(_name: string, index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const TeamProductivityChart: FC<BoxProps> = ({ className, ...props }) => {
  const { data: productivityResponse, isLoading, error } = useFetchTeamProductivity();
  const chartData = productivityResponse?.data || [];

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl p-5 bg-white/55 dark:bg-slate-800/55 backdrop-blur-xl border border-white/70 dark:border-white/[0.09] shadow-xl", className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        <div className="flex gap-2 mb-4">
          <img src="/dashboard/stat.svg" alt="stat" className="size-5 dark:invert" />
          <h1 className="text-base font-semibold">Team Productivity</h1>
        </div>
        <ListSkeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-2xl p-5 bg-white/55 dark:bg-slate-800/55 backdrop-blur-xl border border-white/70 dark:border-white/[0.09] shadow-xl", className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        <ErrorState title="Failed to load productivity data" message={error.message} />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={cn("rounded-2xl p-5 bg-white/55 dark:bg-slate-800/55 backdrop-blur-xl border border-white/70 dark:border-white/[0.09] shadow-xl", className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        <h1 className="text-base font-semibold mb-4">Team Productivity</h1>
        <p className="text-muted-foreground text-sm text-center py-8">No productivity data available</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-5",
        "bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl",
        "border border-slate-200/60 dark:border-white/[0.07]",
        "shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50",
        className
      )}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <img src="/dashboard/stat.svg" alt="stat" className="size-5 dark:invert" />
          <h1 className="text-base font-semibold">Team Productivity</h1>
        </div>
        <span className="text-xs text-muted-foreground border border-border/60 rounded-full px-3 py-1 bg-muted/20">
          This Week
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border/40">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-blue-500" />
          Total Minutes
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          Completed
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-amber-500" />
          In Progress
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-rose-500" />
          Pending
        </div>
      </div>

      {/* Table rows */}
      <div className="space-y-4">
        {chartData.map((row: any, index: number) => {
          const total = row.totalTasks || 1;
          const completionPct = Math.round((row.completedTasks / total) * 100);
          const avatarColor = getAvatarColor(row.userName, index);
          const initials = getInitials(row.userName);

          return (
            <div key={index} className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold",
                  avatarColor
                )}
              >
                {initials}
              </div>

              {/* Name + progress bar */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate mb-1.5">{row.userName}</p>
                <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, completionPct)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 shrink-0 text-end">
                <div className="text-end hidden sm:block">
                  <p className="text-xs font-semibold text-foreground">{row.totalMinutes?.toLocaleString()}m</p>
                  <p className="text-[10px] text-muted-foreground">time</p>
                </div>
                <div className="text-end">
                  <p className="text-xs font-semibold text-emerald-500">{row.completedTasks}</p>
                  <p className="text-[10px] text-muted-foreground">done</p>
                </div>
                <div className="text-end hidden sm:block">
                  <p className="text-xs font-semibold text-amber-500">{row.inProgressTasks}</p>
                  <p className="text-[10px] text-muted-foreground">active</p>
                </div>
                <div className="text-end">
                  <p className="text-xs font-semibold text-rose-500">{row.pendingTasks}</p>
                  <p className="text-[10px] text-muted-foreground">pending</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
