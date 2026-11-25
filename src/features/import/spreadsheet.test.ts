import { describe, expect, it } from "vitest";
import { buildRows, dataRows, detectHeader, extraColumns, GROUP, guessMapping, splitTimeline, toIsoDate, type Cell } from "./spreadsheet";

// Shape of a Monday.com board export: board title, group title, header repeated per group.
const monday: Cell[][] = [
  ["Website Redesign"],
  [],
  ["Sprint 1"],
  ["Name", "Person", "Status", "Timeline", "Notes"],
  ["Homepage", "ana@agency.test", "Working on it", "2026-03-01 - 2026-03-10", "Hero first"],
  ["Contact form", "", "Done", "", ""],
  [],
  ["Sprint 2"],
  ["Name", "Person", "Status", "Timeline", "Notes"],
  ["Blog", "Bia Souza", "Stuck", "2026-03-11 - 2026-03-20", null],
];

describe("spreadsheet import", () => {
  it("finds the header below the board title and keeps each row's group", () => {
    const { headerIndex, headers } = detectHeader(monday, "tasks");
    expect(headerIndex).toBe(3);
    const rows = dataRows(monday, headerIndex, headers);
    expect(rows.map(row => [row.cells[0], row.group])).toEqual([["Homepage", "Sprint 1"], ["Contact form", "Sprint 1"], ["Blog", "Sprint 2"]]);
  });

  it("guesses the columns and builds task rows, using the group or a fixed project", () => {
    const { headerIndex, headers } = detectHeader(monday, "tasks");
    const mapping = guessMapping(headers, "tasks");
    expect(mapping).toMatchObject({ title: 0, assigneeEmail: 1, status: 2, timeline: 3, description: 4 });
    expect(mapping.project).toBeUndefined();
    const rows = dataRows(monday, headerIndex, headers);
    const byBoard = buildRows("tasks", rows, mapping, "Website Redesign");
    expect(byBoard[0]).toEqual({ project: "Website Redesign", title: "Homepage", description: "Hero first", status: "Working on it", assigneeEmail: "ana@agency.test", startDate: "2026-03-01", endDate: "2026-03-10", estimatedHours: null, extra: {} });
    expect(byBoard[2].assigneeEmail).toBeNull();
    expect(buildRows("tasks", rows, { ...mapping, project: GROUP }).map(row => row.project)).toEqual(["Sprint 1", "Sprint 1", "Sprint 2"]);
  });

  it("maps a Portuguese CSV of clients", () => {
    const csv: Cell[][] = [["Nome", "E-mail", "Telefone", "Empresa", "CPF/CNPJ"], ["Ana", "ana@x.test", "11 99999-0000", "Agência", "123"]];
    const { headerIndex, headers } = detectHeader(csv, "clients");
    const mapping = guessMapping(headers, "clients");
    expect(mapping).toEqual({ name: 0, email: 1, phone: 2, businessIndustry: 3, cpfcnpj: 4 });
    expect(buildRows("clients", dataRows(csv, headerIndex, headers), mapping)[0]).toMatchObject({ name: "Ana", email: "ana@x.test", businessIndustry: "Agência" });
  });

  it("reads dates from Excel and from Brazilian text", () => {
    expect(toIsoDate(new Date(Date.UTC(2026, 2, 5)))).toBe("2026-03-05");
    expect(toIsoDate("05/03/2026")).toBe("2026-03-05");
    expect(toIsoDate("2026-03-05T10:00:00")).toBe("2026-03-05");
    expect(toIsoDate("31/13/2026")).toBeNull();
    expect(toIsoDate("next week")).toBeNull();
    expect(splitTimeline("2026-03-01 - 2026-03-10")).toEqual(["2026-03-01", "2026-03-10"]);
    expect(splitTimeline("2026-03-01")).toEqual(["2026-03-01", "2026-03-01"]);
  });

  it("offers unmapped columns with data to be kept, skipping Monday's internal ones", () => {
    const sheet: Cell[][] = [["Name", "Status", "Priority", "Budget", "Empty", "Item ID"], ["Home", "Done", "High", "1200", "", "991"], ["Blog", "", "Low", "", "", "992"]];
    const { headerIndex, headers } = detectHeader(sheet, "tasks");
    const rows = dataRows(sheet, headerIndex, headers);
    const mapping = guessMapping(headers, "tasks");
    const extra = extraColumns(headers, rows, mapping);
    expect(extra.map(column => column.name)).toEqual(["Priority", "Budget"]);
    const built = buildRows("tasks", rows, mapping, "Site", extra);
    expect(built.map(row => row.extra)).toEqual([{ Priority: "High", Budget: "1200" }, { Priority: "Low" }]);
  });
});
