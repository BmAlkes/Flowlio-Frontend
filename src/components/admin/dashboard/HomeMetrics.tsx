import { ArrowUpRight, CheckCheck, Clock3, FolderKanban, ListTodo, UsersRound } from "lucide-react";
import { Link } from "react-router";
import type { Stat } from "./stats";

const icons = [UsersRound, FolderKanban, Clock3, ListTodo, CheckCheck];

export function HomeMetrics({ stats, manager }: { stats: Stat[]; manager: boolean }) {
  return <div className={`home-metrics grid grid-cols-2 gap-3 ${manager ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
    {stats.map((stat, index) => {
      if (!manager && index === 0) return null;
      const Icon = icons[index];
      return <Link key={stat.title} to={stat.link} className={`home-metric group ${manager && index === stats.length - 1 ? "col-span-2 xl:col-span-1" : ""} ${index === 1 ? "home-metric-primary" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <span className="home-metric-icon"><Icon className="size-4" aria-hidden="true" /></span>
          <ArrowUpRight className="size-4 opacity-45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-xs font-medium">{stat.title}</p>
        <p className="home-number mt-1 text-3xl font-semibold tracking-tight tabular-nums">{stat.count}</p>
        <p className="home-metric-description mt-2 text-[11px] leading-4">{stat.description}</p>
      </Link>;
    })}
  </div>;
}
