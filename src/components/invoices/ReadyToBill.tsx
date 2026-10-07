import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { useDataScope } from "@/hooks/useDataScope";
import { useUser } from "@/providers/user.provider";
import { Button } from "@/components/ui/button";

type Source = { key: string; title: string; client_name: string; amount: string; currency: string; version: string };

export function ReadyToBill() {
 const { data } = useUser();
 const scope = useDataScope();
 const user = data?.user;
 return user && ((user.role === "user" && user.isOrganizationOwner) || ["superadmin", "subadmin"].includes(user.role)) ? <BillingQueue key={scope} /> : null;
}
function BillingQueue() {
 const { t, i18n } = useTranslation(); const scope = useDataScope(); const cache = useQueryClient();
 const [page, setPage] = useState(1); const [prepared, setPrepared] = useState(false);
 const query = useQuery({ queryKey: ["ready-to-bill", scope, page], queryFn: async ({ signal }) =>
  (await axios.get<{ data: { items: Source[]; hasMore: boolean } }>("/invoices/ready-to-bill", { params: { page }, signal })).data.data });
 const mutation = useMutation({ mutationFn: (source: Source) => axios.post("/invoices/ready-to-bill", { key: source.key, version: source.version }),
  onSuccess: async () => { setPrepared(true); await Promise.all([cache.invalidateQueries({ queryKey: ["ready-to-bill"] }), cache.invalidateQueries({ queryKey: ["invoices"] })]); } });
 if (!query.isPending && !query.isError && !query.data?.items.length && !prepared && page === 1) return null;
 return <section className="my-5 space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-5" aria-label={t("retainers.readyToBill")}>
  <div className="flex items-start gap-3"><CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" /><div><h2 className="font-semibold">{t("retainers.readyToBill")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("retainers.readyToBillHint")}</p></div></div>
  {prepared && <p role="status" className="rounded-lg bg-background p-3 text-sm">{t("retainers.invoicePrepared")}</p>}
  {query.isPending ? <p role="status">{t("retainers.loading")}</p> : query.isError ? <div role="alert"><p>{t("retainers.error")}</p><Button variant="outline" onClick={() => void query.refetch()}>{t("retainers.refresh")}</Button></div> :
   <ul className="divide-y divide-border">{query.data?.items.map(source => <li key={source.key} className="flex flex-wrap items-center gap-3 py-3">
    <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{source.title}</p><p className="text-xs text-muted-foreground">{source.client_name} · {t(`retainers.source_${source.key.split(":")[0]}`)}</p></div>
    <span className="text-sm font-semibold tabular-nums">{new Intl.NumberFormat(i18n?.language, { style: "currency", currency: source.currency }).format(Number(source.amount))}</span>
    <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => { setPrepared(false); mutation.mutate(source); }}>{t("retainers.prepareInvoice")}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></Button>
   </li>)}</ul>}
  {mutation.isError && <div role="alert" className="space-y-2"><p className="text-sm text-destructive">{t("retainers.billingError")}</p><Button variant="outline" disabled={query.isFetching} onClick={() => { mutation.reset(); void query.refetch(); }}>{t("retainers.refresh")}</Button></div>}
  {(page > 1 || query.data?.hasMore) && <div className="flex justify-between"><Button variant="ghost" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}>{t("retainers.previous")}</Button><Button variant="ghost" disabled={!query.data?.hasMore || query.isFetching} onClick={() => setPage(page + 1)}>{t("retainers.next")}</Button></div>}
 </section>;
}
