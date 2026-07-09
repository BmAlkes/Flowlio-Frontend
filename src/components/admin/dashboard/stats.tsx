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
    blob1: "bg-violet-500/15 dark:bg-violet-500/12",
    blob2: "bg-purple-500/10 dark:bg-purple-500/10",
    icon: "bg-violet-100/80 dark:bg-violet-900/40",
    dot: "bg-violet-500",
    sparkColor: "#8b5cf6",
    sparkPath: "M0,35 C40,28 80,18 120,15 C150,12 165,8 180,2",
  },
  {
    blob1: "bg-blue-500/15 dark:bg-blue-500/12",
    blob2: "bg-cyan-500/10 dark:bg-cyan-500/10",
    icon: "bg-blue-100/80 dark:bg-blue-900/40",
    dot: "bg-blue-500",
    sparkColor: "#3b82f6",
    sparkPath: "M0,30 C35,25 65,32 95,18 C125,8 155,12 180,4",
  },
  {
    blob1: "bg-amber-500/15 dark:bg-amber-500/12",
    blob2: "bg-orange-500/10 dark:bg-orange-500/10",
    icon: "bg-amber-100/80 dark:bg-amber-900/40",
    dot: "bg-amber-500",
    sparkColor: "#f59e0b",
    sparkPath: "M0,38 C55,30 100,18 130,12 C155,8 170,4 180,2",
  },
  {
    blob1: "bg-rose-500/15 dark:bg-rose-500/12",
    blob2: "bg-pink-500/10 dark:bg-pink-500/10",
    icon: "bg-rose-100/80 dark:bg-rose-900/40",
    dot: "bg-rose-500",
    sparkColor: "#ef4444",
    sparkPath: "M0,5 C30,10 70,14 100,20 C130,24 155,30 180,37",
  },
  {
    blob1: "bg-emerald-500/15 dark:bg-emerald-500/12",
    blob2: "bg-teal-500/10 dark:bg-teal-500/10",
    icon: "bg-emerald-100/80 dark:bg-emerald-900/40",
    dot: "bg-emerald-500",
    sparkColor: "#10b981",
    sparkPath: "M0,40 C30,32 65,22 95,14 C125,8 155,4 180,0",
  },
];

const Sparkline: FC<{ path: string; color: string }> = ({ path, color }) => (
  <svg
    viewBox="0 0 180 42"
    className="absolute bottom-0 right-0 w-32 h-12 opacity-[0.18] pointer-events-none"
    fill="none"
    preserveAspectRatio="none"
  >
    <path
      d={path}
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d={`${path} L180,42 L0,42 Z`}
      fill={color}
      opacity="0.25"
    />
  </svg>
);

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
                      "relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4",
                      "bg-white/55 dark:bg-slate-800/55 backdrop-blur-xl",
                      "border border-white/70 dark:border-white/[0.09]",
                      "shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60",
                      "hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
                    )}
                  >
                    {/* Colored blobs */}
                    <div className={cn("pointer-events-none absolute -top-8 -right-8 size-36 rounded-full blur-2xl", accent.blob1)} />
                    <div className={cn("pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full blur-xl", accent.blob2)} />

                    {/* Sparkline background */}
                    <Sparkline path={accent.sparkPath} color={accent.sparkColor} />

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
                          <span className="text-xs text-muted-foreground border border-border/50 rounded-full px-3 py-1 bg-background/30 backdrop-blur-sm">
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
                            <span className={cn("inline-block size-1.5 rounded-full shrink-0", accent.dot)} />
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
