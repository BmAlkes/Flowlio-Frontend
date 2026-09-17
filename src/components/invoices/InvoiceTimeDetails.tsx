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
  const items = useQuery({
    queryKey: ["invoice-time-items", invoiceId],
    queryFn: async () => (await axios.get<{ data: TimeItem[] }>(`/invoices/${invoiceId}/time-items`)).data.data,
  });
  return <GeneralModal open onOpenChange={open => { if (!open) onClose(); }} contentProps={{ className: "sm:max-w-2xl max-h-[90dvh] overflow-y-auto" }}>
    <DialogTitle className="text-lg font-semibold">Tracked hours · {invoiceNumber}</DialogTitle>
    <DialogDescription className="text-xs">Hours and rates recorded when this invoice was created.</DialogDescription>
    {items.isPending ? <p role="status" className="text-sm text-muted-foreground">Loading tracked hours…</p>
      : items.isError ? <div role="alert" className="text-sm">Could not load tracked hours. <Button type="button" variant="outline" onClick={() => void items.refetch()}>Retry</Button></div>
      : items.data.length === 0 ? <p className="text-sm text-muted-foreground">This invoice has no linked time records.</p>
      : <div className="divide-y divide-border rounded-lg border border-border">{items.data.map(item => <div key={item.id} className="flex items-start justify-between gap-3 p-3 text-sm">
        <div className="min-w-0"><p className="font-medium break-words">{item.taskTitle ?? item.description ?? "Time entry"}</p>
          <p className="text-xs text-muted-foreground break-words">{item.projectName} · {item.userName} · {new Date(item.startedAt).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">{item.minutes} min · {item.hourlyRate}/h</p></div>
        <span className="tabular-nums font-medium text-[#1797ba]">{item.amount}</span>
      </div>)}</div>}
    <div className="flex justify-end"><Button type="button" variant="outline" onClick={onClose}>Close</Button></div>
  </GeneralModal>;
}
