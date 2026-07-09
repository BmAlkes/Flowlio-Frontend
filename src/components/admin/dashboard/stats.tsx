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

const CARD_ACCENTS = [
  {
    blob1: "bg-violet-500/10 dark:bg-violet-500/8",
    blob2: "bg-purple-500/10 dark:bg-purple-500/8",
    icon: "bg-violet-50 dark:bg-violet-900/30",
    dot: "bg-violet-500",
  },
  {
    blob1: "bg-blue-500/10 dark:bg-blue-500/8",
    blob2: "bg-cyan-500/10 dark:bg-cyan-500/8",
    icon: "bg-blue-50 dark:bg-blue-900/30",
    dot: "bg-blue-500",
  },
  {
    blob1: "bg-amber-500/10 dark:bg-amber-500/8",
    blob2: "bg-orange-500/10 dark:bg-orange-500/8",
    icon: "bg-amber-50 dark:bg-amber-900/30",
    dot: "bg-amber-500",
  },
  {
    blob1: "bg-emerald-500/10 dark:bg-emerald-500/8",
    blob2: "bg-teal-500/10 dark:bg-teal-500/8",
    icon: "bg-emerald-50 dark:bg-emerald-900/30",
    dot: "bg-emerald-500",
  },
];

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
        const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={item.link} className="block">
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4",
                      "bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl",
                      "border border-slate-200/60 dark:border-white/[0.07]",
                      "shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50",
                      "hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                    )}
                  >
                    <div className={cn("pointer-events-none absolute -top-8 -right-8 size-36 rounded-full blur-2xl", accent.blob1)} />
                    <div className={cn("pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full blur-xl", accent.blob2)} />

                    {isViewerHours ? (
                      <div className="relative flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-3 flex-1">
                          <div className={cn("p-2.5 rounded-xl w-fit shrink-0", accent.icon)}>
                            <img src={item.icon} className="size-5" alt={item.title} />
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
                        <div className="flex items-center justify-between">
                          <div className={cn("p-2.5 rounded-xl shrink-0", accent.icon)}>
                            <img src={item.icon} className="size-5" alt={item.title} />
                          </div>
                          <span className="text-xs text-muted-foreground border border-border/60 rounded-full px-3 py-1 bg-muted/30">
                            {item.description}
                          </span>
                        </div>

                        <div>
                          <p className="text-3xl font-bold text-foreground leading-none">
                            {item.count}
                            {index === 2 && (
                              <span className={cn("text-lg font-medium ml-1.5 text-muted-foreground", (isSuperAdmin || isViewer) && "hidden")}>
                                {t("dashboard.hoursAbbreviation")}
                              </span>
                            )}
                          </p>
                          <p className="text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5">
                            <span className={cn("inline-block size-1.5 rounded-full", accent.dot)} />
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
