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

const CARD_ACCENTS = [
  {
    glow: "bg-violet-400/25 dark:bg-violet-500/20",
    icon: "bg-violet-100 dark:bg-violet-900/50",
    dot: "bg-violet-500",
    sparkColor: "#8b5cf6",
    sparkLine: "M0,34 C40,26 80,16 120,13 C150,10 165,6 180,1",
  },
  {
    glow: "bg-blue-400/25 dark:bg-blue-500/20",
    icon: "bg-blue-100 dark:bg-blue-900/50",
    dot: "bg-blue-500",
    sparkColor: "#3b82f6",
    sparkLine: "M0,28 C35,22 65,30 95,16 C125,6 155,10 180,3",
  },
  {
    glow: "bg-amber-400/25 dark:bg-amber-500/20",
    icon: "bg-amber-100 dark:bg-amber-900/50",
    dot: "bg-amber-500",
    sparkColor: "#f59e0b",
    sparkLine: "M0,36 C55,28 100,16 130,10 C155,6 170,3 180,1",
  },
  {
    glow: "bg-rose-400/25 dark:bg-rose-500/20",
    icon: "bg-rose-100 dark:bg-rose-900/50",
    dot: "bg-rose-500",
    sparkColor: "#ef4444",
    sparkLine: "M0,4 C30,8 70,12 100,18 C130,23 155,29 180,36",
  },
  {
    glow: "bg-emerald-400/25 dark:bg-emerald-500/20",
    icon: "bg-emerald-100 dark:bg-emerald-900/50",
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
  const gradId = `spark-grad-${index}`;
  const areaPath = `${linePath} L180,40 L0,40 Z`;
  return (
    <svg
      viewBox="0 0 180 40"
      className="w-full h-9"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
                      "relative overflow-hidden rounded-2xl flex flex-col",
                      "bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl",
                      "border border-white/80 dark:border-white/[0.09]",
                      "shadow-xl shadow-slate-100/80 dark:shadow-slate-950/60",
                      "hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
                    )}
                  >
                    {/* Corner glow accent */}
                    <div
                      className={cn(
                        "pointer-events-none absolute -top-6 -right-6 size-28 rounded-full blur-2xl",
                        accent.glow
                      )}
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
                        {/* Card body */}
                        <div className="relative px-4 pt-4 pb-2 flex flex-col gap-2">
                          {/* Label row */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground/70">
                              {item.title}
                            </span>
                            <div className={cn("p-1.5 rounded-md", accent.icon)}>
                              <img src={item.icon} className="size-3.5" alt={item.title} />
                            </div>
                          </div>

                          {/* Hero metric */}
                          <p className="text-[2.4rem] font-black text-foreground leading-none tracking-tight">
                            {item.count}
                            {index === 2 && (
                              <span className={cn("text-base font-medium ml-1 text-muted-foreground", (isSuperAdmin || isViewer) && "hidden")}>
                                {t("dashboard.hoursAbbreviation")}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Sparkline — dedicated visible area */}
                        <div className="px-4 pb-1">
                          <SparkChart
                            linePath={accent.sparkLine}
                            color={accent.sparkColor}
                            index={index}
                          />
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4 flex items-center gap-1.5">
                          <span className={cn("size-1.5 rounded-full shrink-0", accent.dot)} />
                          <span className="text-[11px] text-muted-foreground truncate">
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
