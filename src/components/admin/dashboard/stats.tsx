import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@/components/ui/circularprogress";

export type Stat = {
  icon: string;
  title: string;
  count: string;
  description: string;
  link: string;
};

export const Stats: FC<{
  className?: string;
  classNameDescription?: string;
  stats: Stat[];
  isSuperAdmin?: boolean;
  isViewer?: boolean;
  activeTimeData?: {
    elapsedTime: string;
    elapsedSeconds: number;
    progressPercentage: number;
  };
  totalProductionHours?: number;
}> = ({
  classNameDescription,
  className,
  stats,
  isSuperAdmin,
  isViewer,
  activeTimeData,
  totalProductionHours = 0,
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className={cn("grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((item, index) => {
        const isViewerHours = location.pathname === "/viewer" && index === 3;

        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={item.link} className="block">
                  <div
                    className={cn(
                      "relative overflow-hidden border border-border rounded-2xl p-5 flex flex-col gap-4",
                      "bg-gradient-to-br from-card via-card to-blue-50/60 dark:to-blue-950/30",
                      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    )}
                  >
                    {/* Same decorative blobs as OngoingTaskCard */}
                    <div className="pointer-events-none absolute -top-8 -right-8 size-36 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-xl" />

                    {isViewerHours ? (
                      <div className="relative flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-3 flex-1">
                          <div className="p-2.5 rounded-xl bg-foreground w-fit shrink-0">
                            <img src={item.icon} className="size-5 invert dark:invert-0" alt={item.title} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{item.title}</p>
                            <p className={cn("text-sm text-muted-foreground mt-0.5", classNameDescription)}>
                              {item.description}
                            </p>
                          </div>
                          <div className="bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-medium w-fit">
                            {t("dashboard.totalProduction")}: {totalProductionHours.toFixed(1)} {t("dashboard.hoursAbbreviation")}
                          </div>
                        </div>
                        <CircularProgress
                          value={activeTimeData?.progressPercentage ?? 0}
                          time={activeTimeData?.elapsedTime ?? "0:00:00"}
                          label={t("dashboard.totalHours")}
                        />
                      </div>
                    ) : (
                      <div className="relative flex flex-col gap-3">
                        {/* Icon — same dark pill as OngoingTaskCard */}
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-foreground shrink-0">
                            <img src={item.icon} className="size-5 invert dark:invert-0" alt={item.title} />
                          </div>
                          <span className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                            {item.description}
                          </span>
                        </div>

                        {/* Count + title */}
                        <div>
                          <p className="text-3xl font-bold text-foreground leading-none">
                            {item.count}
                            {index === 2 && (
                              <span className={cn("text-lg font-medium ml-1.5 text-muted-foreground", (isSuperAdmin || isViewer) && "hidden")}>
                                {t("dashboard.hoursAbbreviation")}
                              </span>
                            )}
                          </p>
                          <p className="text-sm font-medium text-muted-foreground mt-1.5">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="mb-2">
                <p>{t("dashboard.clickToView", { title: item.title })}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};
