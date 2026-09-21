import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axios } from "@/configs/axios.config";
import { useUser } from "@/providers/user.provider";
import { useDataScope } from "@/hooks/useDataScope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [week, setWeek] = useState(new Date().toISOString().slice(0, 10));
  const [team, setTeam] = useState("");
  const query = useQuery({ queryKey: ["capacity", scope, week, team], enabled: allowed,
    queryFn: async () => (await axios.get<{ data: Report }>("/capacity", { params: { week, ...(team ? { team } : {}) } })).data.data });
  if (!allowed) return <p className="p-6">{t("capacity.forbidden")}</p>;
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 text-foreground sm:px-6">
    <header className="space-y-2 border-b border-border pb-5"><h1 className="text-2xl font-medium">{t("capacity.title")}</h1><p className="text-sm text-muted-foreground">{t("capacity.description")}</p></header>
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm">{t("capacity.week")}<Input type="date" required value={week} onChange={event => { if (event.target.value) setWeek(event.target.value); }} /></label>
      <label className="text-sm">{t("capacity.team")}<select className="block h-9 rounded-md border border-border bg-background px-3" value={team} onChange={event => setTeam(event.target.value)}><option value="">{t("capacity.allTeams")}</option>{query.data?.teams.map(value => <option key={value}>{value}</option>)}</select></label>
      <Button variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>{t("operations.refresh")}</Button>
    </div>
    <p className="text-xs text-muted-foreground">{t("capacity.method")}</p>
    {query.isPending ? <p role="status">{t("common.loading")}</p> : query.isError ? <p role="alert">{t("capacity.error")}</p> : query.data && <>
      <p className="text-sm">{query.data.weekStart} — {query.data.weekEnd} · UTC</p>
      {!!query.data.hiddenTasks && <p className="rounded-md border border-border p-3 text-sm">{t("capacity.hidden")}</p>}
      {!!query.data.unassigned && <p className="text-sm">{t("capacity.unassigned", { count: query.data.unassigned })}</p>}
      {!query.data.members.length && <p>{t("capacity.empty")}</p>}
      <div className="divide-y divide-border">{query.data.members.map(member => <CapacityMemberRow key={`${member.id}:${member.availableMinutes}:${member.team}`} member={member} />)}</div>
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
  return <section className="space-y-4 py-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-medium">{member.name}</h2>{member.team && <p className="text-sm text-muted-foreground">{member.team}</p>}</div>{member.overloaded && <span className="rounded-md border border-amber-500/40 px-2 py-1 text-sm">{t("capacity.overloaded")}</span>}</header>
    <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">{[["planned", member.plannedMinutes], ["available", member.availableMinutes], ["remaining", member.remainingMinutes]].map(([label, minutes]) => <div key={label as string}><dt className="text-muted-foreground">{t(`capacity.${label}`)}</dt><dd className="mt-1 font-medium tabular-nums">{formatHours(minutes as number | null)}</dd></div>)}</dl>
    {member.partial && <p className="text-sm text-muted-foreground">{t("capacity.partial", { estimates: member.unestimated, dates: member.unscheduled })}</p>}
    <details><summary className="cursor-pointer text-sm text-[#11718c] dark:text-[#55bdd9]">{t("capacity.tasks", { count: member.taskCount, blocked: member.blocked })}</summary><ul className="mt-3 space-y-2">{member.tasks.map(task => <li key={task.id} className="text-sm"><Link className="underline" to={`/dashboard/project/view/${task.projectId}`}>{task.projectName} · {task.title}</Link>{task.blocked && <span> · {t("capacity.blocked")}</span>}</li>)}</ul>{member.taskCount > 10 && <p className="mt-2 text-xs">{t("capacity.taskLimit")}</p>}</details>
    <details><summary className="cursor-pointer text-sm">{t("capacity.configure")}</summary><form className="mt-3 space-y-3" onSubmit={event => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(); }}><p className="text-xs text-muted-foreground">{t("capacity.settingsNote")}</p><fieldset disabled={mutation.isPending} className="flex flex-wrap items-end gap-3"><label className="text-sm">{t("capacity.weeklyHours")}<Input type="number" min="0" max="168" step="any" value={hours} onChange={event => setHours(event.target.value)} /></label><label className="text-sm">{t("capacity.team")}<Input maxLength={80} value={team} onChange={event => setTeam(event.target.value)} /></label><Button type="submit">{t("common.save")}</Button></fieldset>{mutation.isError && <p role="alert" className="text-sm">{t("capacity.saveError")}</p>}{mutation.isSuccess && <p role="status" className="text-sm">{t("capacity.saved")}</p>}</form></details>
  </section>;
}
