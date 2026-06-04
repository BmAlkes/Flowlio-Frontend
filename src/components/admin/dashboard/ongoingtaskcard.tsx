import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { type BoxProps } from "@/components/ui/box";
import { Progress } from "@/components/ui/progress";
import { PanelLeftOpen } from "lucide-react";
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

  return (
    <Link to={"/dashboard/task-management"} className="block">
      <div
        className={cn(
          "bg-card border border-border rounded-2xl p-5 flex flex-col gap-5",
          "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
          className
        )}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {/* ── Top row ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="p-2.5 rounded-xl bg-foreground shrink-0">
            <PanelLeftOpen className="size-5 text-background" />
          </div>
          <span className="text-sm text-muted-foreground border border-border rounded-full px-3 py-1 whitespace-nowrap">
            {createdAt}
          </span>
        </div>

        {/* ── Task name + author ── */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-base leading-snug line-clamp-2">
            {taskName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.createdBy")}{" "}
            <span className="text-foreground font-semibold capitalize">
              {createdBy}
            </span>
          </p>
        </div>

        {/* ── Status + assignees ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-full px-3 py-1">
            <span className="size-2 rounded-full bg-blue-500 shrink-0" />
            {t("dashboard.ongoing")}
          </div>

          <div className="flex -space-x-2.5">
            {assignees.slice(0, 4).map(({ src, userName }, key) => (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="size-9 border-2 border-background hover:z-10 relative">
                      <AvatarImage src={src} alt={userName} />
                      <AvatarFallback className="text-xs bg-muted text-foreground font-semibold">
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
              <div className="size-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground font-semibold">
                +{assignees.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* ── Progress ── */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2 rounded-full" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("dashboard.progress")}
            </span>
            <span className="text-sm font-bold text-foreground">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
