import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import Papa from "papaparse";
import { axios } from "@/configs/axios.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneralModal } from "@/components/common/generalmodal";
import { useUser } from "@/providers/user.provider";
import {
  buildRows, dataRows, detectHeader, fieldsFor, GROUP, guessMapping, MAX_ROWS, cellText,
  type Cell, type FieldKey, type ImportKind, type Mapping,
} from "@/features/import/spreadsheet";

type Result = { created: number; projectsCreated: number; skipped: { row: number; reason: string }[] };
type Sheet = { fileName: string; rows: Cell[][] };

async function readFile(file: File): Promise<Cell[][]> {
  if (/\.csv$/i.test(file.name)) {
    return new Promise((resolve, reject) => Papa.parse<string[]>(file, { complete: result => resolve(result.data), error: reject }));
  }
  const { readSheet } = await import("read-excel-file/browser");
  return (await readSheet(file)) as Cell[][];
}

/** Spreadsheet import for owners and managers: Monday, Trello, Asana or any Excel/CSV list. */
export function ImportData() {
  const { t } = useTranslation();
  const { data } = useUser();
  const cache = useQueryClient();
  const user = data?.user as { isOrganizationOwner?: boolean; isOrganizationManager?: boolean } | undefined;
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ImportKind>("leads");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [mapping, setMapping] = useState<Mapping>({});
  const [project, setProject] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!sheet) return null;
    const { headerIndex, headers } = detectHeader(sheet.rows, kind);
    const rows = headerIndex < 0 ? [] : dataRows(sheet.rows, headerIndex, headers);
    return { headerIndex, headers, rows, hasGroups: rows.some(row => row.group) };
  }, [sheet, kind]);
  const built = useMemo(() => (parsed ? buildRows(kind, parsed.rows, mapping, project) : []), [parsed, kind, mapping, project]);
  const fields = fieldsFor(kind);
  const missing = fields.filter(field => field.required && mapping[field.key] == null && !(field.key === "project" && project.trim()));

  const submit = useMutation({
    mutationFn: async () => (await axios.post<{ data: Result }>("/organizations/import", { kind, rows: built })).data.data,
    onSuccess: () => { void cache.invalidateQueries(); },
  });

  const reset = () => { setSheet(null); setMapping({}); setProject(""); setFileError(null); submit.reset(); };
  const choose = (next: ImportKind) => {
    setKind(next);
    if (sheet) {
      const { headers } = detectHeader(sheet.rows, next);
      setMapping(guessMapping(headers, next));
    }
  };
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    reset();
    try {
      const rows = (await readFile(file)).map(row => (Array.isArray(row) ? row : []));
      const { headerIndex, headers } = detectHeader(rows, kind);
      if (headerIndex < 0) { setFileError(t("privacy.import.noHeader")); return; }
      // Monday puts the board name above the header: a good default project name.
      const title = headerIndex > 0 ? cellText(rows[0].find(cell => cellText(cell) !== "")) : "";
      setSheet({ fileName: file.name, rows });
      setMapping(guessMapping(headers, kind));
      setProject(title || file.name.replace(/\.[^.]+$/, ""));
    } catch {
      setFileError(t("privacy.import.unreadable"));
    }
  };

  if (!user?.isOrganizationOwner && !user?.isOrganizationManager) return null;
  const errorMessage = (submit.error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;
  const previewKeys = fields.map(field => field.key).filter(key => key !== "timeline" && (mapping[key] != null || (key === "project" && project)));

  return (
    <section className="my-4 rounded-xl border bg-card p-5 space-y-4" aria-labelledby="import-data-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400" aria-hidden="true"><FileSpreadsheet className="size-5" /></span>
        <div>
          <h2 id="import-data-title" className="font-semibold">{t("privacy.import.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("privacy.import.description")}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={() => { reset(); setOpen(true); }}><Upload className="size-3.5 me-2" />{t("privacy.import.start")}</Button>

      <GeneralModal open={open} onOpenChange={next => { setOpen(next); if (!next) reset(); }} contentProps={{ className: "max-w-3xl" }}>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pe-1">
          <h2 className="text-lg font-semibold">{t("privacy.import.title")}</h2>
          {submit.data ? (
            <div className="space-y-3" role="status">
              <p className="font-medium">{t("privacy.import.done", { count: submit.data.created })}</p>
              {submit.data.projectsCreated > 0 && <p className="text-sm">{t("privacy.import.projectsCreated", { count: submit.data.projectsCreated })}</p>}
              {submit.data.skipped.length > 0 && (
                <div className="text-sm">
                  <p className="text-muted-foreground">{t("privacy.import.skipped", { count: submit.data.skipped.length })}</p>
                  <ul className="list-disc ps-5 mt-1 max-h-40 overflow-y-auto">
                    {submit.data.skipped.slice(0, 50).map(item => <li key={item.row}>{t("privacy.import.row", { row: item.row })}: {item.reason}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={reset}>{t("privacy.import.another")}</Button><Button onClick={() => setOpen(false)}>{t("privacy.cookieBanner.close")}</Button></div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("privacy.import.what")}>
                {(["leads", "clients", "tasks"] as const).map(option => (
                  <button key={option} type="button" role="radio" aria-checked={kind === option} onClick={() => choose(option)}
                    className={"px-3 py-1.5 rounded-full text-sm border cursor-pointer " + (kind === option ? "bg-primary text-primary-foreground border-primary" : "border-border")}>
                    {t(`privacy.import.kinds.${option}`)}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <label htmlFor="import-file" className="text-sm font-medium">{t("privacy.import.file")}</label>
                <Input id="import-file" type="file" accept=".csv,.xlsx" onChange={event => void onFile(event.target.files?.[0])} />
                <p className="text-xs text-muted-foreground">{t("privacy.import.fileHint", { max: MAX_ROWS })}</p>
                {fileError && <p role="alert" className="text-sm text-destructive">{fileError}</p>}
              </div>

              {parsed && (
                <>
                  <p className="text-sm text-muted-foreground">{t("privacy.import.found", { count: parsed.rows.length })}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {fields.map(field => (
                      <label key={field.key} className="text-sm flex flex-col gap-1">
                        <span>{t(`privacy.import.fields.${field.key}`)}{field.required ? " *" : ""}</span>
                        <select className="h-9 rounded-md border border-border bg-background px-2 text-sm" value={mapping[field.key] ?? ""}
                          onChange={event => setMapping(current => ({ ...current, [field.key]: event.target.value === "" ? undefined : Number(event.target.value) }))}>
                          <option value="">{t("privacy.import.ignore")}</option>
                          {field.key === "project" && parsed.hasGroups && <option value={GROUP}>{t("privacy.import.group")}</option>}
                          {parsed.headers.map((header, index) => header && <option key={index} value={index}>{header}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  {kind === "tasks" && mapping.project == null && (
                    <label className="text-sm flex flex-col gap-1">
                      <span>{t("privacy.import.fixedProject")}</span>
                      <Input value={project} onChange={event => setProject(event.target.value)} />
                    </label>
                  )}
                  {built.length > 0 && (
                    <div className="overflow-x-auto border border-border rounded-lg">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-muted">{previewKeys.map(key => <th key={key} className="text-start px-2 py-1.5 font-medium">{t(`privacy.import.fields.${key}`)}</th>)}</tr></thead>
                        <tbody className="divide-y divide-border">
                          {built.slice(0, 5).map((row, index) => (
                            <tr key={index}>{previewKeys.map(key => <td key={key} className="px-2 py-1.5">{String((row as Record<FieldKey, unknown>)[key] ?? "")}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {missing.length > 0 && <p className="text-sm text-amber-600">{t("privacy.import.required", { fields: missing.map(field => t(`privacy.import.fields.${field.key}`)).join(", ") })}</p>}
                  {built.length > MAX_ROWS && <p role="alert" className="text-sm text-destructive">{t("privacy.import.tooMany", { max: MAX_ROWS })}</p>}
                  {submit.isError && <p role="alert" className="text-sm text-destructive">{errorMessage ?? t("privacy.import.failed")}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>{t("privacy.cancel")}</Button>
                    <Button disabled={!built.length || built.length > MAX_ROWS || missing.length > 0 || submit.isPending} onClick={() => submit.mutate()}>
                      {submit.isPending && <Loader2 className="size-3.5 me-2 animate-spin" />}
                      {t("privacy.import.submit", { count: built.length })}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </GeneralModal>
    </section>
  );
}
