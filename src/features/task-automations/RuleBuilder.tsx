import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CustomFieldDefinition } from "@/hooks/usecustomfields";
import { TASK_STATUSES, useSaveAutomation, type Action, type Condition, type Rule, type RuleDraft, type Trigger } from "./api";
import { describeRule, draftProblems, statusLabel, type Lookup } from "./describe";

const select = "h-9 w-full rounded-md border border-border bg-background px-2 text-sm";
const errorMessage = (error: unknown) => (error as { response?: { data?: { message?: string } } }).response?.data?.message;

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted-foreground">{label}{children}</label>;
}

/** A value for a field: its options, yes/no, people, or a typed input. Empty means "any value" where allowed. */
function FieldValueInput({ field, value, onChange, members, anyLabel }: {
  field?: CustomFieldDefinition; value: unknown; onChange: (value: string | number | boolean | undefined) => void; members: Lookup["members"]; anyLabel?: string;
}) {
  const { t } = useTranslation();
  const current = value === undefined || value === null ? "" : String(value);
  if (field?.type === "select" || field?.type === "person" || field?.type === "boolean") {
    const choices = field.type === "select" ? (field.options ?? []).map(o => ({ value: o.label, label: o.label }))
      : field.type === "person" ? members.map(m => ({ value: m.id, label: m.name }))
      : [{ value: "true", label: t("customFields.yes") }, { value: "false", label: t("customFields.no") }];
    return (
      <select className={select} aria-label={t("taskAutomations.value")} value={current}
        onChange={e => onChange(e.target.value === "" ? undefined : field.type === "boolean" ? e.target.value === "true" : e.target.value)}>
        <option value="">{anyLabel ?? t("customFields.empty")}</option>
        {choices.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    );
  }
  const numeric = ["number", "currency", "rating", "progress"].includes(field?.type ?? "");
  return (
    <Input className="h-9" aria-label={t("taskAutomations.value")} placeholder={anyLabel} type={field?.type === "date" ? "date" : numeric ? "number" : "text"} value={current}
      onChange={e => onChange(e.target.value === "" ? undefined : numeric ? Number(e.target.value) : e.target.value)} />
  );
}

function TriggerEditor({ trigger, onChange, lookup }: { trigger: Trigger; onChange: (trigger: Trigger) => void; lookup: Lookup }) {
  const { t } = useTranslation();
  const types: Trigger["type"][] = ["task_created", "status_changed", "field_changed", "assignee_changed", "due_date", "schedule"];
  const start = (type: Trigger["type"]): Trigger =>
    type === "field_changed" ? { type, fieldId: lookup.fields[0]?.id ?? "" } : type === "due_date" ? { type, offsetDays: 1 } : type === "schedule" ? { type, every: "week", weekday: 1 } : { type } as Trigger;
  const field = trigger.type === "field_changed" ? lookup.fields.find(f => f.id === trigger.fieldId) : undefined;
  return (
    <div className="flex flex-wrap gap-2">
      <Labeled label={t("taskAutomations.event")}>
        <select className={select} value={trigger.type} onChange={e => onChange(start(e.target.value as Trigger["type"]))}>
          {types.map(type => <option key={type} value={type} disabled={type === "field_changed" && !lookup.fields.length}>{t(`taskAutomations.triggers.${type}`)}</option>)}
        </select>
      </Labeled>
      {trigger.type === "status_changed" && (
        <Labeled label={t("taskAutomations.toStatus")}>
          <select className={select} value={trigger.to ?? ""} onChange={e => onChange({ type: "status_changed", to: (e.target.value || undefined) as never })}>
            <option value="">{t("taskAutomations.anyStatus")}</option>
            {TASK_STATUSES.map(s => <option key={s} value={s}>{statusLabel(t, s)}</option>)}
          </select>
        </Labeled>
      )}
      {trigger.type === "field_changed" && (
        <>
          <Labeled label={t("taskAutomations.field")}>
            <select className={select} value={trigger.fieldId} onChange={e => onChange({ type: "field_changed", fieldId: e.target.value })}>
              {lookup.fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </Labeled>
          <Labeled label={t("taskAutomations.toValue")}>
            <FieldValueInput field={field} value={trigger.to} members={lookup.members} anyLabel={t("taskAutomations.anyValue")} onChange={to => onChange({ ...trigger, to })} />
          </Labeled>
        </>
      )}
      {trigger.type === "due_date" && (
        <>
          <Labeled label={t("taskAutomations.days")}>
            <Input className="h-9" type="number" min={0} max={30} value={Math.abs(trigger.offsetDays)} onChange={e => onChange({ type: "due_date", offsetDays: Math.min(30, Math.max(0, Number(e.target.value) || 0)) * (trigger.offsetDays < 0 ? -1 : 1) })} />
          </Labeled>
          <Labeled label={t("taskAutomations.when.label")}>
            <select className={select} value={trigger.offsetDays === 0 ? "on" : trigger.offsetDays > 0 ? "before" : "after"}
              onChange={e => { const days = Math.abs(trigger.offsetDays) || 1; onChange({ type: "due_date", offsetDays: e.target.value === "on" ? 0 : e.target.value === "before" ? days : -days }); }}>
              <option value="before">{t("taskAutomations.dueBefore")}</option>
              <option value="on">{t("taskAutomations.dueOn")}</option>
              <option value="after">{t("taskAutomations.dueAfter")}</option>
            </select>
          </Labeled>
        </>
      )}
      {trigger.type === "schedule" && (
        <>
          <Labeled label={t("taskAutomations.every")}>
            <select className={select} value={trigger.every} onChange={e => { const every = e.target.value as "day" | "week" | "month"; onChange(every === "day" ? { type: "schedule", every } : every === "week" ? { type: "schedule", every, weekday: 1 } : { type: "schedule", every, monthDay: 1 }); }}>
              {(["day", "week", "month"] as const).map(every => <option key={every} value={every}>{t(`taskAutomations.everyOptions.${every}`)}</option>)}
            </select>
          </Labeled>
          {trigger.every === "week" && (
            <Labeled label={t("taskAutomations.weekday")}>
              <select className={select} value={trigger.weekday ?? 1} onChange={e => onChange({ ...trigger, weekday: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5, 6, 0].map(day => <option key={day} value={day}>{t(`taskAutomations.weekdays.${day}`)}</option>)}
              </select>
            </Labeled>
          )}
          {trigger.every === "month" && (
            <Labeled label={t("taskAutomations.monthDay")}>
              <Input className="h-9" type="number" min={1} max={28} value={trigger.monthDay ?? 1} onChange={e => onChange({ ...trigger, monthDay: Math.min(28, Math.max(1, Number(e.target.value) || 1)) })} />
            </Labeled>
          )}
        </>
      )}
    </div>
  );
}

function ConditionEditor({ condition, onChange, lookup }: { condition: Condition; onChange: (condition: Condition) => void; lookup: Lookup }) {
  const { t } = useTranslation();
  const field = condition.type === "field" ? lookup.fields.find(f => f.id === condition.fieldId) : undefined;
  return (
    <div className="flex flex-wrap gap-2">
      <Labeled label={t("taskAutomations.check")}>
        <select className={select} value={condition.type} onChange={e => {
          const type = e.target.value;
          onChange(type === "status" ? { type, op: "is", value: "todo" } : type === "assignee" ? { type, op: "not_empty" } : { type: "field", fieldId: lookup.fields[0]?.id ?? "", op: "not_empty" });
        }}>
          <option value="status">{t("taskAutomations.conditions.status")}</option>
          <option value="assignee">{t("taskAutomations.conditions.assignee")}</option>
          <option value="field" disabled={!lookup.fields.length}>{t("taskAutomations.conditions.field")}</option>
        </select>
      </Labeled>
      {condition.type === "field" && (
        <Labeled label={t("taskAutomations.field")}>
          <select className={select} value={condition.fieldId} onChange={e => onChange({ ...condition, fieldId: e.target.value, value: undefined })}>
            {lookup.fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </Labeled>
      )}
      <Labeled label={t("taskAutomations.operator")}>
        <select className={select} value={condition.op} onChange={e => onChange({ ...condition, op: e.target.value } as Condition)}>
          {(condition.type === "status" ? ["is", "is_not"] : condition.type === "assignee" ? ["is", "empty", "not_empty"] : ["is", "is_not", "empty", "not_empty"]).map(op => (
            <option key={op} value={op}>{t(`taskAutomations.operators.${op}`)}</option>
          ))}
        </select>
      </Labeled>
      {condition.type === "status" && (
        <Labeled label={t("taskAutomations.status")}>
          <select className={select} value={condition.value} onChange={e => onChange({ ...condition, value: e.target.value as never })}>
            {TASK_STATUSES.map(s => <option key={s} value={s}>{statusLabel(t, s)}</option>)}
          </select>
        </Labeled>
      )}
      {condition.type === "assignee" && condition.op === "is" && (
        <Labeled label={t("taskAutomations.person")}>
          <select className={select} value={condition.value ?? ""} onChange={e => onChange({ ...condition, value: e.target.value || undefined })}>
            <option value="">—</option>
            {lookup.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Labeled>
      )}
      {condition.type === "field" && (condition.op === "is" || condition.op === "is_not") && (
        <Labeled label={t("taskAutomations.value")}>
          <FieldValueInput field={field} value={condition.value} members={lookup.members} onChange={value => onChange({ ...condition, value })} />
        </Labeled>
      )}
    </div>
  );
}

function ActionEditor({ action, onChange, lookup, scheduled }: { action: Action; onChange: (action: Action) => void; lookup: Lookup; scheduled: boolean }) {
  const { t } = useTranslation();
  const types: Action["type"][] = scheduled ? ["create_task"] : ["notify", "set_status", "set_field", "assign", "set_due", "move_project", "create_task"];
  const start = (type: Action["type"]): Action => {
    switch (type) {
      case "notify": return { type, recipient: "assignee", channel: "internal", message: "{{task}}" };
      case "set_status": return { type, status: "in_progress" };
      case "set_field": return { type, fieldId: lookup.fields[0]?.id ?? "", value: null };
      case "assign": return { type, userId: lookup.members[0]?.id ?? "" };
      case "set_due": return { type, days: 3 };
      case "move_project": return { type, projectId: lookup.projects[0]?.id ?? "" };
      default: return { type: "create_task", title: "", projectId: scheduled ? lookup.projects[0]?.id ?? "" : "same", assignee: "none" };
    }
  };
  const field = action.type === "set_field" ? lookup.fields.find(f => f.id === action.fieldId) : undefined;
  return (
    <div className="flex flex-wrap gap-2">
      <Labeled label={t("taskAutomations.do")}>
        <select className={select} value={action.type} onChange={e => onChange(start(e.target.value as Action["type"]))}>
          {types.map(type => <option key={type} value={type} disabled={type === "set_field" && !lookup.fields.length}>{t(`taskAutomations.actions.${type}`)}</option>)}
        </select>
      </Labeled>
      {action.type === "notify" && (
        <>
          <Labeled label={t("taskAutomations.who")}>
            <select className={select} value={typeof action.recipient === "object" ? action.recipient.userId : action.recipient}
              onChange={e => onChange({ ...action, recipient: ["assignee", "creator", "project_owner"].includes(e.target.value) ? e.target.value as "assignee" : { userId: e.target.value } })}>
              {(["assignee", "creator", "project_owner"] as const).map(r => <option key={r} value={r}>{t(`taskAutomations.recipients.${r}`)}</option>)}
              {lookup.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Labeled>
          <Labeled label={t("taskAutomations.channel")}>
            <select className={select} value={action.channel} onChange={e => onChange({ ...action, channel: e.target.value as "internal" | "email" })}>
              <option value="internal">{t("taskAutomations.channels.internal")}</option>
              <option value="email">{t("taskAutomations.channels.email")}</option>
            </select>
          </Labeled>
          <div className="w-full">
            <Labeled label={t("taskAutomations.message")}>
              <Input className="h-9" maxLength={500} value={action.message} onChange={e => onChange({ ...action, message: e.target.value })} />
            </Labeled>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("taskAutomations.placeholders")}</p>
          </div>
        </>
      )}
      {action.type === "set_status" && (
        <Labeled label={t("taskAutomations.status")}>
          <select className={select} value={action.status} onChange={e => onChange({ ...action, status: e.target.value as never })}>
            {TASK_STATUSES.map(s => <option key={s} value={s}>{statusLabel(t, s)}</option>)}
          </select>
        </Labeled>
      )}
      {action.type === "set_field" && (
        <>
          <Labeled label={t("taskAutomations.field")}>
            <select className={select} value={action.fieldId} onChange={e => onChange({ ...action, fieldId: e.target.value, value: null })}>
              {lookup.fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </Labeled>
          <Labeled label={t("taskAutomations.value")}>
            <FieldValueInput field={field} value={action.value} members={lookup.members} onChange={value => onChange({ ...action, value: value ?? null })} />
          </Labeled>
        </>
      )}
      {action.type === "assign" && (
        <Labeled label={t("taskAutomations.person")}>
          <select className={select} value={action.userId} onChange={e => onChange({ ...action, userId: e.target.value })}>
            <option value="creator">{t("taskAutomations.recipients.creator")}</option>
            {lookup.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Labeled>
      )}
      {action.type === "set_due" && (
        <Labeled label={t("taskAutomations.dueInDays")}>
          <Input className="h-9" type="number" min={0} max={365} value={action.days} onChange={e => onChange({ ...action, days: Math.min(365, Math.max(0, Number(e.target.value) || 0)) })} />
        </Labeled>
      )}
      {action.type === "move_project" && (
        <Labeled label={t("taskAutomations.project")}>
          <select className={select} value={action.projectId} onChange={e => onChange({ ...action, projectId: e.target.value })}>
            {lookup.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Labeled>
      )}
      {action.type === "create_task" && (
        <>
          <div className="w-full">
            <Labeled label={t("taskAutomations.taskTitle")}>
              <Input className="h-9" maxLength={200} value={action.title} onChange={e => onChange({ ...action, title: e.target.value })} />
            </Labeled>
          </div>
          <Labeled label={t("taskAutomations.project")}>
            <select className={select} value={action.projectId} onChange={e => onChange({ ...action, projectId: e.target.value })}>
              {scheduled ? <option value="">—</option> : <option value="same">{t("taskAutomations.sameProject")}</option>}
              {lookup.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Labeled>
          <Labeled label={t("taskAutomations.assignee")}>
            <select className={select} value={action.assignee} onChange={e => onChange({ ...action, assignee: e.target.value })}>
              <option value="none">{t("taskAutomations.nobody")}</option>
              {!scheduled && <option value="same">{t("taskAutomations.sameAssignee")}</option>}
              {lookup.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Labeled>
          <Labeled label={t("taskAutomations.dueInDays")}>
            <Input className="h-9" type="number" min={0} max={365} placeholder="—" value={action.dueInDays ?? ""}
              onChange={e => onChange({ ...action, dueInDays: e.target.value === "" ? undefined : Math.min(365, Math.max(0, Number(e.target.value))) })} />
          </Labeled>
        </>
      )}
    </div>
  );
}

function Step({ word, title, children }: { word: string; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border p-4" aria-label={title}>
      <h3 className="flex items-center gap-2 text-sm font-semibold"><span className="rounded-md bg-[#1797b9]/10 px-2 py-0.5 text-[#11718c] dark:text-[#55bdd9]">{word}</span>{title}</h3>
      {children}
    </section>
  );
}

/** Dialog that builds a rule step by step, with the whole sentence previewed at the bottom. */
export function RuleBuilder({ initial, ruleId, lookup, onClose }: { initial: RuleDraft; ruleId?: string; lookup: Lookup; onClose: (saved?: Rule) => void }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RuleDraft>(initial);
  const save = useSaveAutomation();
  const scheduled = draft.trigger.type === "schedule";
  const problems = draftProblems(draft);
  const update = <K extends keyof RuleDraft>(key: K, value: RuleDraft[K]) => setDraft(current => ({ ...current, [key]: value }));
  const listUpdate = <T,>(list: T[], index: number, value: T) => list.map((item, i) => (i === index ? value : item));

  const submit = () => save.mutate({ id: ruleId, rule: draft }, {
    onSuccess: saved => { toast.success(t("taskAutomations.saved")); onClose(saved); },
    onError: error => toast.error(errorMessage(error) ?? t("taskAutomations.saveFailed")),
  });

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{ruleId ? t("taskAutomations.edit") : t("taskAutomations.new")}</DialogTitle>
          <DialogDescription>{t("taskAutomations.builderHint")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Labeled label={t("taskAutomations.name")}>
            <Input className="h-9" maxLength={120} value={draft.name} onChange={e => update("name", e.target.value)} placeholder={t("taskAutomations.namePlaceholder")} />
          </Labeled>
          <Labeled label={t("taskAutomations.scope")}>
            <select className={select} value={draft.projectId ?? ""} onChange={e => update("projectId", e.target.value || null)}>
              <option value="">{t("taskAutomations.allProjects")}</option>
              {lookup.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Labeled>
        </div>

        <Step word={t("taskAutomations.whenWord")} title={t("taskAutomations.whenTitle")}>
          <TriggerEditor trigger={draft.trigger} lookup={lookup}
            onChange={trigger => setDraft(current => trigger.type === "schedule"
              ? { ...current, trigger, conditions: [], actions: current.actions.filter(a => a.type === "create_task").map(a => ({ ...a, projectId: a.projectId === "same" ? "" : a.projectId, assignee: a.assignee === "same" ? "none" : a.assignee })) as Action[] }
              : { ...current, trigger })} />
        </Step>

        {!scheduled && (
          <Step word={t("taskAutomations.ifWord")} title={t("taskAutomations.ifTitle")}>
            {draft.conditions.map((condition, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="min-w-0 flex-1"><ConditionEditor condition={condition} lookup={lookup} onChange={value => update("conditions", listUpdate(draft.conditions, index, value))} /></div>
                <Button size="icon" variant="ghost" className="size-9 shrink-0" aria-label={t("taskAutomations.remove")} onClick={() => update("conditions", draft.conditions.filter((_, i) => i !== index))}><Trash2 className="size-4" aria-hidden="true" /></Button>
              </div>
            ))}
            {draft.conditions.length < 5 && (
              <Button size="sm" variant="outline" onClick={() => update("conditions", [...draft.conditions, { type: "status", op: "is_not", value: "completed" }])}>
                <Plus className="size-4" aria-hidden="true" />{t("taskAutomations.addCondition")}
              </Button>
            )}
          </Step>
        )}

        <Step word={t("taskAutomations.thenWord")} title={t("taskAutomations.thenTitle")}>
          {draft.actions.map((action, index) => (
            <div key={index} className="flex items-end gap-2 border-b border-border pb-3 last:border-0">
              <div className="min-w-0 flex-1"><ActionEditor action={action} lookup={lookup} scheduled={scheduled} onChange={value => update("actions", listUpdate(draft.actions, index, value))} /></div>
              <Button size="icon" variant="ghost" className="size-9 shrink-0" aria-label={t("taskAutomations.remove")} onClick={() => update("actions", draft.actions.filter((_, i) => i !== index))}><Trash2 className="size-4" aria-hidden="true" /></Button>
            </div>
          ))}
          {draft.actions.length < 5 && (
            <Button size="sm" variant="outline" onClick={() => update("actions", [...draft.actions, scheduled
              ? { type: "create_task", title: "", projectId: lookup.projects[0]?.id ?? "", assignee: "none" }
              : { type: "notify", recipient: "assignee", channel: "internal", message: "{{task}}" }])}>
              <Plus className="size-4" aria-hidden="true" />{t("taskAutomations.addAction")}
            </Button>
          )}
        </Step>

        <p className="rounded-lg bg-muted/60 p-3 text-sm" aria-live="polite"><span className="font-medium">{t("taskAutomations.preview")}: </span>{describeRule(t, draft, lookup)}</p>
        {problems.length > 0 && <p className="text-xs text-amber-700 dark:text-amber-400">{problems.map(problem => t(`taskAutomations.problems.${problem}`)).join(" ")}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>{t("taskAutomations.cancel")}</Button>
          <Button disabled={problems.length > 0 || save.isPending} onClick={submit}>
            {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{t("taskAutomations.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
