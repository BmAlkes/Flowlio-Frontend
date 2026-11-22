import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import { useUpdateLeadStatus } from "@/hooks/useCRM";
import { financialTotals } from "@/lib/financial-currency";
import type { Lead } from "@/hooks/useLeads";
import { ClientDetailSheet } from "@/components/client management/ClientDetailSheet";
import { LeadCardBody, LeadPipelineCard } from "./LeadPipelineCard";
import { CLOSED_STAGES, LEAD_STAGES, SALES_STAGES, stageTone } from "./lead-ui";

const OTHER = "__other";
const dropId = (stage: string) => `stage:${stage}`;

function StageColumn({ stage, leads, onOpen }: { stage: string; leads: Lead[]; onOpen: (lead: Lead) => void }) {
  const { t, i18n } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: dropId(stage) });
  const tone = stageTone(stage);
  const valued = leads.filter(lead => lead.leadValue != null && Number(lead.leadValue) > 0);
  const total = valued.length ? financialTotals(valued.map(lead => ({ amount: lead.leadValue!, currencyCode: lead.currencyCode })), i18n.language, t("core.currencyUnknown")) : "—";
  const name = t(`pipeline.clientStatuses.${stage}`, { defaultValue: stage });
  return (
    <section aria-label={name} className={`ld-column ${isOver ? "is-over" : ""}`}>
      <div aria-hidden="true" className={`h-1 ${tone.bar}`} />
      <header className="ld-column-head">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${tone.dot}`} />
          <h2 className="flex-1 truncate text-sm font-semibold">{name}</h2>
          <span className="ld-count">{leads.length}</span>
        </div>
        <span className={total === "—" ? "ld-empty-value" : "text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums"}>{total}</span>
      </header>
      <div ref={setNodeRef} className={`ld-column-body ${tone.tint}`}>
        {leads.map(lead => <LeadPipelineCard key={lead.id} lead={lead} onOpen={onOpen} />)}
        {leads.length === 0 && <div className="ld-drop-hint">{t("leadsLayout.dropHere")}</div>}
      </div>
    </section>
  );
}

function ClosedChip({ stage, count, expanded, onToggle, droppable }: { stage: string; count: number; expanded: boolean; onToggle: () => void; droppable: boolean }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: dropId(stage), disabled: !droppable });
  const tone = stageTone(stage);
  const name = stage === OTHER ? t("leadsLayout.otherStage") : t(`pipeline.clientStatuses.${stage}`, { defaultValue: stage });
  return (
    <button ref={setNodeRef} type="button" aria-expanded={expanded} onClick={onToggle} className={`ld-chip ${isOver ? "is-over" : ""} ${expanded ? "is-open" : ""}`}>
      <span className={`size-2 rounded-full ${tone.dot}`} />{name}<b>{count}</b>
    </button>
  );
}

export const LeadsPipeline = ({ leads, isLoading }: { leads: Lead[]; isLoading: boolean }) => {
  const { t, i18n } = useTranslation();
  const updateStatus = useUpdateLeadStatus();
  // Moves show at once; the server's answer replaces them on the next refresh.
  const [moved, setMoved] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor));
  useEffect(() => setMoved({}), [leads]);

  const byStage = useMemo(() => {
    const groups: Record<string, Lead[]> = Object.fromEntries([...LEAD_STAGES, OTHER].map(stage => [stage, [] as Lead[]]));
    for (const lead of leads) {
      const stage = moved[lead.id] ?? lead.status;
      groups[(LEAD_STAGES as string[]).includes(stage) ? stage : OTHER].push(lead);
    }
    for (const stage in groups) groups[stage].sort((a, b) => (a.position || 0) - (b.position || 0));
    return groups;
  }, [leads, moved]);

  const open = leads.filter(lead => !(CLOSED_STAGES as readonly string[]).includes(moved[lead.id] ?? lead.status));
  const valued = open.filter(lead => lead.leadValue != null && Number(lead.leadValue) > 0);
  const funnel = valued.length ? financialTotals(valued.map(lead => ({ amount: lead.leadValue!, currencyCode: lead.currencyCode })), i18n.language, t("core.currencyUnknown")) : "—";
  const closed = [...CLOSED_STAGES, ...(byStage[OTHER].length ? [OTHER] : [])];

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));
  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const target = typeof event.over?.id === "string" && event.over.id.startsWith("stage:") ? event.over.id.slice(6) : null;
    const lead = leads.find(item => item.id === event.active.id);
    if (!lead || !target || target === OTHER) return;
    const from = moved[lead.id] ?? lead.status;
    if (from === target) return;
    setMoved(previous => ({ ...previous, [lead.id]: target }));
    updateStatus.mutate({ clientId: lead.id, newStatus: target, oldStatus: from, newPosition: byStage[target]?.length ?? 0 }, {
      onError: () => setMoved(previous => { const next = { ...previous }; delete next[lead.id]; return next; }),
    });
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="size-8 animate-spin text-[#079dc5]" /></div>;

  const active = activeId ? leads.find(lead => lead.id === activeId) : null;
  const selected = selectedId ? leads.find(lead => lead.id === selectedId) ?? null : null;
  const onOpen = (lead: Lead) => setSelectedId(lead.id);

  return (
    <div className="ld-pipeline">
      <p className="ld-funnel">{t("leadsLayout.funnelSummary", { value: funnel, count: open.length })}</p>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
        <div className="ld-board-scroll">
          <div className="ld-board">
            {SALES_STAGES.map(stage => <StageColumn key={stage} stage={stage} leads={byStage[stage]} onOpen={onOpen} />)}
          </div>
        </div>

        <section className="ld-closed" aria-label={t("leadsLayout.closedStages")}>
          <div className="ld-closed-row">
            <span className="text-sm font-semibold">{t("leadsLayout.closedStages")}</span>
            {closed.map(stage => <ClosedChip key={stage} stage={stage} count={byStage[stage].length} droppable={stage !== OTHER}
              expanded={openStage === stage} onToggle={() => setOpenStage(openStage === stage ? null : stage)} />)}
            <span className="ld-closed-hint">{t("leadsLayout.closedHint")}</span>
          </div>
          {openStage && (
            <div className="ld-closed-cards">
              {byStage[openStage].length
                ? byStage[openStage].map(lead => <LeadPipelineCard key={lead.id} lead={lead} onOpen={onOpen} />)
                : <p className="text-sm text-muted-foreground">{t("leadsLayout.noLeadsInStage")}</p>}
            </div>
          )}
        </section>

        <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
          {active ? <div className="ld-card is-overlay"><LeadCardBody lead={active} /></div> : null}
        </DragOverlay>
      </DndContext>

      <ClientDetailSheet client={selected} open={!!selected} onClose={() => setSelectedId(null)} isLead />
    </div>
  );
};
