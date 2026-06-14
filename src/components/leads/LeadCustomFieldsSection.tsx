import { useState, useEffect } from "react";
import { useLeadFields, useLeadCustomValues, useUpdateLeadCustomValues, LeadFieldDefinition } from "@/hooks/useLeadFields";
import { useLeadWebhookPayload } from "@/hooks/useWebhooks";
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

function cleanWebhookKey(key: string): string {
  const elementorMatch = key.match(/^fields\[([^\]]+)\]\[value\]$/);
  if (elementorMatch) {
    return elementorMatch[1].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return key.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractPayloadFields(payload: Record<string, any>): { label: string; value: string }[] {
  const results: { label: string; value: string }[] = [];

  // Elementor/WordPress nested format: { fields: { xxx: { value: "..." } } }
  if (payload.fields && typeof payload.fields === "object" && !Array.isArray(payload.fields)) {
    for (const [key, fieldObj] of Object.entries(payload.fields)) {
      const val =
        typeof fieldObj === "object" && fieldObj !== null
          ? (fieldObj as any).value
          : fieldObj;
      if (val !== null && val !== undefined && val !== "") {
        results.push({
          label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value: String(val),
        });
      }
    }
    return results;
  }

  // Flat format: { "fields[xxx][value]": "..." } or plain key-value
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "object") continue;
    results.push({ label: cleanWebhookKey(key), value: String(value) });
  }

  return results;
}

export function LeadCustomFieldsSection({ leadId }: Props) {
  const { data: fields = [] } = useLeadFields();
  const { data: savedValues = {} } = useLeadCustomValues(leadId);
  const { mutate: saveValues, isPending } = useUpdateLeadCustomValues();
  const { data: webhookLog } = useLeadWebhookPayload(leadId);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});

  useEffect(() => {
    setDraft(savedValues);
    setEditing(false);
  }, [leadId, savedValues]);

  const definedFieldIds = new Set(fields.map((f) => f.id));

  const rawEntries = Object.entries(savedValues).filter(
    ([key, value]) => !definedFieldIds.has(key) && value !== null && value !== undefined && value !== ""
  );

  const payloadFields = webhookLog?.payload ? extractPayloadFields(webhookLog.payload) : [];

  const hasContent = fields.length > 0 || rawEntries.length > 0 || payloadFields.length > 0;
  if (!hasContent) return null;

  const handleSave = () => {
    saveValues({ leadId, values: draft }, { onSuccess: () => setEditing(false) });
  };

  const handleCancel = () => {
    setDraft(savedValues);
    setEditing(false);
  };

  return (
    <>
      {/* Defined custom fields */}
      {(fields.length > 0 || rawEntries.length > 0) && (
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
                    <p className="text-xs text-muted-foreground mb-0.5">{cleanWebhookKey(key)}</p>
                    <p className="text-sm text-foreground">{String(value)}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Webhook payload section — data from the original webhook call */}
      {payloadFields.length > 0 && (
        <div className="border-t border-border/40 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Webhook className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Payload recebido
            </span>
            {webhookLog?.webhookName && (
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-full">
                {webhookLog.webhookName}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {payloadFields.map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                <p className="text-sm text-foreground break-words">{f.value}</p>
              </div>
            ))}
          </div>

          {webhookLog?.createdAt && (
            <p className="text-[10px] text-muted-foreground/50 mt-3">
              Received {format(new Date(webhookLog.createdAt), "d MMM yyyy HH:mm")}
            </p>
          )}
        </div>
      )}
    </>
  );
}
