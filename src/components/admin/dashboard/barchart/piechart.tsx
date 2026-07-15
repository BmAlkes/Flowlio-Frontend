import { type FC } from "react";
import { cn } from "@/lib/utils";
import { type BoxProps } from "@/components/ui/box";
import { PieChart, Pie, Cell } from "recharts";

type ProjectStatusPieChartProps = {
  data: { name: string; value: number; icon: string; color: string }[];
  title: string;
};

export const ProjectStatusPieChart: FC<
  BoxProps & ProjectStatusPieChartProps
> = ({ className, data, title, ...props }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className={cn(
        "rounded-2xl px-6 py-5 max-md:w-full",
        "bg-white/55 dark:bg-slate-800/55 backdrop-blur-xl",
        "border border-white/70 dark:border-white/[0.09]",
        "shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60",
        className
      )}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      <h1 className="text-base font-semibold text-foreground mb-4">{title}</h1>

      <div className="flex flex-col items-center">
        {/* Donut chart with center label */}
        <div className="relative">
          <PieChart width={220} height={220}>
            <Pie
              data={total === 0 ? [{ name: "Empty", value: 1, icon: "", color: "#e2e8f0" }] : data}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={100}
              paddingAngle={total === 0 ? 0 : 3}
              dataKey="value"
              strokeWidth={0}
            >
              {(total === 0 ? [{ color: "#e2e8f0" }] : data).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-foreground leading-none">{total}</span>
            <span className="text-[11px] text-muted-foreground mt-1 font-medium">Total Projects</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2.5 mt-2">
          {data.map((item, index) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                  <span className="text-xs text-muted-foreground w-9 text-end">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
