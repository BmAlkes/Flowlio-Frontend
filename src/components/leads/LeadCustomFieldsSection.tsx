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
        <Checkbox
          checked={value === true || value === "true"}
          onCheckedChange={onChange}
        />
        <span className="text-sm text-muted-foreground">{field.name}</span>
      </div>
    );
  }

  if (field.type === "select" || field.type === "multiselect") {
    const options = field.options ?? [];
    return (
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm rounded-lg">
          <SelectValue placeholder={`Select ${field.name}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-sm">
              {opt}
            </SelectItem>
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
            className={cn(
              "w-full h-9 justify-start text-left font-normal text-sm rounded-lg",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4 mr-2 text-muted-foreground" />
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

function cleanLabel(key: string): string {
  // Elementor flat: fields[message][value] → Message
  const m = key.match(/^fields\[([^\]]+)\]\[value\]$/);
  if (m) return m[1].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return key.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Flatten the raw customFields payload into { label, value } pairs. */
function extractFields(raw: Record<string, any>): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];

  // Elementor nested: { fields: { name: { value }, message: { value } } }
  if (raw.fields && typeof raw.fields === "object" && !Array.isArray(raw.fields)) {
    for (const [key, obj] of Object.entries(raw.fields)) {
      const val = typeof obj === "object" && obj !== null ? (obj as any).value : obj;
      if (val != null && val !== "") {
        out.push({ label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value: String(val) });
      }
    }
    return out;
  }

  // Flat format or plain key-value
  for (const [key, value] of Object.entries(raw)) {
    if (value == null || value === "" || typeof value === "object") continue;
    out.push({ label: cleanLabel(key), value: String(value) });
  }
  return out;
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

  const definedFieldIds = new Set(fields.map((f) => f.id));

  // Raw entries stored in the DB customFields that don't match a defined field
  const rawEntries = Object.entries(savedValues).filter(
    ([key, value]) => !definedFieldIds.has(key) && value != null && value !== ""
  );

  // Payload coming directly from the lead's customFields (set by the webhook receiver)
  const payloadFields = rawCustomFields ? extractFields(rawCustomFields) : [];

  // Filter out payload fields already covered by savedValues keys
  const savedKeys = new Set(Object.keys(savedValues));
  const uniquePayloadFields = payloadFields.filter((f) => !savedKeys.has(f.label.toLowerCase()));

  const hasCustom = fields.length > 0 || rawEntries.length > 0;
  const hasPayload = uniquePayloadFields.length > 0;

  if (!hasCustom && !hasPayload) return null;

  const handleSave = () => {
    saveValues({ leadId, values: draft }, { onSuccess: () => setEditing(false) });
  };

  const handleCancel = () => {
    setDraft(savedValues);
    setEditing(false);
  };

  return (
    <>
      {/* Defined + raw custom fields */}
      {hasCustom && (
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
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {fields.map((field) => (
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
                      : draft[field.id] ?? <span className="text-muted-foreground/50 italic">—</span>}
                  </p>
                )}
              </div>
            ))}

            {rawEntries.length > 0 && (
              <>
                {fields.length > 0 && <div className="border-t border-border/30 pt-3 mt-1" />}
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2">
                  Webhook Data
                </p>
                {rawEntries.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground mb-0.5">{cleanLabel(key)}</p>
                    <p className="text-sm text-foreground">{String(value)}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Payload from webhook (client.customFields passed directly from the lead object) */}
      {hasPayload && (
        <div className="border-t border-border/40 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Webhook className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dados do Webhook
            </span>
          </div>
          <div className="space-y-3">
            {uniquePayloadFields.map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                <p className="text-sm text-foreground break-words">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
