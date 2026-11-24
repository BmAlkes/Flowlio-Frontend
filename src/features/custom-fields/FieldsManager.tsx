import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BASIC_FIELD_TYPES, TASK_FIELD_TYPES, useCreateCustomField, useDeleteCustomField, useFetchCustomFields, useUpdateCustomField,
  type CustomFieldDefinition, type CustomFieldEntity, type CustomFieldType, type OptionWithColor,
} from "@/hooks/usecustomfields";
import { useFetchProjects } from "@/hooks/usefetchprojects";

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#f97316", "#14b8a6", "#6b7280"];
const errorMessage = (error: unknown) => (error as { response?: { data?: { message?: string } } }).response?.data?.message;

/** Create, reorder and delete custom fields. Task fields offer more types and can belong to one project. */
export function FieldsManager({ entityType, projectId: fixedProject }: { entityType: CustomFieldEntity; projectId?: string | null }) {
  const { t } = useTranslation();
  const { data, isLoading } = useFetchCustomFields(entityType);
  const projects = useFetchProjects({}, { enabled: entityType === "task" });
  const create = useCreateCustomField();
  const update = useUpdateCustomField();
  const remove = useDeleteCustomField();
  const [name, setName] = useState("");
  const [type, setType] = useState<CustomFieldType>("text");
  const [scope, setScope] = useState(fixedProject ?? "");
  const [options, setOptions] = useState<OptionWithColor[]>([]);
  const [option, setOption] = useState("");
  const types = entityType === "task" ? TASK_FIELD_TYPES : BASIC_FIELD_TYPES;
  const fields = [...(data?.data ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const projectName = (id?: string | null) => projects.data?.data?.find(project => project.id === id)?.projectName;

  const addOption = () => {
    const label = option.trim();
    if (!label || options.some(item => item.label.toLowerCase() === label.toLowerCase())) return;
    setOptions(current => [...current, { label, color: COLORS[current.length % COLORS.length] }]);
    setOption("");
  };
  const submit = () => {
    if (!name.trim() || (type === "select" && !options.length)) return;
    create.mutate({ name: name.trim(), type, entityType, options: type === "select" ? options : undefined, projectId: entityType === "task" ? scope || null : undefined }, {
      onSuccess: () => { setName(""); setType("text"); setOptions([]); toast.success(t("customFields.created")); },
      onError: error => toast.error(errorMessage(error) ?? t("customFields.saveFailed")),
    });
  };
  const move = (field: CustomFieldDefinition, direction: -1 | 1) => {
    const index = fields.indexOf(field);
    if (!fields[index + direction]) return;
    // Older fields may share a position, so the whole order is rewritten.
    const order = [...fields];
    [order[index], order[index + direction]] = [order[index + direction], order[index]];
    order.forEach((item, position) => { if (item.position !== position) update.mutate({ id: item.id, position }); });
  };
  const confirmDelete = (field: CustomFieldDefinition) => {
    if (!window.confirm(t("customFields.deleteConfirm", { name: field.name }))) return;
    remove.mutate(field.id, { onError: error => toast.error(errorMessage(error) ?? t("customFields.saveFailed")) });
  };

  return (
    <div className="space-y-5">
      <form className="space-y-3 rounded-lg border border-border bg-muted/40 p-4" onSubmit={event => { event.preventDefault(); submit(); }}>
        <h3 className="text-sm font-medium">{t("customFields.add")}</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="flex flex-col gap-1 text-xs font-medium">
            {t("customFields.name")}
            <Input value={name} maxLength={100} placeholder={t("customFields.namePlaceholder")} onChange={event => setName(event.target.value)} className="h-9 bg-background" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium">
            {t("customFields.type")}
            <select className="h-9 rounded-md border border-border bg-background px-2 text-sm" value={type} onChange={event => setType(event.target.value as CustomFieldType)}>
              {types.map(item => <option key={item} value={item}>{t(`customFields.types.${item}`)}</option>)}
            </select>
          </label>
        </div>
        {entityType === "task" && !fixedProject && (
          <label className="flex flex-col gap-1 text-xs font-medium">
            {t("customFields.scope")}
            <select className="h-9 rounded-md border border-border bg-background px-2 text-sm" value={scope} onChange={event => setScope(event.target.value)}>
              <option value="">{t("customFields.allProjects")}</option>
              {(projects.data?.data ?? []).map(project => <option key={project.id} value={project.id}>{project.projectName}</option>)}
            </select>
          </label>
        )}
        {type === "select" && (
          <div className="space-y-2">
            <span className="text-xs font-medium">{t("customFields.options")}</span>
            <div className="flex gap-2">
              <Input value={option} maxLength={100} placeholder={t("customFields.optionPlaceholder")} className="h-8 bg-background"
                onChange={event => setOption(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addOption(); } }} />
              <Button type="button" size="sm" variant="outline" onClick={addOption}>{t("customFields.addOption")}</Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {options.map((item, index) => (
                <li key={item.label} className="flex items-center gap-1.5 rounded-full border border-border bg-background py-0.5 ps-1 pe-2 text-xs">
                  <input type="color" value={item.color} aria-label={t("customFields.optionColor", { option: item.label })} className="size-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    onChange={event => setOptions(current => current.map((entry, i) => (i === index ? { ...entry, color: event.target.value } : entry)))} />
                  {item.label}
                  <button type="button" aria-label={t("customFields.removeOption", { option: item.label })} onClick={() => setOptions(current => current.filter((_, i) => i !== index))}>
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button type="submit" size="sm" disabled={!name.trim() || (type === "select" && !options.length) || create.isPending}>
          {create.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}{t("customFields.create")}
        </Button>
      </form>

      <section className="space-y-2" aria-labelledby="existing-fields">
        <h3 id="existing-fields" className="text-sm font-medium">{t("customFields.existing")}</h3>
        {isLoading ? <p className="text-sm text-muted-foreground">{t("customFields.loading")}</p>
          : !fields.length ? <p className="text-sm text-muted-foreground">{t("customFields.none")}</p>
          : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {fields.map((field, index) => (
                <li key={field.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{field.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(`customFields.types.${field.type}`, { defaultValue: field.type })}
                      {entityType === "task" && ` · ${field.projectId ? projectName(field.projectId) ?? t("customFields.oneProject") : t("customFields.allProjects")}`}
                    </p>
                    {field.type === "select" && (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {field.options?.map(item => (
                          <span key={item.label} className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">
                            <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" className="size-8" disabled={index === 0} aria-label={t("customFields.moveUp", { name: field.name })} onClick={() => move(field, -1)}><ArrowUp className="size-4" aria-hidden="true" /></Button>
                  <Button size="icon" variant="ghost" className="size-8" disabled={index === fields.length - 1} aria-label={t("customFields.moveDown", { name: field.name })} onClick={() => move(field, 1)}><ArrowDown className="size-4" aria-hidden="true" /></Button>
                  <Button size="icon" variant="ghost" className="size-8 text-destructive" aria-label={t("customFields.delete", { name: field.name })} onClick={() => confirmDelete(field)}><Trash2 className="size-4" aria-hidden="true" /></Button>
                </li>
              ))}
            </ul>
          )}
      </section>
    </div>
  );
}
