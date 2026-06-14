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

const CARD_PALETTE = [
  {
    gradient: "to-indigo-50/70 dark:to-indigo-950/30",
    blob1: "bg-indigo-400/10 dark:bg-indigo-500/10",
    blob2: "bg-violet-400/10 dark:bg-violet-500/10",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    countColor: "text-indigo-700 dark:text-indigo-400",
  },
  {
    gradient: "to-emerald-50/70 dark:to-emerald-950/30",
    blob1: "bg-emerald-400/10 dark:bg-emerald-500/10",
    blob2: "bg-teal-400/10 dark:bg-teal-500/10",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    countColor: "text-emerald-700 dark:text-emerald-400",
  },
  {
    gradient: "to-amber-50/70 dark:to-amber-950/30",
    blob1: "bg-amber-400/10 dark:bg-amber-500/10",
    blob2: "bg-orange-400/10 dark:bg-orange-500/10",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    countColor: "text-amber-700 dark:text-amber-400",
  },
  {
    gradient: "to-rose-50/70 dark:to-rose-950/30",
    blob1: "bg-rose-400/10 dark:bg-rose-500/10",
    blob2: "bg-pink-400/10 dark:bg-pink-500/10",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    countColor: "text-rose-700 dark:text-rose-400",
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
    <div
      className={cn(
        "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {stats.map((item, index) => {
        const pal = CARD_PALETTE[index % CARD_PALETTE.length];
        const isViewerHours = location.pathname === "/viewer" && index === 3;

        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={item.link} className="block group">
                  <div
                    className={cn(
                      "relative overflow-hidden border border-border rounded-2xl p-5 flex flex-col gap-4",
                      `bg-gradient-to-br from-card via-card ${pal.gradient}`,
                      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    )}
                  >
                    {/* Decorative blobs */}
                    <div className={`pointer-events-none absolute -top-8 -right-8 size-36 rounded-full ${pal.blob1} blur-2xl`} />
                    <div className={`pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full ${pal.blob2} blur-xl`} />

                    {isViewerHours ? (
                      /* ── Viewer: circular hours display ── */
                      <div className="relative flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-3 flex-1">
                          <div className={`w-fit p-2.5 rounded-xl ${pal.iconBg} shrink-0`}>
                            <img src={item.icon} className="size-6" alt={item.title} />
                          </div>
                          <div>
                            <h2 className="font-semibold text-sm text-foreground">{item.title}</h2>
                            <p className={cn("text-xs text-muted-foreground mt-0.5", classNameDescription)}>
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
                      /* ── Standard stat card ── */
                      <div className="relative flex flex-col gap-4">
                        {/* Icon */}
                        <div className={`w-fit p-2.5 rounded-xl ${pal.iconBg} shrink-0`}>
                          <img src={item.icon} className="size-6" alt={item.title} />
                        </div>

                        {/* Count + label */}
                        <div>
                          <p className={cn("text-3xl font-bold leading-none", pal.countColor)}>
                            {item.count}
                            {index === 2 && (
                              <span className={cn("text-base font-medium ml-1 text-muted-foreground", (isSuperAdmin || isViewer) && "hidden")}>
                                {t("dashboard.hoursAbbreviation")}
                              </span>
                            )}
                          </p>
                          <h2 className="font-semibold text-sm text-foreground mt-1.5">{item.title}</h2>
                          <p className={cn("text-xs text-muted-foreground mt-0.5", classNameDescription)}>
                            {item.description}
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
