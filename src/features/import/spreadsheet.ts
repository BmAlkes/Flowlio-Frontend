/**
 * Turns a spreadsheet (CSV or Excel, e.g. a Monday/Trello/Asana export) into rows for POST /organizations/import.
 * Handles Monday's layout: board title above the header, group title rows, and the header repeated per group.
 */
export type ImportKind = "leads" | "clients" | "tasks";
export type Cell = string | number | boolean | Date | null | undefined;
export type FieldKey =
  | "name" | "email" | "phone" | "cpfcnpj" | "businessIndustry" | "address" | "status" | "note"
  | "project" | "title" | "description" | "assigneeEmail" | "startDate" | "endDate" | "timeline" | "estimatedHours";
export type Field = { key: FieldKey; required?: boolean; aliases: string[] };
/** Column index, or GROUP for the Monday group a row sits under. */
export const GROUP = -2;
export type Mapping = Partial<Record<FieldKey, number>>;
export const MAX_ROWS = 2000;

const CONTACT_FIELDS: Field[] = [
  { key: "name", required: true, aliases: ["name", "nome", "nombre", "cliente", "client", "lead", "contato", "contact", "item", "שם"] },
  { key: "email", aliases: ["email", "e-mail", "correo", "mail", "אימייל", "מייל"] },
  { key: "phone", aliases: ["phone", "telefone", "telefono", "celular", "whatsapp", "mobile", "tel", "טלפון"] },
  { key: "cpfcnpj", aliases: ["cpf", "cnpj", "cpf/cnpj", "documento", "tax id", "nif"] },
  { key: "businessIndustry", aliases: ["company", "empresa", "segmento", "industry", "setor", "ramo", "חברה"] },
  { key: "address", aliases: ["address", "endereco", "direccion", "כתובת"] },
  { key: "status", aliases: ["status", "etapa", "stage", "estado", "סטטוס"] },
  { key: "note", aliases: ["notes", "note", "notas", "observacoes", "observacao", "comentarios", "comments", "description", "descricao", "הערות"] },
];
const TASK_FIELDS: Field[] = [
  { key: "project", required: true, aliases: ["project", "projeto", "proyecto", "board", "quadro", "lista", "list", "פרויקט"] },
  { key: "title", required: true, aliases: ["name", "task", "tarefa", "tarea", "item", "titulo", "title", "nome", "card", "משימה"] },
  { key: "description", aliases: ["description", "descricao", "descripcion", "notes", "notas", "details", "detalhes", "תיאור"] },
  { key: "status", aliases: ["status", "estado", "situacao", "progress", "סטטוס"] },
  { key: "assigneeEmail", aliases: ["person", "pessoa", "people", "owner", "responsavel", "assignee", "assigned to", "members", "email", "אחראי"] },
  { key: "startDate", aliases: ["start", "start date", "inicio", "data de inicio", "fecha de inicio", "התחלה"] },
  { key: "endDate", aliases: ["due", "due date", "prazo", "deadline", "end", "end date", "entrega", "vencimento", "fecha", "date", "data", "יעד"] },
  { key: "timeline", aliases: ["timeline", "cronograma", "periodo", "linha do tempo", "ציר זמן"] },
  { key: "estimatedHours", aliases: ["hours", "horas", "estimate", "estimativa", "estimated hours", "time estimate", "שעות"] },
];
export const fieldsFor = (kind: ImportKind) => (kind === "tasks" ? TASK_FIELDS : CONTACT_FIELDS);

export const normalizeLabel = (value: Cell) =>
  String(value ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

const pad = (n: number) => String(n).padStart(2, "0");
/** Cells as text; dates from Excel arrive as UTC midnight and are kept as that calendar day. */
export function cellText(value: Cell) {
  if (value == null) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  return String(value).trim();
}

/** "2026-03-05", "2026-03-05T10:00", "05/03/2026" (day first, as in Brazil) -> "2026-03-05"; anything else -> null. */
export function toIsoDate(value: Cell) {
  const text = cellText(value);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy && Number(dmy[2]) <= 12 && Number(dmy[1]) <= 31) return `${dmy[3]}-${pad(Number(dmy[2]))}-${pad(Number(dmy[1]))}`;
  return null;
}

/** Monday "Timeline": "2026-03-01 - 2026-03-10" -> start and end. */
export function splitTimeline(value: Cell): [string | null, string | null] {
  const parts = cellText(value).split(/\s+[-–]\s+/);
  return [toIsoDate(parts[0] ?? null), toIsoDate(parts[1] ?? parts[0] ?? null)];
}

const nonEmpty = (row: Cell[]) => row.filter(cell => cellText(cell) !== "").length;

export function detectHeader(rows: Cell[][], kind: ImportKind) {
  const aliases = new Set(fieldsFor(kind).flatMap(field => field.aliases));
  let best = -1;
  let bestScore = 0;
  rows.slice(0, 15).forEach((row, index) => {
    const score = row.filter(cell => aliases.has(normalizeLabel(cell))).length;
    if (score > bestScore && nonEmpty(row) >= 2) { best = index; bestScore = score; }
  });
  if (best < 0) best = rows.findIndex(row => nonEmpty(row) >= 2);
  const header = best < 0 ? [] : rows[best].map(cellText);
  return { headerIndex: best, headers: header };
}

/** Rows below the header. Group title rows (only the first cell filled) are remembered and repeated headers skipped. */
export function dataRows(rows: Cell[][], headerIndex: number, headers: string[]) {
  const headerKey = headers.map(normalizeLabel).join("|");
  const result: { cells: Cell[]; group: string | null }[] = [];
  // Monday puts the first group's title just above the header.
  let group: string | null = null;
  for (let index = headerIndex - 1; index >= 0; index--) {
    if (!nonEmpty(rows[index])) continue;
    if (nonEmpty(rows[index]) === 1) group = cellText(rows[index].find(cell => cellText(cell) !== ""));
    break;
  }
  for (const row of rows.slice(headerIndex + 1)) {
    const filled = nonEmpty(row);
    if (!filled) continue;
    if (row.map(normalizeLabel).join("|") === headerKey) continue;
    if (filled === 1 && cellText(row[0]) !== "" && headers.length > 1) { group = cellText(row[0]); continue; }
    result.push({ cells: row, group });
  }
  return result;
}

export function guessMapping(headers: string[], kind: ImportKind): Mapping {
  const labels = headers.map(normalizeLabel);
  const used = new Set<number>();
  const mapping: Mapping = {};
  for (const field of fieldsFor(kind)) {
    let index = labels.findIndex((label, i) => !used.has(i) && field.aliases.includes(label));
    if (index < 0) index = labels.findIndex((label, i) => !used.has(i) && label.length > 2 && field.aliases.some(alias => alias.length > 3 && label.includes(alias)));
    if (index >= 0) { mapping[field.key] = index; used.add(index); }
  }
  return mapping;
}

/** Builds the request rows. `fixedProject` fills the project for task imports that have no project column. */
export function buildRows(kind: ImportKind, rows: { cells: Cell[]; group: string | null }[], mapping: Mapping, fixedProject = "") {
  const value = (row: { cells: Cell[]; group: string | null }, key: FieldKey) => {
    const index = mapping[key];
    if (index == null) return "";
    if (index === GROUP) return row.group ?? "";
    return cellText(row.cells[index]);
  };
  const raw = (row: { cells: Cell[]; group: string | null }, key: FieldKey): Cell => (mapping[key] == null || mapping[key] === GROUP ? value(row, key) : row.cells[mapping[key]!]);
  return rows.map(row => {
    if (kind !== "tasks") {
      return {
        name: value(row, "name"), email: value(row, "email"), phone: value(row, "phone"), cpfcnpj: value(row, "cpfcnpj"),
        businessIndustry: value(row, "businessIndustry"), address: value(row, "address"), status: value(row, "status"), note: value(row, "note"),
      };
    }
    const [timelineStart, timelineEnd] = mapping.timeline != null ? splitTimeline(raw(row, "timeline")) : [null, null];
    const assignee = value(row, "assigneeEmail");
    return {
      project: value(row, "project") || fixedProject.trim(),
      title: value(row, "title"),
      description: value(row, "description"),
      status: value(row, "status"),
      assigneeEmail: assignee.includes("@") ? assignee.split(/[,;\s]+/).find(part => part.includes("@")) ?? null : null,
      startDate: toIsoDate(raw(row, "startDate")) ?? timelineStart,
      endDate: toIsoDate(raw(row, "endDate")) ?? timelineEnd,
      estimatedHours: value(row, "estimatedHours") || null,
    };
  });
}
