import { FinancialAmount } from "@/components/common/FinancialAmount";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteLead, type Lead } from "@/hooks/useLeads";
import { useLeadFields } from "@/hooks/useLeadFields";
import { getWebhookDisplayItems } from "@/utils/webhookFields";
import { useUpdateLeadTemperature, type LeadTemperature } from "@/hooks/useCRM";
import { useBulkLeadAction } from "@/hooks/useLeadExtras";
import { ClientDetailSheet } from "@/components/client management/ClientDetailSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/skeletons";
import { LeadContactActions } from "./LeadContactActions";
import { OVERDUE_PILL, TEMPERATURES, TEMP_TONE, avatarTone, followUpOf, initialsOf, leadTemperature, realEmail, stageTone, type Temperature } from "./lead-ui";

function TempPicker({ leadId, current }: { leadId: string; current: Temperature | null }) {
  const { t } = useTranslation();
  const updateTemp = useUpdateLeadTemperature();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={current ? `ld-pill ${TEMP_TONE[current].pill}` : "ld-empty-value"} aria-label={`${t("pipeline.temperature")}: ${current ? t(`pipeline.temperatures.${current}`) : "—"}`}>
          {current ? t(`pipeline.temperatures.${current}`) : "—"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {TEMPERATURES.map(temp => (
          <button key={temp} type="button" disabled={updateTemp.isPending}
            onClick={() => updateTemp.mutate({ clientId: leadId, temperature: temp as LeadTemperature })}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm ${current === temp ? "bg-muted font-medium" : "hover:bg-muted/60"}`}>
            <span className={`size-2 rounded-full ${TEMP_TONE[temp].dot}`} />{t(`pipeline.temperatures.${temp}`)}
          </button>
        ))}
        {current && (
          <button type="button" onClick={() => updateTemp.mutate({ clientId: leadId, temperature: null })}
            className="w-full text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 text-start border-t border-border mt-1 pt-1.5">
            {t("leadsLayout.clearSelection")}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const LeadsTable = ({ leads, isLoading, filtered }: { leads: Lead[]; isLoading: boolean; filtered: boolean }) => {
  const { t, i18n } = useTranslation();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: leadFields = [] } = useLeadFields();
  const deleteLead = useDeleteLead();
  const bulkAction = useBulkLeadAction();
  const now = new Date();

  const open = (lead: Lead) => { setSelectedLead(lead); setSheetOpen(true); };
  const toggle = (id: string) => setSelected(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const allSelected = leads.length > 0 && leads.every(lead => selected.has(lead.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(leads.map(lead => lead.id)));
  const doBulk = (action: "set_temperature" | "delete", payload?: { temperature?: string }) => {
    bulkAction.mutate({ leadIds: Array.from(selected), action, payload }, {
      onSuccess: result => { toast.success(t("leadsLayout.bulkDone", { count: result.affected ?? selected.size })); setSelected(new Set()); },
      onError: error => toast.error(t("leadsLayout.bulkFailed"), { description: error.message }),
    });
  };
  const day = (date: Date) => date.toLocaleDateString(i18n.language, { day: "numeric", month: "short" });

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="ld-table-card">
      {selected.size > 0 && (
        <div className="ld-bulk-bar">
          <span className="text-sm font-medium">{t("leadsLayout.selected", { count: selected.size })}</span>
          <div className="flex flex-wrap items-center gap-2 ms-auto">
            <Select onValueChange={value => doBulk("set_temperature", { temperature: value })}>
              <SelectTrigger size="sm" className="w-auto gap-1"><SelectValue placeholder={t("leadsLayout.setTemperature")} /></SelectTrigger>
              <SelectContent>{TEMPERATURES.map(temp => <SelectItem key={temp} value={temp}>{t(`pipeline.temperatures.${temp}`)}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-rose-700 border-rose-200 dark:text-rose-300" onClick={() => doBulk("delete")} disabled={bulkAction.isPending}>{t("leadsLayout.delete")}</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>{t("leadsLayout.clearSelection")}</Button>
          </div>
        </div>
      )}

      <div className="ld-table-scroll">
        <table className="w-full text-sm min-w-[920px]">
          <thead>
            <tr>
              <th className="ps-4 pe-1 w-10"><Checkbox aria-label={t("leadsLayout.selectAll")} checked={allSelected} onCheckedChange={toggleAll} /></th>
              <th className="text-start px-3">{t("leadsLayout.colLead")}</th>
              <th className="text-start px-3">{t("leadsLayout.colStage")}</th>
              <th className="text-start px-3">{t("leadsLayout.colTemperature")}</th>
              <th className="text-end px-3">{t("leadsLayout.colValue")}</th>
              <th className="text-start px-3">{t("leadsLayout.colFollowUp")}</th>
              <th className="text-start px-3">{t("leadsLayout.colAssigned")}</th>
              <th className="pe-4"><span className="sr-only">{t("leadsLayout.colActions")}</span></th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-muted-foreground">{filtered ? t("leadsLayout.noMatch") : t("leadsLayout.empty")}</td></tr>
            ) : leads.map(lead => {
              const tone = stageTone(lead.status);
              const followUp = followUpOf(lead, now);
              const temp = leadTemperature(lead);
              const contact = realEmail(lead.email) ?? lead.phone;
              const note = getWebhookDisplayItems(lead.customFields, leadFields)[0];
              return (
                <tr key={lead.id} className={`${followUp?.state === "overdue" ? "ld-row-overdue" : ""} ${selected.has(lead.id) ? "ld-row-selected" : ""}`} onClick={() => open(lead)}>
                  <td className="ps-4 pe-1" onClick={e => e.stopPropagation()}>
                    <Checkbox aria-label={t("leadsLayout.selectLead", { name: lead.name })} checked={selected.has(lead.id)} onCheckedChange={() => toggle(lead.id)} />
                  </td>
                  <td className="px-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar className="size-9 rounded-[10px] shrink-0">
                        <AvatarImage src={lead.image} />
                        <AvatarFallback className={`rounded-[10px] text-xs font-bold ${avatarTone(lead.id)}`}>{initialsOf(lead.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <button type="button" className="block max-w-full truncate text-start font-semibold text-foreground hover:underline" onClick={e => { e.stopPropagation(); open(lead); }}>{lead.name}</button>
                        <p className="text-xs text-muted-foreground truncate">{[contact, lead.webhookName ?? t("leadsLayout.manual")].filter(Boolean).join(" · ")}</p>
                        {note && <p dir="auto" className="mt-1 max-w-[320px] truncate text-xs text-foreground/75" title={`${note.label}: ${note.value}`}>“{note.value}”</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    <span className={`ld-pill ${tone.pill}`}><span className={`size-1.5 rounded-full ${tone.dot}`} />{t(`pipeline.clientStatuses.${lead.status}`, { defaultValue: lead.status })}</span>
                  </td>
                  <td className="px-3" onClick={e => e.stopPropagation()}><TempPicker leadId={lead.id} current={temp} /></td>
                  <td className="px-3 text-end tabular-nums">
                    {lead.leadValue && Number(lead.leadValue) > 0
                      ? <span className="font-semibold text-emerald-700 dark:text-emerald-400"><FinancialAmount value={lead.leadValue} currency={lead.currencyCode} /></span>
                      : <span className="ld-empty-value">—</span>}
                  </td>
                  <td className="px-3">
                    {followUp?.state === "overdue" ? <span className={`ld-pill ${OVERDUE_PILL}`}>{t("leadsLayout.overdue")} · {day(followUp.date)}</span>
                      : followUp?.state === "today" ? <span className="text-xs font-semibold">{t("leadsLayout.today")}</span>
                      : followUp ? <span className="text-xs text-foreground/80">{t("leadsLayout.inDays", { count: followUp.days })}</span>
                      : <span className="ld-empty-value">—</span>}
                  </td>
                  <td className="px-3">
                    {lead.assignedUser ? <span className="text-xs font-medium">{lead.assignedUser.name}</span> : <span className="ld-empty-value">{t("leadsLayout.unassigned")}</span>}
                  </td>
                  <td className="pe-4 ps-2" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <LeadContactActions lead={lead} compact />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label={t("leadsLayout.moreActions", { name: lead.name })}><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => open(lead)}>{t("leadsLayout.viewDetails")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-700 dark:text-rose-300" onClick={() => setDeleteId(lead.id)}>{t("leadsLayout.delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="ld-table-footer">{t("leadsLayout.visibleCount", { count: leads.length })}</div>

      <ClientDetailSheet client={selectedLead ? leads.find(lead => lead.id === selectedLead.id) ?? selectedLead : null} open={sheetOpen} onClose={() => setSheetOpen(false)} isLead />

      <AlertDialog open={!!deleteId} onOpenChange={(value: boolean) => !value && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("leadsLayout.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("leadsLayout.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("leadsLayout.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { if (deleteId) deleteLead.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}>
              {deleteLead.isPending ? <Loader2 className="size-4 animate-spin" /> : t("leadsLayout.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
