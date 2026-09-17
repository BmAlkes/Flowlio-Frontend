import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneralModal } from "../common/generalmodal";
import { useFetchClients } from "@/hooks/usefetchclients";
import { TimeInvoiceInput, useBillableTime, useInvoiceFromTime } from "@/hooks/useTimeInvoicing";
import { displayCents, localDate, timeLineCents, timePeriod } from "./time-invoicing";

interface Props { isOpen: boolean; onClose: () => void }
export function GenerateInvoiceFromTimeModal({ isOpen, onClose }: Props) {
  return isOpen ? <TimeInvoiceForm onClose={onClose} /> : null;
}
function TimeInvoiceForm({ onClose }: { onClose: () => void }) {
  const today = new Date();
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState(localDate(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [endDate, setEndDate] = useState(localDate(today));
  const [fallbackRate, setFallbackRate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [retryRequired, setRetryRequired] = useState(false);
  const attempt = useRef<{ fingerprint: string; payload: TimeInvoiceInput } | null>(null);
  const clients = useFetchClients();
  const period = timePeriod(startDate, endDate);
  const filter = clientId && period ? { clientId, ...period } : null;
  const time = useBillableTime(filter);
  const create = useInvoiceFromTime();
  const entries = time.data?.entries ?? [];
  const chosen = entries.filter(entry => selected[entry.id] === entry.version);
  const needsRate = chosen.some(entry => entry.hourlyRate === null);
  const prices = chosen.map(entry => timeLineCents(entry.duration, entry.hourlyRate ?? fallbackRate));
  const total = prices.reduce<bigint>((sum, price) => sum + (price ?? 0n), 0n);
  const valid = chosen.length > 0 && chosen.length === Object.keys(selected).length && prices.every(price => price !== null)
    && total > 0n && total <= 9999999999n;
  const locked = create.isPending || retryRequired;
  function changeFilter(setter: (value: string) => void, value: string) { setter(value); setSelected({}); }
  async function submit() {
    if (create.isPending) return;
    if (!retryRequired) {
      if (!filter || !valid) return;
      const payload = { ...filter, entries: chosen.map(({ id, version }) => ({ id, version })).sort((a, b) => a.id.localeCompare(b.id)),
        ...(needsRate ? { fallbackRate } : {}), ...(dueDate ? { dueDate } : {}) };
      const fingerprint = JSON.stringify(payload);
      if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, payload: { ...payload, requestKey: crypto.randomUUID() } };
    }
    if (!attempt.current) return;
    try {
      await create.mutateAsync(attempt.current.payload);
      toast.success("Invoice created successfully");
      onClose();
    } catch (error) {
      const response = isAxiosError(error) ? error.response : undefined;
      toast.error(response?.data?.message ?? "Could not confirm creation. Retry to check this same invoice.");
      if (!response || response.status >= 500) setRetryRequired(true);
      else {
        setRetryRequired(false);
        if ([409, 410].includes(response.status)) { attempt.current = null; setSelected({}); await time.refetch(); }
      }
    }
  }
  return <GeneralModal open onOpenChange={open => { if (!open && !create.isPending) onClose(); }}
    withoutCloseButton={create.isPending} contentProps={{ className: "sm:max-w-2xl max-h-[90dvh] overflow-y-auto", onSubmit: event => event.stopPropagation() }}>
    <div className="space-y-5">
      <div className="space-y-1 pe-5">
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold"><Clock className="size-4 text-[#1797ba]" />Invoice from tracked time</DialogTitle>
        <DialogDescription className="text-xs">Select completed, billable hours from your team's accessible client projects.</DialogDescription>
      </div>
      <div className="space-y-1">
        <label htmlFor="time-invoice-client" className="text-sm font-medium">Client</label>
        <Select value={clientId} disabled={locked || clients.isLoading} onValueChange={value => changeFilter(setClientId, value)}>
          <SelectTrigger id="time-invoice-client" className="w-full"><SelectValue placeholder="Select a client" /></SelectTrigger>
          <SelectContent>{clients.data?.data?.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}</SelectContent>
        </Select>
        {clients.isError && <p role="alert" className="text-xs text-destructive">Could not load clients. <button type="button" className="underline" onClick={() => void clients.refetch()}>Retry</button></p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label htmlFor="time-from" className="text-sm font-medium">From</label><Input id="time-from" type="date" className="dark:[color-scheme:dark]" value={startDate} disabled={locked} onChange={e => changeFilter(setStartDate, e.target.value)} /></div>
        <div className="space-y-1"><label htmlFor="time-to" className="text-sm font-medium">To</label><Input id="time-to" type="date" className="dark:[color-scheme:dark]" value={endDate} disabled={locked} onChange={e => changeFilter(setEndDate, e.target.value)} /></div>
      </div>
      {!period && <p role="alert" className="text-xs text-destructive">Choose a valid date range.</p>}
      {time.data?.hasLegacyTimeInvoices && <p role="status" className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">This client has invoices from the previous time-billing workflow. Those invoices have no linked time records. Review them before selecting hours to avoid billing past work again.</p>}
      {filter && <section aria-label="Billable time" className="rounded-lg border border-border overflow-hidden">
        {time.isFetching && <p role="status" className="p-4 text-xs text-muted-foreground">Loading billable hours…</p>}
        {time.isError ? <div role="alert" className="p-4 text-sm">Could not load billable hours. <button type="button" className="text-[#1797ba] underline" onClick={() => void time.refetch()}>Retry</button></div>
          : !time.isFetching && entries.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No unbilled, completed billable hours in this period.</p>
          : entries.length > 0 && <>
            <label className="flex items-center gap-2 bg-muted/30 px-3 py-2 text-xs font-medium">
              <input type="checkbox" className="accent-[#1797ba]" disabled={locked || time.isFetching} checked={chosen.length === entries.length}
                onChange={e => setSelected(e.target.checked ? Object.fromEntries(entries.map(entry => [entry.id, entry.version])) : {})} />Select all ({entries.length})
            </label>
            <div className="max-h-64 overflow-y-auto divide-y divide-border">{entries.map(entry => {
              const price = timeLineCents(entry.duration, entry.hourlyRate ?? fallbackRate);
              return <label key={entry.id} className="flex items-start gap-3 px-3 py-3 text-sm hover:bg-muted/20">
                <input type="checkbox" className="mt-1 accent-[#1797ba]" disabled={locked || time.isFetching} checked={selected[entry.id] === entry.version}
                  onChange={e => setSelected(previous => { const next = { ...previous }; if (e.target.checked) next[entry.id] = entry.version; else delete next[entry.id]; return next; })} />
                <span className="min-w-0 flex-1"><span className="block font-medium break-words">{entry.taskTitle ?? entry.description ?? "Time entry"}</span>
                  <span className="block text-xs text-muted-foreground break-words">{entry.projectName} · {entry.userName} · {new Date(entry.startTime).toLocaleDateString()}</span>
                  <span className="block text-xs text-muted-foreground">{entry.duration} min · {entry.hourlyRate ?? (fallbackRate || "Rate needed")}{entry.hourlyRate || fallbackRate ? "/h" : ""}</span></span>
                <span className="text-sm tabular-nums">{price === null ? "—" : displayCents(price)}</span>
              </label>;
            })}</div>
          </>}
        {time.data?.hasMore && <p className="p-3 text-xs text-muted-foreground">Showing the first 500 entries. Narrow the dates or invoice these entries first.</p>}
      </section>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {needsRate && <div className="space-y-1"><label htmlFor="time-rate" className="text-sm font-medium">Fallback hourly rate</label>
          <Input id="time-rate" type="number" min="0.01" step="0.01" value={fallbackRate} disabled={locked} onChange={e => setFallbackRate(e.target.value)} />
          <p className="text-xs text-muted-foreground">Only used for entries without a recorded rate.</p></div>}
        <div className="space-y-1"><label htmlFor="time-due" className="text-sm font-medium">Due date (optional)</label><Input id="time-due" type="date" className="dark:[color-scheme:dark]" value={dueDate} disabled={locked} onChange={e => setDueDate(e.target.value)} /></div>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[#1797ba]/20 bg-[#1797ba]/5 p-3">
        <div><p className="text-sm font-medium">Total amount</p><p className="text-xs text-muted-foreground">{chosen.length} entries · {(chosen.reduce((sum, entry) => sum + entry.duration, 0) / 60).toFixed(2)}h</p></div>
        <span className="text-lg font-semibold tabular-nums text-[#1797ba]">{prices.some(price => price === null) ? "—" : displayCents(total)}</span>
      </div>
      {retryRequired && <p role="alert" className="text-xs text-muted-foreground">The result could not be confirmed. Retry with this selection to recover the invoice safely.</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={create.isPending} onClick={onClose}>Cancel</Button>
        <Button type="button" className="bg-[#1797ba] hover:bg-[#1797ba]/90 text-white" disabled={create.isPending || (!retryRequired && (!valid || time.isError || time.isFetching))} onClick={() => void submit()}>
          {create.isPending && <Loader2 className="size-4 animate-spin me-2" />}{retryRequired ? "Retry creation" : "Create invoice"}
        </Button>
      </div>
    </div>
  </GeneralModal>;
}
