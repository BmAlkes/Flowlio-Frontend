import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link2, CheckCircle2 } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export type ContractProject = { id: string; name: string; currency: string | null; retainerId: string | null };
export function ContractProjects({ projects, contractId, currency, revision, path, active, clientId, initialProjectId }: {
 projects: ContractProject[]; contractId: string; currency?: string; revision: number; path: string; active: boolean; clientId?: string; initialProjectId?: string;
}) {
 const { t } = useTranslation(); const cache = useQueryClient();
 const [selected, setSelected] = useState(() => projects.some(p => p.id === initialProjectId && !p.retainerId && p.currency === currency) ? initialProjectId! : "");
 const [operationKeys] = useState(() => new Map<string, string>());
 const linked = projects.filter(p => p.retainerId === contractId);
 const available = projects.filter(p => !p.retainerId && p.currency === currency);
 const mutation = useMutation({ mutationFn: ({ projectId, enabled }: { projectId: string; enabled: boolean }) => {
  const operation = JSON.stringify([path, revision, projectId, enabled]);
  if (!operationKeys.has(operation)) operationKeys.set(operation, crypto.randomUUID());
  return axios.post(path, { key: operationKeys.get(operation), action: "link", projectId, enabled, revision });
 }, onSuccess: async () => { setSelected(""); operationKeys.clear(); await Promise.all([cache.invalidateQueries({ queryKey: ["retainer-detail"] }), cache.invalidateQueries({ queryKey: ["retainers"] })]); } });
 return <details className="border-b border-border p-5 sm:p-6" open={linked.length === 0 || !!initialProjectId}>
  <summary className="cursor-pointer text-sm font-semibold"><span className="inline-flex items-center gap-2"><Link2 className="size-4 text-primary" aria-hidden="true" />{t("retainers.autoHours")}</span></summary>
  <p className="my-3 text-sm leading-relaxed text-muted-foreground">{t("retainers.autoHoursHint")}</p>
  {active && clientId && <Button asChild size="sm" variant="outline" className="mb-4"><Link to={`/dashboard/project/create-project?${new URLSearchParams({ clientId, contractId })}`}>{t("retainers.createLinkedProject")}</Link></Button>}
  {linked.length > 0 && <ul className="mb-3 space-y-2">{linked.map(p => <li key={p.id} className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1 break-words">{p.name}</span><Button size="sm" variant="ghost" disabled={mutation.isPending} onClick={() => mutation.mutate({ projectId: p.id, enabled: false })}>{t("retainers.unlinkProject")}</Button></li>)}</ul>}
  {active && (available.length ? <form className="flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); if (selected && !mutation.isPending) mutation.mutate({ projectId: selected, enabled: true }); }}>
   <label className="min-w-40 flex-1 text-sm">{t("retainers.chooseProject")}<select required disabled={mutation.isPending} className="mt-1 block w-full rounded-md border border-border bg-background p-2" value={selected} onChange={e => { setSelected(e.target.value); mutation.reset(); }}><option value="">{t("retainers.chooseProject")}</option>{available.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><Button type="submit" disabled={!selected || !available.some(p => p.id === selected) || mutation.isPending}>{t("retainers.linkProject")}</Button>
  </form> : <p className="text-sm text-muted-foreground">{t("retainers.noProjectsToLink")}</p>)}
  {mutation.isError && <p role="alert" className="mt-3 text-sm text-destructive">{t("retainers.linkError")}</p>}
 </details>;
}
