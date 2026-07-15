import { useState, useEffect } from "react";
import { useLeadFields, useLeadCustomValues, useUpdateLeadCustomValues, LeadFieldDefinition } from "@/hooks/useLeadFields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@/components/customeIcons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, Pencil, X, Webhook } from "lucide-react";

interface Props {
  leadId: string;
  rawCustomFields?: Record<string, any> | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(s: string) {
  return UUID_RE.test(s);
}

function cleanLabel(key: string): string {
  // Elementor flat: fields[message][value] → Message
  const m = key.match(/^fields\[([^\]]+)\]\[value\]$/);
  if (m) return m[1].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return key.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: LeadFieldDefinition;
  value: any;
  onChange: (v: any) => void;
}) {
  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2 h-9">
        <Checkbox checked={value === true || value === "true"} onCheckedChange={onChange} />
        <span className="text-sm text-muted-foreground">{field.name}</span>
      </div>
    );
  }
  if (field.type === "select" || field.type === "multiselect") {
    return (
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm rounded-lg">
          <SelectValue placeholder={`Select ${field.name}`} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt} className="text-sm">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "date") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full h-9 justify-start text-start font-normal text-sm rounded-lg", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="size-4 me-2 text-muted-foreground" />
            {value ? format(new Date(value), "d MMM yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => onChange(date ? date.toISOString() : "")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <Input
      className="h-9 text-sm rounded-lg"
      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
      placeholder={`${field.name}...`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function LeadCustomFieldsSection({ leadId, rawCustomFields }: Props) {
  const { data: fields = [] } = useLeadFields();
  const { data: savedValues = {} } = useLeadCustomValues(leadId);
  const { mutate: saveValues, isPending } = useUpdateLeadCustomValues();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});

  useEffect(() => {
    setDraft(savedValues);
    setEditing(false);
  }, [leadId, savedValues]);

  // Build webhook display items from rawCustomFields:
  // - UUID key that matches a defined field → use the field name as label
  // - Non-UUID key → clean label
  // - UUID key with no matching field → skip (internal key, not useful to show)
  const webhookItems: { label: string; value: string }[] = [];
  if (rawCustomFields) {
    for (const [key, val] of Object.entries(rawCustomFields)) {
      if (val == null || val === "") continue;
      if (typeof val === "object") continue;
      if (isUUID(key)) {
        const matchingField = fields.find((f) => f.id === key);
        if (matchingField) {
          webhookItems.push({ label: matchingField.name, value: String(val) });
        }
        // else: UUID without a matching field definition → skip
      } else {
        webhookItems.push({ label: cleanLabel(key), value: String(val) });
      }
    }
  }

  const fieldsWithWebhookValue = new Set(
    rawCustomFields
      ? Object.keys(rawCustomFields).filter((k) => isUUID(k) && fields.some((f) => f.id === k) && rawCustomFields[k] != null && rawCustomFields[k] !== "")
      : []
  );

  const editableFields = fields.filter((f) => !fieldsWithWebhookValue.has(f.id));

  const hasWebhook = webhookItems.length > 0;
  const hasEditable = editableFields.length > 0;

  if (!hasWebhook && !hasEditable) return null;

  const handleSave = () => {
    saveValues({ leadId, values: draft }, { onSuccess: () => setEditing(false) });
  };

  return (
    <>
      {/* Read-only webhook payload section */}
      {hasWebhook && (
        <div className="border-t border-border/40 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Webhook className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dados do Webhook
            </span>
          </div>
          <div className="space-y-3">
            {webhookItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-sm text-foreground break-words">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable custom fields (only those not sourced from webhook) */}
      {hasEditable && (
        <div className="border-t border-border/40 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Custom Fields
            </span>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-semibold transition-colors disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                  Save
                </button>
                <button
                  onClick={() => { setDraft(savedValues); setEditing(false); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {editableFields.map((field) => (
              <div key={field.id}>
                <p className="text-xs text-muted-foreground mb-1">{field.name}</p>
                {editing ? (
                  <FieldInput
                    field={field}
                    value={draft[field.id]}
                    onChange={(v) => setDraft((prev) => ({ ...prev, [field.id]: v }))}
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {field.type === "boolean"
                      ? draft[field.id] ? "Yes" : "No"
                      : field.type === "date" && draft[field.id]
                      ? format(new Date(draft[field.id]), "d MMM yyyy")
                      : draft[field.id] ?? <span className="text-muted-foreground/90 italic">—</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
