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

// Per-card accent colour story
const PALETTE = [
  {
    gradient: "from-indigo-500/10 via-indigo-400/5 to-card",
    blob: "bg-indigo-400/20 dark:bg-indigo-500/15",
    border: "border-indigo-200/60 dark:border-indigo-700/40",
    accent: "bg-indigo-500",
    count: "text-indigo-700 dark:text-indigo-300",
    iconBg: "bg-indigo-500/15 dark:bg-indigo-500/20",
    iconFilter: "drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]",
  },
  {
    gradient: "from-emerald-500/10 via-emerald-400/5 to-card",
    blob: "bg-emerald-400/20 dark:bg-emerald-500/15",
    border: "border-emerald-200/60 dark:border-emerald-700/40",
    accent: "bg-emerald-500",
    count: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    iconFilter: "drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]",
  },
  {
    gradient: "from-amber-500/10 via-amber-400/5 to-card",
    blob: "bg-amber-400/20 dark:bg-amber-500/15",
    border: "border-amber-200/60 dark:border-amber-700/40",
    accent: "bg-amber-500",
    count: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
    iconFilter: "drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]",
  },
  {
    gradient: "from-rose-500/10 via-rose-400/5 to-card",
    blob: "bg-rose-400/20 dark:bg-rose-500/15",
    border: "border-rose-200/60 dark:border-rose-700/40",
    accent: "bg-rose-500",
    count: "text-rose-700 dark:text-rose-300",
    iconBg: "bg-rose-500/15 dark:bg-rose-500/20",
    iconFilter: "drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]",
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
        const pal = PALETTE[index % PALETTE.length];
        const isViewerHours = location.pathname === "/viewer" && index === 3;

        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={item.link} className="block group">
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-0",
                      `bg-gradient-to-br ${pal.gradient}`,
                      pal.border,
                      "hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                    )}
                  >
                    {/* Decorative background blob */}
                    <div
                      className={cn(
                        "pointer-events-none absolute -top-10 -right-10 size-44 rounded-full blur-3xl",
                        pal.blob
                      )}
                    />

                    {/* Thin accent stripe at top */}
                    <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl", pal.accent)} />

                    {isViewerHours ? (
                      /* ── Viewer: circular hours ── */
                      <div className="relative flex items-center justify-between gap-3 mt-1">
                        <div className="flex flex-col gap-3 flex-1">
                          <div className={cn("w-fit p-2.5 rounded-xl", pal.iconBg)}>
                            <img src={item.icon} className={cn("size-7", pal.iconFilter)} alt={item.title} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground">{item.title}</p>
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
                      /* ── Standard metric card ── */
                      <div className="relative flex flex-col gap-3 mt-1">
                        {/* Icon — top right */}
                        <div className="flex items-start justify-between">
                          <div className={cn("p-2.5 rounded-xl", pal.iconBg)}>
                            <img src={item.icon} className={cn("size-7", pal.iconFilter)} alt={item.title} />
                          </div>
                        </div>

                        {/* Count — hero number */}
                        <div>
                          <p className={cn("text-5xl font-black leading-none tracking-tight", pal.count)}>
                            {item.count}
                            {index === 2 && (
                              <span className={cn("text-xl font-semibold ml-1.5 text-muted-foreground", (isSuperAdmin || isViewer) && "hidden")}>
                                {t("dashboard.hoursAbbreviation")}
                              </span>
                            )}
                          </p>
                          <p className="font-semibold text-base text-foreground mt-2 leading-tight">
                            {item.title}
                          </p>
                          <p className={cn("text-sm text-muted-foreground mt-0.5", classNameDescription)}>
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
