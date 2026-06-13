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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Search, Trash2, Eye, Building2, DollarSign, Webhook } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { TableSkeleton } from "@/components/skeletons";

const TEMP_CONFIG: Record<string, { label: string; badge: string }> = {
  Hot: { label: "🔥 Hot", badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300" },
  Warm: { label: "🟠 Warm", badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300" },
  Cold: { label: "🔵 Cold", badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300" },
  Lost: { label: "⚫ Lost", badge: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/40 dark:text-gray-400" },
};

const TEMPERATURES: { value: LeadTemperature; emoji: string; label: string; active: string }[] = [
  { value: "Hot", emoji: "🔥", label: "Hot", active: "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300" },
  { value: "Warm", emoji: "🟠", label: "Warm", active: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300" },
  { value: "Cold", emoji: "🔵", label: "Cold", active: "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-900/20 dark:text-sky-300" },
  { value: "Lost", emoji: "⚫", label: "Lost", active: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/40 dark:text-gray-400" },
];

function InlineTemperaturePicker({ leadId, current }: { leadId: string; current?: string | null }) {
  const updateTemp = useUpdateLeadTemperature();
  const cfg = current ? TEMP_CONFIG[current] : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 group">
          {cfg ? (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${cfg.badge}`}>
              {cfg.label}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
              Set temp
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex flex-col gap-1">
          {TEMPERATURES.map((t) => (
            <button
              key={t.value}
              onClick={() => updateTemp.mutate({ clientId: leadId, temperature: t.value })}
              disabled={updateTemp.isPending}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                current === t.value
                  ? t.active + " border"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
          {current && (
            <button
              onClick={() => updateTemp.mutate({ clientId: leadId, temperature: null })}
              disabled={updateTemp.isPending}
              className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 text-left transition-colors mt-1 border-t border-border pt-2"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const STAGE_COLORS: Record<string, string> = {
  "New Lead": "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  "Contacted": "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
  "Qualified": "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  "Proposal Sent": "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  "Contract Signed": "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  "Project In Progress": "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
  "Completed": "text-green-600 bg-green-50 dark:bg-green-900/20",
  "Inactive": "text-gray-500 bg-gray-100 dark:bg-gray-800/40",
  "Lost": "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
};

export const LeadsTable = () => {
  const [search, setSearch] = useState("");
  const [webhookId, setWebhookId] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useLeads({ search, webhookId: webhookId !== "all" ? webhookId : undefined });
  const { data: webhooks = [] } = useWebhooks();
  const deleteLead = useDeleteLead();

  const leads = data?.data ?? [];

  const openDetail = (lead: any) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 rounded-full"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {webhooks.length > 0 && (
          <Select value={webhookId} onValueChange={setWebhookId}>
            <SelectTrigger className="rounded-full w-[200px] h-10">
              <div className="flex items-center gap-2">
                <Webhook className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All sources" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="manual">Manual (no webhook)</SelectItem>
              {webhooks.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lead</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Industry</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stage</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Temperature</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Value</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Follow-up</th>
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Added</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-base text-muted-foreground">
                  {search ? "No leads match your search." : "No leads yet. Create your first lead!"}
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => {
                const stageColor = STAGE_COLORS[lead.status] ?? "text-muted-foreground bg-muted";
                const followUp = lead.followUpAt ? new Date(lead.followUpAt) : null;
                const followUpOverdue = followUp ? isPast(followUp) : false;
                const followUpDays = followUp ? differenceInDays(followUp, new Date()) : null;

                const initials = lead.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?";

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => openDetail(lead)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-xl shrink-0">
                          <AvatarImage src={lead.image} />
                          <AvatarFallback className="rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-sm font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-base text-foreground leading-tight">{lead.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{lead.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-5 py-4">
                      {lead.webhookName ? (
                        <div className="flex items-center gap-1.5">
                          <Webhook className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[140px]">
                            {lead.webhookName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/60">Manual</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {lead.businessIndustry ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-muted-foreground/50" />
                          <span className="text-sm text-muted-foreground">{lead.businessIndustry}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${stageColor}`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Temperature — inline picker */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <InlineTemperaturePicker
                        leadId={lead.id}
                        current={lead.temperature}
                      />
                    </td>

                    <td className="px-5 py-4">
                      {lead.leadValue ? (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            {new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(lead.leadValue))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {followUp ? (
                        <span className={`text-sm font-medium ${followUpOverdue ? "text-rose-600" : followUpDays === 0 ? "text-amber-600" : "text-indigo-600 dark:text-indigo-400"}`}>
                          {followUpOverdue
                            ? `Overdue (${format(followUp, "d MMM")})`
                            : followUpDays === 0
                            ? "Today"
                            : `In ${followUpDays}d`}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(lead.createdAt), "d MMM yyyy")}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => openDetail(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600"
                          onClick={() => setDeleteId(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Lead detail sheet */}
      <ClientDetailSheet
        client={selectedLead}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        isLead
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v: boolean) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead and all its interactions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) deleteLead.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
              }}
            >
              {deleteLead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
