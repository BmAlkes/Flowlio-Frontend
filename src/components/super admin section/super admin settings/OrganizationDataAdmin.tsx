import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DatabaseBackup, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/components/common/generalmodal";

type Organization = { id: string; name: string; subscription_status: string | null; inactive_since: string | null; deletion_warning_sent_at: string | null; deletes_at: string | null; last_backup_at: string | null; backups: number };
type Backup = { id: string; kind: string; row_count: number; size_bytes: number; created_at: string };
type Report = { dryRun: boolean; preRestoreBackupId: string | null; tables: { table: string; before: number; after: number }[]; warnings: string[] };
const KEY = ["superadmin-organization-data"];

function apiMessage(error: unknown) {
  return (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
}

/** Super admin: per-organization backups, restore of a single organization and the 90-day deletion schedule. */
export function OrganizationDataAdmin() {
  const { t, i18n } = useTranslation();
  const cache = useQueryClient();
  const [selected, setSelected] = useState<Organization | null>(null);
  const [plan, setPlan] = useState<{ backup: Backup; report: Report } | null>(null);
  const list = useQuery({
    queryKey: KEY,
    queryFn: async () => (await axios.get<{ data: Organization[]; autoDeleteEnabled: boolean }>("/superadmin/organization-data")).data,
    retry: false,
  });
  const backups = useQuery({
    queryKey: [...KEY, selected?.id],
    enabled: Boolean(selected),
    queryFn: async () => (await axios.get<{ data: Backup[] }>(`/superadmin/organizations/${selected!.id}/backups`)).data.data,
  });
  const backupNow = useMutation({
    mutationFn: async (id: string) => axios.post(`/superadmin/organizations/${id}/backups`),
    onSuccess: () => { toast.success(t("privacy.dataAdmin.backupDone")); void cache.invalidateQueries({ queryKey: KEY }); },
    onError: error => toast.error(apiMessage(error) ?? t("privacy.dataAdmin.failed")),
  });
  const restore = useMutation({
    mutationFn: async ({ backup, confirm }: { backup: Backup; confirm: boolean }) =>
      ({ backup, report: (await axios.post<{ data: Report }>(`/superadmin/organizations/${selected!.id}/restore`, { backupId: backup.id, confirm })).data.data }),
    onSuccess: ({ backup, report }) => {
      if (report.dryRun) { setPlan({ backup, report }); return; }
      setPlan(null);
      toast.success(t("privacy.dataAdmin.restored"));
      void cache.invalidateQueries({ queryKey: KEY });
    },
    onError: error => toast.error(apiMessage(error) ?? t("privacy.dataAdmin.failed")),
  });
  if (list.isError) return null;

  const when = (value: string | null) => (value ? new Date(value).toLocaleString(i18n.language) : "—");
  const day = (value: string | null) => (value ? new Date(value).toLocaleDateString(i18n.language) : "—");
  const organizations = list.data?.data ?? [];

  return (
    <section className="my-4 rounded-xl border bg-card p-5 space-y-4" aria-labelledby="organization-data-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400" aria-hidden="true"><DatabaseBackup className="size-5" /></span>
        <div>
          <h2 id="organization-data-title" className="font-semibold">{t("privacy.dataAdmin.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("privacy.dataAdmin.description")}</p>
          <p className="text-xs mt-1">{list.data?.autoDeleteEnabled ? t("privacy.dataAdmin.autoDeleteOn") : t("privacy.dataAdmin.autoDeleteOff")}</p>
        </div>
      </div>
      {list.isLoading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : (
        <div className="overflow-x-auto border border-border rounded-lg max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0"><tr>
              {["organization", "status", "lastBackup", "deletesAt", ""].map(key => <th key={key} className="text-start px-3 py-2 font-medium">{key && t(`privacy.dataAdmin.${key}`)}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {organizations.map(org => (
                <tr key={org.id}>
                  <td className="px-3 py-2 font-medium">{org.name}</td>
                  <td className="px-3 py-2">{org.subscription_status ?? "—"}</td>
                  <td className="px-3 py-2">{when(org.last_backup_at)} <span className="text-muted-foreground">({org.backups})</span></td>
                  <td className={"px-3 py-2 " + (org.deletes_at ? "text-rose-600" : "")}>{day(org.deletes_at)}{org.deletion_warning_sent_at ? " ✉" : ""}</td>
                  <td className="px-3 py-2 text-end"><Button size="sm" variant="outline" onClick={() => { setSelected(org); setPlan(null); }}>{t("privacy.dataAdmin.manage")}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GeneralModal open={Boolean(selected)} onOpenChange={open => { if (!open) { setSelected(null); setPlan(null); } }} contentProps={{ className: "max-w-2xl" }}>
        {selected && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pe-1">
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <p className="text-sm text-muted-foreground">{t("privacy.dataAdmin.restoreHint")}</p>
            <Button size="sm" variant="outline" disabled={backupNow.isPending} onClick={() => backupNow.mutate(selected.id)}>
              {backupNow.isPending && <Loader2 className="size-3.5 me-2 animate-spin" />}{t("privacy.dataAdmin.backupNow")}
            </Button>
            {plan ? (
              <div className="space-y-3 rounded-lg border border-amber-300 p-3">
                <p className="font-medium">{t("privacy.dataAdmin.dryRunTitle", { date: when(plan.backup.created_at) })}</p>
                <table className="w-full text-xs">
                  <thead><tr><th className="text-start">{t("privacy.dataAdmin.table")}</th><th className="text-end">{t("privacy.dataAdmin.now")}</th><th className="text-end">{t("privacy.dataAdmin.after")}</th></tr></thead>
                  <tbody>{plan.report.tables.map(row => (
                    <tr key={row.table} className={row.before !== row.after ? "font-medium" : "text-muted-foreground"}><td>{row.table}</td><td className="text-end">{row.before}</td><td className="text-end">{row.after}</td></tr>
                  ))}</tbody>
                </table>
                {plan.report.warnings.length > 0 && <ul className="list-disc ps-5 text-xs text-amber-700">{plan.report.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul>}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPlan(null)}>{t("privacy.cancel")}</Button>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white" disabled={restore.isPending} onClick={() => restore.mutate({ backup: plan.backup, confirm: true })}>
                    {restore.isPending && <Loader2 className="size-3.5 me-2 animate-spin" />}{t("privacy.dataAdmin.restoreNow")}
                  </Button>
                </div>
              </div>
            ) : backups.isLoading ? <Loader2 className="size-4 animate-spin" /> : (
              <ul className="divide-y divide-border border border-border rounded-lg">
                {(backups.data ?? []).length === 0 && <li className="p-3 text-sm text-muted-foreground">{t("privacy.dataAdmin.noBackups")}</li>}
                {(backups.data ?? []).map(backup => (
                  <li key={backup.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                    <span>{when(backup.created_at)} · {t(`privacy.dataAdmin.kinds.${backup.kind}`)} · {t("privacy.dataAdmin.rows", { count: backup.row_count })} · {(backup.size_bytes / 1024).toFixed(0)} KB</span>
                    <Button size="sm" variant="outline" disabled={restore.isPending} onClick={() => restore.mutate({ backup, confirm: false })}>
                      {restore.isPending && restore.variables?.backup.id === backup.id && <Loader2 className="size-3.5 me-2 animate-spin" />}{t("privacy.dataAdmin.simulate")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </GeneralModal>
    </section>
  );
}
