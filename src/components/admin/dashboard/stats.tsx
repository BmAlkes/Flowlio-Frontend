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
  trend?: "up" | "down";
};

// Each card gets its own full color identity — light gradient + dark glass
const CARD_ACCENTS = [
  {
    // violet — Total Clients
    card: "from-violet-50 via-white to-violet-50/40 dark:from-violet-950/60 dark:via-slate-900/80 dark:to-slate-800/60",
    border: "border-violet-200/70 dark:border-violet-700/30",
    glow: "#8b5cf6",
    icon: "bg-violet-100 dark:bg-violet-900/60",
    dot: "bg-violet-500",
    sparkColor: "#8b5cf6",
    sparkLine: "M0,34 C40,26 80,16 120,13 C150,10 165,6 180,1",
  },
  {
    // blue — Active Projects
    card: "from-sky-50 via-white to-blue-50/40 dark:from-blue-950/60 dark:via-slate-900/80 dark:to-slate-800/60",
    border: "border-blue-200/70 dark:border-blue-700/30",
    glow: "#3b82f6",
    icon: "bg-blue-100 dark:bg-blue-900/60",
    dot: "bg-blue-500",
    sparkColor: "#3b82f6",
    sparkLine: "M0,28 C35,22 65,30 95,16 C125,6 155,10 180,3",
  },
  {
    // amber — Hours Tracked
    card: "from-amber-50 via-white to-amber-50/40 dark:from-amber-950/60 dark:via-slate-900/80 dark:to-slate-800/60",
    border: "border-amber-200/70 dark:border-amber-700/30",
    glow: "#f59e0b",
    icon: "bg-amber-100 dark:bg-amber-900/60",
    dot: "bg-amber-500",
    sparkColor: "#f59e0b",
    sparkLine: "M0,36 C55,28 100,16 130,10 C155,6 170,3 180,1",
  },
  {
    // rose — Pending Tasks
    card: "from-rose-50 via-white to-rose-50/40 dark:from-rose-950/60 dark:via-slate-900/80 dark:to-slate-800/60",
    border: "border-rose-200/70 dark:border-rose-700/30",
    glow: "#ef4444",
    icon: "bg-rose-100 dark:bg-rose-900/60",
    dot: "bg-rose-500",
    sparkColor: "#ef4444",
    sparkLine: "M0,4 C30,8 70,12 100,18 C130,23 155,29 180,36",
  },
  {
    // emerald — Tasks Completed
    card: "from-emerald-50 via-white to-emerald-50/40 dark:from-emerald-950/60 dark:via-slate-900/80 dark:to-slate-800/60",
    border: "border-emerald-200/70 dark:border-emerald-700/30",
    glow: "#10b981",
    icon: "bg-emerald-100 dark:bg-emerald-900/60",
    dot: "bg-emerald-500",
    sparkColor: "#10b981",
    sparkLine: "M0,38 C30,30 65,20 95,12 C125,6 155,3 180,0",
  },
];

const SparkChart: FC<{ linePath: string; color: string; index: number }> = ({
  linePath,
  color,
  index,
}) => {
  const gradId = `sg-${index}`;
  const areaPath = `${linePath} L180,40 L0,40 Z`;
  return (
    <svg viewBox="0 0 180 40" className="w-full h-9" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
    <div className={cn("grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5", className)}>
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
                      "relative overflow-hidden rounded-2xl flex flex-col border backdrop-blur-sm",
                      "bg-gradient-to-br",
                      accent.card,
                      accent.border,
                      "shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    )}
                  >
                    {/* Subtle corner glow */}
                    <div
                      className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full blur-2xl opacity-30"
                      style={{ backgroundColor: accent.glow }}
                    />

                    {isViewerHours ? (
                      <div className="relative p-5 flex items-center justify-between gap-3">
                        <div className="flex flex-col gap-3 flex-1">
                          <div className={cn("p-2 rounded-lg w-fit", accent.icon)}>
                            <img src={item.icon} className="size-4" alt={item.title} />
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
                      <>
                        {/* Top: label + icon */}
                        <div className="relative px-4 pt-4 pb-2 flex items-start justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground/80">
                            {item.title}
                          </span>
                          <div className={cn("p-1.5 rounded-lg shrink-0", accent.icon)}>
                            <img src={item.icon} className="size-3.5" alt={item.title} />
                          </div>
                        </div>

                        {/* Hero metric */}
                        <div className="px-4 pb-1">
                          <p className="text-[2.4rem] font-black text-foreground leading-none tracking-tight">
                            {item.count}
                            {index === 2 && (
                              <span className={cn("text-base font-medium ml-1 text-muted-foreground", (isSuperAdmin || isViewer) && "hidden")}>
                                {t("dashboard.hoursAbbreviation")}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Sparkline */}
                        <div className="px-3 pb-1">
                          <SparkChart linePath={accent.sparkLine} color={accent.sparkColor} index={index} />
                        </div>

                        {/* Footer label */}
                        <div className="px-4 pb-4 flex items-center gap-1.5">
                          <span className={cn("size-1.5 rounded-full shrink-0", accent.dot)} />
                          <span className="text-[11px] text-muted-foreground/70 truncate">
                            {item.description}
                          </span>
                        </div>
                      </>
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
