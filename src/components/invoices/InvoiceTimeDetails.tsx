import { useTranslation } from "react-i18next";
import { formatDateValue, formatMoney } from "@/lib/locale-format";
import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";
import { GeneralModal } from "../common/generalmodal";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface TimeItem {
  id: string; userName: string; projectName: string; taskTitle: string | null;
  description: string | null; startedAt: string; minutes: number; hourlyRate: string; amount: string;
}
export function InvoiceTimeDetails({ invoiceId, invoiceNumber, onClose }: {
  invoiceId: string; invoiceNumber: string; onClose: () => void;
}) {
  const {t,i18n} = useTranslation();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const items = useQuery({
    queryKey: ["invoice-time-items", invoiceId],
    queryFn: async () => (await axios.get<{ data: TimeItem[] }>(`/invoices/${invoiceId}/time-items`)).data.data,
  });
  return <GeneralModal open onOpenChange={open => { if (!open) onClose(); }} contentProps={{ className: "sm:max-w-2xl max-h-[90dvh] overflow-y-auto" }}>
    <DialogTitle className="text-lg font-semibold">{t("core.trackedHours")} · {invoiceNumber}</DialogTitle>
    <DialogDescription className="text-xs">{t("core.trackedDesc")}</DialogDescription>
    <p className="text-xs text-muted-foreground">{t("core.timeZone", { zone: timeZone })} · {t("core.currencyUnknown")}</p>
    {items.isPending ? <p role="status" className="text-sm text-muted-foreground">{t("core.loadingTracked")}</p>
      : items.isError ? <div role="alert" className="text-sm">{t("core.trackedError")} <Button type="button" variant="outline" onClick={() => void items.refetch()}>{t("core.retry")}</Button></div>
      : items.data.length === 0 ? <p className="text-sm text-muted-foreground">{t("core.noTracked")}</p>
      : <div className="divide-y divide-border rounded-lg border border-border">{items.data.map(item => <div key={item.id} className="flex items-start justify-between gap-3 p-3 text-sm">
        <div className="min-w-0"><p className="font-medium break-words">{item.taskTitle ?? item.description ?? t("core.entry")}</p>
          <p className="text-xs text-muted-foreground break-words">{item.projectName} · {item.userName} · {formatDateValue(item.startedAt, i18n.language, timeZone)}</p>
          <p className="text-xs text-muted-foreground">{t("core.minutes", { value: item.minutes })} · {t("core.rate", { value: formatMoney(item.hourlyRate, i18n.language) })}</p></div>
        <span className="tabular-nums font-medium text-[#11718c] dark:text-[#55bdd9]">{formatMoney(item.amount, i18n.language)}</span>
      </div>)}</div>}
    <div className="flex justify-end"><Button type="button" variant="outline" onClick={onClose}>{t("common.close")}</Button></div>
  </GeneralModal>;
}
