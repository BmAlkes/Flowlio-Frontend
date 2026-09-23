import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersRound, RefreshCw, CalendarDays } from "lucide-react";
import { WorkspaceHeader, workspacePanel, workspaceToolbar } from "@/components/ui/workspace-page";

export type CapacityMember = {
  id: string; name: string; team: string; availableMinutes: number | null;
  plannedMinutes: number; remainingMinutes: number | null; overloaded: boolean;
  partial: boolean; unestimated: number; unscheduled: number; blocked: number;
  taskCount: number; tasks: { id: string; title: string; projectId: string; projectName: string; blocked: boolean }[];
};
type Report = { weekStart: string; weekEnd: string; teams: string[]; members: CapacityMember[]; hiddenTasks: number; unassigned: number };

export default function TeamCapacityPage() {
  const { t } = useTranslation();
  const { data } = useUser();
  const user = data?.user;
  const allowed = !!user && (["superadmin", "subadmin"].includes(user.role) || (user.role === "user" && (user.isOrganizationOwner || user.isOrganizationManager)));
  const scope = useDataScope();
  const [params, setParams] = useSearchParams();
  const userId = params.get("userId") ?? "";
  const [week, setWeek] = useState(params.get("week") ?? new Date().toISOString().slice(0, 10));
  const [team, setTeam] = useState("");
  const query = useQuery({ queryKey: ["capacity", scope, week, team, userId], enabled: allowed,
    queryFn: async () => (await axios.get<{ data: Report }>("/capacity", { params: { week, ...(userId ? { userId } : {}), ...(team ? { team } : {}) } })).data.data });
  if (!allowed) return <p className="p-6">{t("capacity.forbidden")}</p>;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-foreground sm:px-6">
    <WorkspaceHeader icon={UsersRound} title={t("capacity.title")} description={t("capacity.description")} />
    {userId && <Button variant="outline" onClick={() => setParams({ week })}>{t("attention.all")}</Button>}
    <div className={workspaceToolbar}>
      <label className="text-sm">{t("capacity.week")}<Input type="date" required value={week} onChange={event => { if (event.target.value) setWeek(event.target.value); }} /></label>
      <label className="text-sm">{t("capacity.team")}<select className="block h-9 rounded-md border border-border bg-background px-3" value={team} onChange={event => setTeam(event.target.value)}><option value="">{t("capacity.allTeams")}</option>{query.data?.teams.map(value => <option key={value}>{value}</option>)}</select></label>
      <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw aria-hidden="true" className="size-4" />{t("operations.refresh")}</Button>
      <p className="basis-full text-xs leading-relaxed text-muted-foreground">{t("capacity.method")}</p>
    </div>
    {query.isPending ? <p role="status">{t("common.loading")}</p> : query.isError ? <p role="alert">{t("capacity.error")}</p> : query.data && <>
      <p className="flex items-center gap-2 text-sm font-medium"><CalendarDays aria-hidden="true" className="size-4 text-[#1797ba]" /><span dir="ltr">{query.data.weekStart} — {query.data.weekEnd} · UTC</span></p>
      {!!query.data.hiddenTasks && <p className="rounded-md border border-border p-3 text-sm">{t("capacity.hidden")}</p>}
      {!!query.data.unassigned && <p className="text-sm">{t("capacity.unassigned", { count: query.data.unassigned })}</p>}
      {!query.data.members.length && <p>{t("capacity.empty")}</p>}
      <div className="grid items-start gap-5 lg:grid-cols-2">{query.data.members.map(member => <CapacityMemberRow key={`${member.id}:${member.availableMinutes}:${member.team}`} member={member} />)}</div>
    </>}
  </main>;
}

export function CapacityMemberRow({ member }: { member: CapacityMember }) {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const [hours, setHours] = useState(member.availableMinutes == null ? "" : String(member.availableMinutes / 60));
  const [team, setTeam] = useState(member.team);
  const formatHours = (minutes: number | null) => minutes == null ? t("capacity.unknown") : t("capacity.hours", { value: new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(minutes / 60) });
  const mutation = useMutation({ mutationFn: () => axios.put(`/capacity/${encodeURIComponent(member.id)}`, { weeklyMinutes: hours.trim() === "" ? null : Math.round(Number(hours) * 60), team }), onSuccess: () => { void client.invalidateQueries({ queryKey: ["capacity"] }); } });
  return <section className={`${workspacePanel} overflow-hidden border-t-2 ${member.overloaded ? "border-t-amber-500" : "border-t-[#1797ba]"}`}>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/35 p-5"><div className="flex min-w-0 items-center gap-3"><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1797ba]/10 text-sm font-medium text-[#11718c] dark:text-[#55bdd9]">{member.name.split(/\s+/).slice(0, 2).map(part => part[0]).join("")}</span><div className="min-w-0"><h2 className="break-words text-base font-medium">{member.name}</h2>{member.team && <p className="text-sm text-muted-foreground">{member.team}</p>}</div></div>{member.overloaded && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">{t("capacity.overloaded")}</span>}</header>
    <div className="space-y-4 p-5">
    <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">{[["planned", member.plannedMinutes], ["available", member.availableMinutes], ["remaining", member.remainingMinutes]].map(([label, minutes]) => <div key={label as string}><dt className="text-muted-foreground">{t(`capacity.${label}`)}</dt><dd className="mt-2 text-lg font-medium tabular-nums">{formatHours(minutes as number | null)}</dd></div>)}</dl>
    {member.availableMinutes != null && member.availableMinutes > 0 && <div role="meter" aria-label={`${t("capacity.planned")} / ${t("capacity.available")}`} aria-valuemin={0} aria-valuemax={member.availableMinutes} aria-valuenow={Math.min(member.plannedMinutes, member.availableMinutes)} aria-valuetext={`${formatHours(member.plannedMinutes)} / ${formatHours(member.availableMinutes)}`} className="h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${member.overloaded ? "bg-amber-500" : "bg-[#1797ba]"}`} style={{ width: `${Math.min(100, member.plannedMinutes / member.availableMinutes * 100)}%` }} /></div>}
    {member.partial && <p className="text-sm text-muted-foreground">{t("capacity.partial", { estimates: member.unestimated, dates: member.unscheduled })}</p>}
    <details><summary className="cursor-pointer text-sm text-[#11718c] dark:text-[#55bdd9]">{t("capacity.tasks", { count: member.taskCount, blocked: member.blocked })}</summary><ul className="mt-3 space-y-2">{member.tasks.map(task => <li key={task.id} className="text-sm"><Link className="underline" to={`/dashboard/project/view/${task.projectId}`}>{task.projectName} · {task.title}</Link>{task.blocked && <span> · {t("capacity.blocked")}</span>}</li>)}</ul>{member.taskCount > 10 && <p className="mt-2 text-xs">{t("capacity.taskLimit")}</p>}</details>
    <details><summary className="cursor-pointer text-sm">{t("capacity.configure")}</summary><form className="mt-3 space-y-3" onSubmit={event => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }}><p className="text-xs text-muted-foreground">{t("capacity.settingsNote")}</p><fieldset disabled={mutation.isPending} className="flex flex-wrap items-end gap-3"><label className="text-sm">{t("capacity.weeklyHours")}<Input type="number" min="0" max="168" step="any" value={hours} onChange={event => setHours(event.target.value)} /></label><label className="text-sm">{t("capacity.team")}<Input maxLength={80} value={team} onChange={event => setTeam(event.target.value)} /></label><Button type="submit">{t("common.save")}</Button></fieldset>{mutation.isError && <p role="alert" className="text-sm">{t("capacity.saveError")}</p>}{mutation.isSuccess && <p role="status" className="text-sm">{t("capacity.saved")}</p>}</form></details>
    </div>
  </section>;
}
