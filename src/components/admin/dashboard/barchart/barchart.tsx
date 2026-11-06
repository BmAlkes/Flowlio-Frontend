import { ChartContainer } from "@/components/ui/chart";
import { useMemo, useState, type FC } from "react";
import { cn } from "@/lib/utils";
import { CalendarPopOver } from "./calendarpopover";
import { type BoxProps } from "@/components/ui/box";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import { useFetchProjectScheduleData, transformToChartData, type ProjectScheduleData, type ScheduleRange } from "@/hooks/useFetchProjectScheduleData";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { ChartSkeleton, ErrorState } from "@/components/skeletons";

export const SCHEDULE_COLORS = { completed: "#14A7D4", progress: "#F2BC3F", delayed: "#EE7A5C" };
const presets = [7, 30, 90] as const;
type Preset = (typeof presets)[number] | "all" | "custom";

const lastDays = (days: number) => ({ from: startOfDay(subDays(new Date(), days - 1)), to: endOfDay(new Date()) });

function ScheduleTooltip({ active, payload }: { active?: boolean; payload?: { payload: ProjectScheduleData }[] }) {
  const { t } = useTranslation();
  const row = active ? payload?.[0]?.payload : undefined;
  if (!row) return null;
  return <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
    <p className="mb-1 font-semibold text-foreground">{row.fullName}</p>
    <p style={{ color: SCHEDULE_COLORS.completed }}>{t("charts.completedTasks")}: {row.Completed}</p>
    <p style={{ color: SCHEDULE_COLORS.progress }}>{t("charts.inProgressTasks")}: {row["In-Progress"]}</p>
    <p style={{ color: SCHEDULE_COLORS.delayed }}>{t("charts.delayedTasks")}: {row.Delayed}</p>
  </div>;
}

export const BarChartComponent: FC<BoxProps> = ({ className }) => {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<Preset>(30);
  const [range, setRange] = useState<ScheduleRange>(() => lastDays(30));
  const { data, isLoading, error } = useFetchProjectScheduleData(range);
  const rows = useMemo(() => transformToChartData(data?.data ?? []), [data]);
  const totals = rows.reduce((sum, row) => ({ completed: sum.completed + row.Completed, progress: sum.progress + row["In-Progress"], delayed: sum.delayed + row.Delayed }), { completed: 0, progress: 0, delayed: 0 });
  const choose = (value: Preset) => { setPreset(value); setRange(value === "all" ? null : value === "custom" ? range : lastDays(value)); };

  return <section className={cn("home-panel flex min-w-0 flex-col p-5", className)} aria-labelledby="home-schedule-title">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 id="home-schedule-title" className="home-title">{t("charts.projectScheduleOverview")}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{preset === "all" ? t("dashboard.home.scheduleAll") : t("dashboard.home.schedulePeriod")} · {t("dashboard.home.tasksCount", { count: totals.completed + totals.progress + totals.delayed })}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t("dashboard.home.period")} className="home-segmented">
          {[...presets, "all" as const].map(value => <button key={value} type="button" aria-pressed={preset === value} onClick={() => choose(value)}>{value === "all" ? t("dashboard.home.allTime") : t("dashboard.home.lastDays", { count: value })}</button>)}
        </div>
        <CalendarPopOver key={range ? `${range.from.getTime()}-${range.to.getTime()}` : "all"} initialDateRange={range ?? undefined} label={range ? undefined : t("dashboard.home.allTime")} onDateRangeChange={next => { setPreset("custom"); setRange(next ? { from: startOfDay(next.from), to: endOfDay(next.to) } : lastDays(30)); }} />
      </div>
    </header>
    <ul className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
      {([["completed", "charts.completedTasks"], ["progress", "charts.inProgressTasks"], ["delayed", "charts.delayedTasks"]] as const).map(([key, label]) => <li key={key} className="flex items-center gap-1.5"><span className="size-2.5 rounded-[3px]" style={{ background: SCHEDULE_COLORS[key] }} />{t(label)} <strong className="font-semibold text-foreground tabular-nums">{totals[key]}</strong></li>)}
    </ul>
    {isLoading ? <ChartSkeleton height={300} className="mt-4 border-0 p-0 shadow-none" />
      : error ? <ErrorState title={t("dashboard.failedToLoadProjectData")} message={error.message} />
      : !rows.length ? <div className="grid h-[300px] place-items-center text-center"><div><p className="font-medium">{t("dashboard.home.scheduleEmpty")}</p>{preset !== "all" && <button type="button" className="mt-2 text-sm font-medium text-[var(--home-brand-ink)] underline-offset-4 hover:underline" onClick={() => choose("all")}>{t("dashboard.home.showAllTime")}</button>}</div></div>
      : <div className="mt-4 overflow-x-auto"><ChartContainer className="h-[300px] w-full" style={{ minWidth: Math.max(rows.length * 104, 320) }} config={{}}>
        <BarChart data={rows} barCategoryGap="22%" margin={{ top: 22, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis dataKey="project" axisLine={false} tickLine={false} tickMargin={10} interval={0} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, (max: number) => Math.max(4, Math.ceil(max * 1.15))]} />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ScheduleTooltip />} />
          <Bar dataKey="Completed" stackId="tasks" fill={SCHEDULE_COLORS.completed} radius={[4, 4, 0, 0]} maxBarSize={88} />
          <Bar dataKey="Delayed" stackId="tasks" fill={SCHEDULE_COLORS.delayed} radius={[4, 4, 0, 0]} maxBarSize={88} />
          <Bar dataKey="In-Progress" stackId="tasks" fill={SCHEDULE_COLORS.progress} radius={[6, 6, 0, 0]} maxBarSize={88}>
            <LabelList position="top" valueAccessor={(entry: { payload: ProjectScheduleData }) => entry.payload.Completed + entry.payload.Delayed + entry.payload["In-Progress"]} className="fill-foreground text-xs font-semibold" />
          </Bar>
        </BarChart>
      </ChartContainer></div>}
  </section>;
};
