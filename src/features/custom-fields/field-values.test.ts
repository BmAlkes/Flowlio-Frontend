import { describe, expect, it } from "vitest";
import type { CustomFieldDefinition } from "@/hooks/usecustomfields";
import { columnsFor, compareFieldValues, fieldsForTask, formatFieldValue, safeHref } from "./field-values";

const field = (type: string, extra: Partial<CustomFieldDefinition> = {}) =>
  ({ id: `f-${type}`, organizationId: "o", entityType: "task", name: type, type, createdAt: "", updatedAt: "", ...extra }) as CustomFieldDefinition;
const context = { locale: "pt-BR", currency: "BRL", members: [{ id: "u1", name: "Ana" }, { id: "u2", name: "Bruno" }], yes: "Sim", no: "Não" };

describe("which fields apply", () => {
  const all = [field("text", { id: "org", position: 2 }), field("number", { id: "p1", projectId: "p1", position: 1 }), field("date", { id: "p2", projectId: "p2", position: 0 })];
  it("a task gets organization fields plus its own project's, in order", () => {
    expect(fieldsForTask(all, "p1").map(f => f.id)).toEqual(["p1", "org"]);
  });
  it("list columns include project fields only when the list shows one project", () => {
    expect(columnsFor(all, null).map(f => f.id)).toEqual(["org"]);
    expect(columnsFor(all, "p2").map(f => f.id)).toEqual(["p2", "org"]);
  });
});

describe("formatting values", () => {
  it("shows each type the way people read it", () => {
    expect(formatFieldValue(field("currency"), 1234.5, context)).toContain("1.234,50");
    expect(formatFieldValue(field("boolean"), true, context)).toBe("Sim");
    expect(formatFieldValue(field("rating"), 3, context)).toBe("★★★☆☆");
    expect(formatFieldValue(field("progress"), 40, context)).toBe("40%");
    expect(formatFieldValue(field("person"), "u2", context)).toBe("Bruno");
    expect(formatFieldValue(field("date"), "2026-12-05", context)).toContain("2026");
    expect(formatFieldValue(field("text"), "", context)).toBe("");
  });
  it("only makes safe links", () => {
    expect(safeHref(field("url"), "https://x.com")).toBe("https://x.com");
    expect(safeHref(field("url"), "javascript:alert(1)")).toBeUndefined();
    expect(safeHref(field("phone"), "+55 (11) 9876-5432")).toBe("tel:+551198765432");
  });
});

describe("sorting", () => {
  it("orders lists by option order, numbers by value, people by name, and empty values last", () => {
    const priority = field("select", { options: [{ label: "Alta", color: "#f00" }, { label: "Baixa", color: "#0f0" }] });
    expect(["Baixa", undefined, "Alta"].sort((a, b) => compareFieldValues(priority, a, b, context))).toEqual(["Alta", "Baixa", undefined]);
    expect([10, null, 2].sort((a, b) => compareFieldValues(field("number"), a, b, context))).toEqual([2, 10, null]);
    expect(["u2", "u1"].sort((a, b) => compareFieldValues(field("person"), a, b, context))).toEqual(["u1", "u2"]);
  });
});
