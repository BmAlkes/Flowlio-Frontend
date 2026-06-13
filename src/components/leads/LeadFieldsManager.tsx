import { useState } from "react";
import {
  useLeadFields,
  useCreateLeadField,
  useUpdateLeadField,
  useDeleteLeadField,
  LeadFieldDefinition,
  LeadFieldType,
} from "@/hooks/useLeadFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";

const FIELD_TYPES: { value: LeadFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Single Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes / No" },
  { value: "url", label: "URL" },
];

interface FieldFormState {
  name: string;
  type: LeadFieldType;
  options: string;
  required: boolean;
}

function FieldFormDialog({
  open,
  onClose,
  initial,
  fieldId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<FieldFormState & { id: string }>;
  fieldId?: string;
}) {
  const [form, setForm] = useState<FieldFormState>({
    name: initial?.name ?? "",
    type: (initial?.type as LeadFieldType) ?? "text",
    options: Array.isArray(initial?.options) ? initial.options.join(", ") : (initial?.options ?? ""),
    required: initial?.required ?? false,
  });

  const createField = useCreateLeadField();
  const updateField = useUpdateLeadField();
  const isPending = createField.isPending || updateField.isPending;

  const handleSave = () => {
    const options =
      form.type === "select" || form.type === "multiselect"
        ? form.options
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    if (fieldId) {
      updateField.mutate(
        { fieldId, data: { name: form.name, type: form.type, options, required: form.required } },
        { onSuccess: onClose }
      );
    } else {
      createField.mutate(
        { name: form.name, type: form.type, options, required: form.required },
        { onSuccess: onClose }
      );
    }
  };

  const needsOptions = form.type === "select" || form.type === "multiselect";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{fieldId ? "Edit Field" : "New Custom Field"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Field Name *</label>
            <Input
              className="rounded-lg"
              placeholder="e.g. Budget, Source, Deadline"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Type</label>
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as LeadFieldType }))}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsOptions && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Options <span className="text-muted-foreground font-normal">(comma-separated)</span>
              </label>
              <Input
                className="rounded-lg"
                placeholder="Option A, Option B, Option C"
                value={form.options}
                onChange={(e) => setForm((p) => ({ ...p, options: e.target.value }))}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={form.required}
              onChange={(e) => setForm((p) => ({ ...p, required: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="required" className="text-sm">Required field</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-full px-5">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !form.name.trim()}
            className="rounded-full px-5"
          >
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Field"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LeadFieldsManager() {
  const { data: fields = [], isLoading } = useLeadFields();
  const deleteField = useDeleteLeadField();

  const [showCreate, setShowCreate] = useState(false);
  const [editField, setEditField] = useState<LeadFieldDefinition | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Custom Lead Fields</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Extra fields added to every lead in your workspace
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="rounded-full px-5 flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : fields.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">No custom fields yet.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Add fields like Budget, Source, Deadline — they'll appear in every lead.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first field
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{field.name}</span>
                  {field.required && (
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/30 px-1.5 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground capitalize">
                    {FIELD_TYPES.find((t) => t.value === field.type)?.label ?? field.type}
                  </span>
                  {field.options && field.options.length > 0 && (
                    <span className="text-xs text-muted-foreground/60">
                      · {field.options.slice(0, 3).join(", ")}
                      {field.options.length > 3 ? ` +${field.options.length - 3}` : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditField(field)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(field.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <FieldFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Edit dialog */}
      {editField && (
        <FieldFormDialog
          open={!!editField}
          onClose={() => setEditField(null)}
          initial={{
            name: editField.name,
            type: editField.type,
            options: editField.options?.join(", ") ?? "",
            required: editField.required,
          }}
          fieldId={editField.id}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v: boolean) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete field?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the field definition and all its saved values from every lead. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) deleteField.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
