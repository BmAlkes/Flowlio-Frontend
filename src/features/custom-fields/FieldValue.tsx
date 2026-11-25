import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import type { CustomFieldDefinition } from "@/hooks/usecustomfields";
import { useFetchOrganizationUsers } from "@/hooks/usefetchorganizationusers";
import { useOrganizationCurrency } from "@/hooks/useOrganizationCurrency";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatFieldValue, isEmpty, safeHref, type FormatContext, type Member } from "./field-values";

/** Locale, currency and member names needed to show values. */
export function useFieldContext(): FormatContext {
  const { t, i18n } = useTranslation();
  const currency = useOrganizationCurrency();
  const users = useFetchOrganizationUsers();
  const members = useMemo<Member[]>(() => (users.data?.data?.userMembers ?? []).map(user => ({
    id: user.user?.id || user.id,
    name: user.user?.name || `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || user.email,
  })), [users.data]);
  return { locale: i18n.language, currency: currency.data?.currencyCode, members, yes: t("customFields.yes"), no: t("customFields.no") };
}

/** Read-only rendering: colored chip, stars, progress bar, link or plain text. */
export function FieldValue({ field, value, context, compact = false }: { field: CustomFieldDefinition; value: unknown; context: FormatContext; compact?: boolean }) {
  if (isEmpty(value)) return <span className="text-muted-foreground">—</span>;
  if (field.type === "select") {
    const color = field.options?.find(option => option.label === value)?.color ?? "#6b7280";
    return (
      <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>
        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
        <span className="truncate text-foreground">{String(value)}</span>
      </span>
    );
  }
  if (field.type === "rating") {
    return (
      <span className="inline-flex" role="img" aria-label={`${value}/5`}>
        {[1, 2, 3, 4, 5].map(star => <Star key={star} aria-hidden="true" className={cn(compact ? "size-3" : "size-3.5", star <= Number(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />)}
      </span>
    );
  }
  if (field.type === "progress") {
    return (
      <span className="inline-flex items-center gap-1.5" role="img" aria-label={`${value}%`}>
        <span className={cn("h-1.5 overflow-hidden rounded-full bg-muted", compact ? "w-10" : "w-16")}><span className="block h-full rounded-full bg-[#1797b9]" style={{ width: `${value}%` }} /></span>
        <span className="text-xs tabular-nums text-muted-foreground">{String(value)}%</span>
      </span>
    );
  }
  const text = formatFieldValue(field, value, context);
  const href = safeHref(field, value);
  if (href) {
    return (
      <a href={href} target={field.type === "url" ? "_blank" : undefined} rel="noreferrer noopener" className="truncate text-[#11718c] underline dark:text-[#55bdd9]" onClick={event => event.stopPropagation()}>
        {field.type === "url" ? text.replace(/^https?:\/\//, "") : text}
      </a>
    );
  }
  return <span className="truncate">{text}</span>;
}

/** Editor for one value; `onSave(null)` clears it. Text-like inputs save on blur or Enter. */
export function FieldEditor({ field, value, context, onSave, disabled, autoFocus }: {
  field: CustomFieldDefinition; value: unknown; context: FormatContext; onSave: (value: unknown) => void; disabled?: boolean; autoFocus?: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(isEmpty(value) ? "" : String(value));
  useEffect(() => { setDraft(isEmpty(value) ? "" : String(value)); }, [value]);
  const commit = () => { if (draft !== (isEmpty(value) ? "" : String(value))) onSave(draft.trim() === "" ? null : draft); };
  const label = field.name;

  if (field.type === "boolean") {
    return <Checkbox aria-label={label} checked={value === true} disabled={disabled} onCheckedChange={checked => onSave(checked === true ? true : null)} />;
  }
  if (field.type === "select" || field.type === "person") {
    const choices = field.type === "select" ? (field.options ?? []).map(option => ({ value: option.label, label: option.label })) : (context.members ?? []).map(member => ({ value: member.id, label: member.name }));
    return (
      <select aria-label={label} autoFocus={autoFocus} disabled={disabled} className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm"
        value={isEmpty(value) ? "" : String(value)} onChange={event => onSave(event.target.value || null)}>
        <option value="">{t("customFields.empty")}</option>
        {choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
      </select>
    );
  }
  if (field.type === "rating") {
    return (
      <span className="inline-flex" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button" role="radio" aria-checked={Number(value) === star} aria-label={`${star}/5`} disabled={disabled}
            className="rounded p-0.5 hover:bg-muted" onClick={() => onSave(Number(value) === star ? null : star)}>
            <Star aria-hidden="true" className={cn("size-4", star <= Number(value ?? 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50")} />
          </button>
        ))}
      </span>
    );
  }
  if (field.type === "progress") {
    return (
      <span className="flex items-center gap-2">
        <input type="range" min={0} max={100} step={5} aria-label={label} disabled={disabled} className="w-full accent-[#1797b9]"
          value={Number(draft || 0)} onChange={event => setDraft(event.target.value)} onPointerUp={commit} onKeyUp={commit} />
        <span className="w-10 text-end text-xs tabular-nums">{draft || 0}%</span>
      </span>
    );
  }
  const type = field.type === "date" ? "date" : field.type === "number" || field.type === "currency" ? "number" : field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text";
  return (
    <Input aria-label={label} autoFocus={autoFocus} disabled={disabled} type={type} step={field.type === "currency" ? "0.01" : "any"} className="h-8"
      placeholder={field.type === "currency" && context.currency ? context.currency : undefined}
      value={draft} onChange={event => setDraft(event.target.value)} onBlur={commit}
      onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} />
  );
}
