import { type BoxProps } from "@/components/ui/box";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useFetchOrganizationActivities } from "@/hooks/useFetchOrganizationActivities";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { ListSkeleton } from "@/components/skeletons";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ACTIVITY_ICONS: Record<string, string> = {
  task: "✓",
  client: "+",
  project: "◈",
  time: "◷",
  comment: "◌",
};

function getActivityIcon(activity: string) {
  const lower = activity.toLowerCase();
  if (lower.includes("task")) return ACTIVITY_ICONS.task;
  if (lower.includes("client")) return ACTIVITY_ICONS.client;
  if (lower.includes("project")) return ACTIVITY_ICONS.project;
  if (lower.includes("time") || lower.includes("hour")) return ACTIVITY_ICONS.time;
  if (lower.includes("comment")) return ACTIVITY_ICONS.comment;
  return "·";
}

export const RecentActivities: FC<BoxProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
  const { data: activitiesResponse, isLoading, isFetching } =
    useFetchOrganizationActivities();

  const activitiesContent = activitiesResponse?.data?.activities || [];
  const loading = isLoading || isFetching;

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-semibold text-foreground">
          {t("dashboard.recentActivities")}
        </h1>
        <Link
          to="#"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="max-h-[21rem] overflow-auto scroll space-y-3">
        {loading ? (
          <ListSkeleton rows={5} />
        ) : activitiesContent.length > 0 ? (
          activitiesContent.map(({ id, activity, date, user }) => {
            const dateObj = typeof date === "string" ? new Date(date) : date;
            const timeAgo = formatDistanceToNow(dateObj, { addSuffix: true });
            const avatarColor = getAvatarColor(user);
            const initials = getInitials(user);
            const icon = getActivityIcon(activity);

            return (
              <Link key={id} to={"#"} className="group block">
                <div className="flex items-start gap-3">
                  {/* Colored avatar */}
                  <div
                    className={cn(
                      "size-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold",
                      avatarColor
                    )}
                  >
                    {initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground truncate">{user}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate mt-0.5">
                      {activity}
                    </p>
                  </div>

                  {/* Activity type icon */}
                  <div className="size-7 rounded-full border border-border/60 flex items-center justify-center shrink-0 bg-muted/30 text-muted-foreground text-xs">
                    {icon}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.noRecentActivities")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
