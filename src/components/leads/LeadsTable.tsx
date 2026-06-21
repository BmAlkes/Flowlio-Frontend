import { useState } from "react";
import { useLeads, useDeleteLead } from "@/hooks/useLeads";
import { useWebhooks } from "@/hooks/useWebhooks";
import { useUpdateLeadTemperature, LeadTemperature } from "@/hooks/useCRM";
import { ClientDetailSheet } from "@/components/client management/ClientDetailSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Search, Trash2, MoreHorizontal, DollarSign, Phone } from "lucide-react";
import { useBulkLeadAction } from "@/hooks/useLeadExtras";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format, isPast, differenceInDays } from "date-fns";
import { TableSkeleton } from "@/components/skeletons";

// Temperature — text only, no emoji
const TEMP: Record<string, { label: string; color: string; dot: string }> = {
  Hot:  { label: "Hot",  color: "text-orange-600", dot: "bg-orange-500" },
  Warm: { label: "Warm", color: "text-amber-600",  dot: "bg-amber-400" },
  Cold: { label: "Cold", color: "text-sky-600",    dot: "bg-sky-500" },
  Lost: { label: "Lost", color: "text-gray-500",   dot: "bg-gray-400" },
};

const TEMP_LIST: { value: LeadTemperature; label: string; dot: string }[] = [
  { value: "Hot",  label: "Hot",  dot: "bg-orange-500" },
  { value: "Warm", label: "Warm", dot: "bg-amber-400" },
  { value: "Cold", label: "Cold", dot: "bg-sky-500" },
  { value: "Lost", label: "Lost", dot: "bg-gray-400" },
];

// Stage — dot + text, no colored pill
const STAGE_DOT: Record<string, string> = {
  "New Lead": "bg-blue-500", "Contacted": "bg-violet-500", "Qualified": "bg-yellow-500",
  "Proposal Sent": "bg-amber-500", "Contract Signed": "bg-emerald-500",
  "Project In Progress": "bg-indigo-500", "Completed": "bg-green-500",
  "Inactive": "bg-gray-400", "Lost": "bg-rose-500",
};

function TempPicker({ leadId, current }: { leadId: string; current?: string | null }) {
  const updateTemp = useUpdateLeadTemperature();
  const cfg = current ? TEMP[current] : null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5">
          {cfg ? (
            <>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground/40 hover:text-muted-foreground transition-colors">—</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-1" align="start">
        {TEMP_LIST.map((t) => (
          <button
            key={t.value}
            onClick={() => updateTemp.mutate({ clientId: leadId, temperature: t.value })}
            disabled={updateTemp.isPending}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm transition-colors ${
              current === t.value ? "bg-muted font-medium" : "hover:bg-muted/60"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
            {t.label}
          </button>
        ))}
        {current && (
          <button
            onClick={() => updateTemp.mutate({ clientId: leadId, temperature: null })}
            className="w-full text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 text-left transition-colors border-t border-border mt-1 pt-1.5"
          >
            Clear
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const LeadsTable = () => {
  const [search, setSearch] = useState("");
  const [webhookId, setWebhookId] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useLeads({ search, webhookId: webhookId !== "all" ? webhookId : undefined });
  const { data: webhooks = [] } = useWebhooks();
  const deleteLead = useDeleteLead();
  const bulkAction = useBulkLeadAction();
  const leads = data?.data ?? [];

  const toggle = (id: string) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === leads.length ? new Set() : new Set(leads.map((l: any) => l.id)));
  const doBulk = (action: "set_temperature" | "delete", payload?: any) => {
    bulkAction.mutate({ leadIds: Array.from(selected), action, payload }, {
      onSuccess: (r) => { toast.success(`${r.affected ?? selected.size} leads updated`); setSelected(new Set()); },
      onError: (e) => toast.error("Failed", { description: e.message }),
    });
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-3">
      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border bg-muted/30">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Select onValueChange={(v) => doBulk("set_temperature", { temperature: v })}>
              <SelectTrigger className="h-7 text-xs w-auto gap-1"><SelectValue placeholder="Set temp" /></SelectTrigger>
              <SelectContent>
                {TEMP_LIST.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-7 text-xs text-rose-600 border-rose-200" onClick={() => doBulk("delete")} disabled={bulkAction.isPending}>
              Delete
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9 text-sm" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {webhooks.length > 0 && (
          <Select value={webhookId} onValueChange={setWebhookId}>
            <SelectTrigger className="w-[180px] h-9 text-sm"><SelectValue placeholder="All sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              {webhooks.map((wh) => <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="pl-4 pr-1 py-3 w-8">
                <Checkbox checked={leads.length > 0 && selected.size === leads.length} onCheckedChange={toggleAll} />
              </th>
              <th className="text-left px-3 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-3 py-3 font-medium text-muted-foreground">Source</th>
              <th className="text-left px-3 py-3 font-medium text-muted-foreground">Stage</th>
              <th className="text-left px-3 py-3 font-medium text-muted-foreground">Temp</th>
              <th className="text-left px-3 py-3 font-medium text-muted-foreground">Value</th>
              <th className="text-left px-3 py-3 font-medium text-muted-foreground">Follow-up</th>
              <th className="text-left px-3 py-3 font-medium text-muted-foreground">Added</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {leads.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-16 text-muted-foreground">{search ? "No leads match your search." : "No leads yet."}</td></tr>
            ) : (
              leads.map((lead: any) => {
                const dot = STAGE_DOT[lead.status] ?? "bg-gray-400";
                const fu = lead.followUpAt ? new Date(lead.followUpAt) : null;
                const overdue = fu ? isPast(fu) : false;
                const days = fu ? differenceInDays(fu, new Date()) : null;
                const initials = lead.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-muted/20 transition-colors cursor-pointer ${selected.has(lead.id) ? "bg-muted/30" : ""}`}
                    onClick={() => { setSelectedLead(lead); setSheetOpen(true); }}
                  >
                    <td className="pl-4 pr-1 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggle(lead.id)} />
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-lg shrink-0">
                          <AvatarImage src={lead.image} />
                          <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-xs font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{lead.name}</p>
                          {lead.email && !lead.email.includes("@noemail.invalid") && (
                            <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="h-2.5 w-2.5 text-muted-foreground/50" />
                              <p className="text-xs text-muted-foreground">{lead.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground">{lead.webhookName ?? "Manual"}</span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                        <span className="text-sm">{lead.status}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <TempPicker leadId={lead.id} current={lead.temperature} />
                    </td>

                    <td className="px-3 py-3">
                      {lead.leadValue ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(lead.leadValue))}</span>
                        </div>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>

                    <td className="px-3 py-3">
                      {fu ? (
                        <span className={`text-xs font-medium ${overdue ? "text-rose-600" : days === 0 ? "text-amber-600" : "text-foreground"}`}>
                          {overdue ? `Overdue` : days === 0 ? "Today" : `${days}d`}
                        </span>
                      ) : <span className="text-muted-foreground/40">—</span>}
                    </td>

                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground">{format(new Date(lead.createdAt), "d MMM")}</span>
                    </td>

                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedLead(lead); setSheetOpen(true); }}>View details</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => setDeleteId(lead.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ClientDetailSheet client={selectedLead} open={sheetOpen} onClose={() => setSheetOpen(false)} isLead />

      <AlertDialog open={!!deleteId} onOpenChange={(v: boolean) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the lead and all its data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { if (deleteId) deleteLead.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}>
              {deleteLead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
