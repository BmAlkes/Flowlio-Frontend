import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFetchCustomFields, useSetTaskFieldValues, type CustomFieldDefinition } from "@/hooks/usecustomfields";
import { useUser } from "@/providers/user.provider";
import { fieldsForTask, type FormatContext } from "./field-values";
import { FieldEditor, FieldValue, useFieldContext } from "./FieldValue";

/** Viewers and portal clients only read task fields. */
export function useCanEditTaskFields() {
  const { data } = useUser();
  return ["superadmin", "subadmin", "user", "operator"].includes(data?.user?.role ?? "");
}

/** Local copy of a task's values that updates right away and rolls back if the save fails. */
export function useTaskFieldValues(taskId: string, initial: Record<string, unknown> | undefined) {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, unknown>>(initial ?? {});
  useEffect(() => { setValues(initial ?? {}); }, [taskId, initial]);
  const mutation = useSetTaskFieldValues();
  const save = (fieldId: string, value: unknown) => {
    const previous = values;
    setValues(current => { const next = { ...current }; if (value === null) delete next[fieldId]; else next[fieldId] = value; return next; });
    mutation.mutate({ taskId, values: { [fieldId]: value } }, {
      onSuccess: result => setValues(result.customFields),
      onError: error => {
        setValues(previous);
        toast.error((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("customFields.saveFailed"));
      },
    });
  };
  return { values, save, saving: mutation.isPending };
}

/** "Fields" box in the task details: every field that applies to the task, editable in place. */
export function TaskFieldsPanel({ taskId, projectId, initialValues }: { taskId: string; projectId?: string; initialValues?: Record<string, unknown> }) {
  const { t } = useTranslation();
  const { data } = useFetchCustomFields("task");
  const context = useFieldContext();
  const canEdit = useCanEditTaskFields();
  const { values, save } = useTaskFieldValues(taskId, initialValues);
  const fields = fieldsForTask(data?.data, projectId);
  if (!fields.length) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-4" aria-labelledby={`fields-${taskId}`}>
      <h3 id={`fields-${taskId}`} className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <SlidersHorizontal className="size-4" aria-hidden="true" />{t("customFields.title")}
      </h3>
      <dl className="space-y-3">
        {fields.map(field => (
          <div key={field.id} className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground">{field.name}</dt>
            <dd className="text-sm">
              {canEdit ? <FieldEditor field={field} value={values[field.id]} context={context} onSave={value => save(field.id, value)} />
                : <FieldValue field={field} value={values[field.id]} context={context} />}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** A list cell: shows the value, and opens a small editor on click without opening the task. */
export function FieldCell({ field, value, context, canEdit, onSave }: {
  field: CustomFieldDefinition; value: unknown; context: FormatContext; canEdit: boolean; onSave: (value: unknown) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const shown = <FieldValue field={field} value={value} context={context} compact />;
  if (!canEdit) return shown;
  // Checkboxes and stars are quicker to change right in the cell.
  if (field.type === "boolean" || field.type === "rating") {
    return <span onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}><FieldEditor field={field} value={value} context={context} onSave={onSave} /></span>;
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex w-full min-w-0 items-center rounded px-1 py-0.5 text-start hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#1797ba]"
          aria-label={t("customFields.editValue", { field: field.name })} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
          {shown}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" onClick={event => event.stopPropagation()} onKeyDown={event => { event.stopPropagation(); if (event.key === "Escape") setOpen(false); }}>
        <p className="mb-2 text-xs font-medium text-muted-foreground">{field.name}</p>
        <FieldEditor field={field} value={value} context={context} autoFocus
          onSave={next => { onSave(next); if (field.type === "select" || field.type === "person" || field.type === "date") setOpen(false); }} />
      </PopoverContent>
    </Popover>
  );
}
