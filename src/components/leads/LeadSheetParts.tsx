import { useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Check, Coins, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { financialMoney } from "@/lib/financial-currency";
import { useSetFollowUp, useUpdateLeadValue, type LeadInsights } from "@/hooks/useCRM";
import { useLeadTags, useSetLeadTags } from "@/hooks/useLeadExtras";
import { FollowUpPicker } from "@/components/client management/FollowUpPicker";
import { OVERDUE_PILL, followUpOf } from "./lead-ui";

export function Property({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <div className={wide ? "col-span-2 min-w-0" : "min-w-0"}><div className="ld-prop-label">{label}</div><div className="mt-1">{children}</div></div>;
}

export function ValueEditor({ client }: { client: any }) {
  const { t, i18n } = useTranslation();
  const updateValue = useUpdateLeadValue();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const value = client.leadValue && Number(client.leadValue) !== 0 ? financialMoney(client.leadValue, i18n.language, client.currencyCode, t("core.currencyUnknown")) : null;
  const save = () => {
    setEditing(false);
    const parsed = parseFloat(input.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(parsed) && parsed !== Number(client.leadValue)) updateValue.mutate({ clientId: client.id, leadValue: parsed });
  };
  const keys = (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") save(); if (event.key === "Escape") setEditing(false); };
  const start = () => { setInput(client.leadValue ? String(Number(client.leadValue)) : ""); setEditing(true); };
  if (editing) return (
    <div className="ld-value-edit">
      <Coins aria-hidden="true" className="size-4 shrink-0" />
      <input autoFocus inputMode="decimal" aria-label={t("leadsLayout.value")} value={input} placeholder="0"
        onChange={event => setInput(event.target.value)} onBlur={save} onKeyDown={keys} />
      <button type="button" aria-label={t("leadsLayout.save")} onMouseDown={event => event.preventDefault()} onClick={save} disabled={updateValue.isPending}><Check className="size-4" /></button>
    </div>
  );
  return value
    ? <button type="button" onClick={start} className="group flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">{value}<Pencil aria-hidden="true" className="size-3.5 opacity-0 group-hover:opacity-100" /></button>
    : <button type="button" onClick={start} className="ld-add-value"><Plus aria-hidden="true" className="size-3.5" />{t("pipeline.addValue")}</button>;
}

export function FollowUpBlock({ client, editing, setEditing }: { client: any; editing: boolean; setEditing: (value: boolean) => void }) {
  const { t, i18n } = useTranslation();
  const cancel = useSetFollowUp();
  const followUp = followUpOf(client);
  if (editing) return <FollowUpPicker clientId={client.id} onDismiss={() => setEditing(false)} />;
  if (!followUp) return <button type="button" onClick={() => setEditing(true)} className="ld-link-button"><Bell aria-hidden="true" className="size-3.5" />{t("pipeline.followUpSet")}</button>;
  const label = followUp.state === "overdue" ? t("pipeline.followUpOverdue") : followUp.state === "today" ? t("pipeline.followUpToday") : t("pipeline.followUpInDays", { count: followUp.days });
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className={followUp.state === "overdue" ? `ld-pill ${OVERDUE_PILL}` : "flex items-center gap-1.5 text-sm"}>
        <Bell aria-hidden="true" className="size-3.5 text-[#079dc5]" />{label} · {followUp.date.toLocaleDateString(i18n.language, { day: "numeric", month: "short" })}
      </span>
      <button type="button" className="ld-link-button" onClick={() => setEditing(true)}>{t("pipeline.followUpChange")}</button>
      <button type="button" aria-label={t("leadsLayout.removeFollowUp")} disabled={cancel.isPending}
        onClick={() => cancel.mutate({ clientId: client.id, followUpAt: null, followUpNote: null })}
        className="text-muted-foreground hover:text-rose-600"><Trash2 className="size-3.5" /></button>
      {client.followUpNote && <p className="w-full text-xs text-foreground/80 break-words">{client.followUpNote}</p>}
    </div>
  );
}

export function TagsEditor({ client }: { client: any }) {
  const { t } = useTranslation();
  const { data: allTags = [] } = useLeadTags();
  const setTags = useSetLeadTags();
  const current: { id: string; name: string; color: string }[] = client.tags ?? [];
  const toggle = (tag: { id: string; name: string }) => {
    const active = current.some(item => item.id === tag.id);
    const ids = active ? current.filter(item => item.id !== tag.id).map(item => item.id) : [...current.map(item => item.id), tag.id];
    setTags.mutate({ leadId: client.id, tagIds: ids }, {
      onSuccess: () => toast.success(t(active ? "leadsLayout.tagRemoved" : "leadsLayout.tagAdded", { name: tag.name })),
      onError: error => toast.error(t("leadsLayout.tagsFailed"), { description: (error as Error)?.message }),
    });
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {current.map(tag => (
        <span key={tag.id} className="ld-tag" style={{ ["--tag" as string]: tag.color }}>
          <span className="size-1.5 rounded-full" style={{ background: tag.color }} />{tag.name}
        </span>
      ))}
      {allTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild><button type="button" className="ld-tag-add"><Plus aria-hidden="true" className="size-3" />{t("leadsLayout.tag")}</button></PopoverTrigger>
          <PopoverContent className="w-52 p-1" align="start">
            {allTags.map(tag => {
              const active = current.some(item => item.id === tag.id);
              return <button key={tag.id} type="button" aria-pressed={active} disabled={setTags.isPending} onClick={() => toggle(tag)}
                className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-sm hover:bg-muted/60">
                <span className="size-2 rounded-full" style={{ background: tag.color }} />
                <span className="flex-1 text-start truncate">{tag.name}</span>{active && <Check className="size-3.5" />}
              </button>;
            })}
          </PopoverContent>
        </Popover>
      )}
      {!current.length && !allTags.length && <span className="ld-empty-value">{t("leadsLayout.noTags")}</span>}
    </div>
  );
}

export function ScoreMeter({ insights }: { insights?: LeadInsights }) {
  const { t } = useTranslation();
  if (!insights) return <span className="ld-empty-value">—</span>;
  const score = Math.max(0, Math.min(100, insights.score));
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-violet-700 dark:text-violet-300 tabular-nums">{score}%</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-violet-100/50 dark:bg-violet-500/15" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label={t("leadsLayout.score")}>
          <span className="block h-full rounded-full bg-violet-500/50" style={{ width: `${score}%` }} />
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("leadsLayout.scoreBasis", { count: insights.interactionCount, days: insights.daysSinceLastContact })}</p>
    </div>
  );
}
