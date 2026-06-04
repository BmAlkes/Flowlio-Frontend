import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { type BoxProps } from "@/components/ui/box";
import { Progress } from "@/components/ui/progress";
import { PanelLeftOpen, Calendar, User } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { type FC } from "react";
import { useTranslation } from "react-i18next";

interface OngoingTaskCardProps extends BoxProps {
  assignees: Array<{ src: string; userName: string }>;
  createdAt: string | undefined;
  createdBy: string;
  taskName: string;
  progress?: number;
}

export const OngoingTaskCard: FC<OngoingTaskCardProps> = ({
  createdAt,
  assignees,
  createdBy,
  className,
  taskName,
  progress = 0,
  ...props
}) => {
  const { t } = useTranslation();

  const progressColor =
    progress >= 75
      ? "text-emerald-600"
      : progress >= 40
      ? "text-blue-600"
      : "text-orange-500";

  return (
    <Link to={"/dashboard/task-management"} className="block">
      <div
        className={cn(
          "group relative bg-card border border-border rounded-2xl overflow-hidden",
          "hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800",
          "transition-all duration-200 cursor-pointer",
          className
        )}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {/* Top gradient accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

        <div className="p-4 flex flex-col gap-4">

          {/* Row 1: icon + date */}
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900">
              <PanelLeftOpen className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
              <Calendar className="size-3" />
              {createdAt}
            </div>
          </div>

          {/* Row 2: task name + created by */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {taskName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="size-3 shrink-0" />
              <span>{t("dashboard.createdBy")}</span>
              <span className="text-foreground font-medium capitalize truncate">
                {createdBy}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Row 3: status badge + assignees */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full px-3 py-1 border border-blue-100 dark:border-blue-900">
              <span className="size-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
              {t("dashboard.ongoing")}
            </div>

            <div className="flex -space-x-2">
              {assignees.slice(0, 4).map(({ src, userName }, key) => (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="size-7 border-2 border-background hover:z-10 relative transition-transform hover:scale-110">
                        <AvatarImage src={src} alt={userName} />
                        <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                          {userName?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="capitalize">{userName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {assignees.length > 4 && (
                <div className="size-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                  +{assignees.length - 4}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {t("dashboard.progress")}
              </span>
              <span className={cn("font-bold tabular-nums", progressColor)}>
                {progress}%
              </span>
            </div>
            <Progress
              value={progress}
              className="h-1.5 rounded-full bg-muted"
            />
          </div>

        </div>
      </div>
    </Link>
  );
};
