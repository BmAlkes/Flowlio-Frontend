import { describe, expect, it } from "vitest";
import { missingFileIds, newFiles, tasksFromSelection } from "./scene";

const note = (id: string, textId: string) => ({ id, type: "rectangle", boundElements: [{ id: textId, type: "text" }] });
const text = (id: string, value: string, containerId: string | null = null) => ({ id, type: "text", text: value, originalText: value, containerId });

describe("tasksFromSelection", () => {
  it("turns each selected note into one task, first line as title and the rest as description", () => {
    const elements = [note("n1", "t1"), text("t1", "Ligar para o cliente\nconfirmar orçamento\n\nantes de sexta", "n1"), text("t2", "  Revisar layout  ")];
    expect(tasksFromSelection(elements, { n1: true, t2: true })).toEqual([
      { key: "n1", title: "Ligar para o cliente", description: "confirmar orçamento\nantes de sexta" },
      { key: "t2", title: "Revisar layout", description: "" },
    ]);
  });

  it("counts a note once when both the shape and its text are selected, and skips empty or deleted ones", () => {
    const elements = [note("n1", "t1"), text("t1", "Briefing", "n1"), { id: "n2", type: "rectangle" }, { ...text("t3", "Apagado"), isDeleted: true }];
    expect(tasksFromSelection(elements, { n1: true, t1: true, n2: true, t3: true })).toEqual([{ key: "n1", title: "Briefing", description: "" }]);
  });

  it("keeps titles within the task limit", () => {
    expect(tasksFromSelection([text("t", "x".repeat(300))], { t: true })[0].title).toHaveLength(200);
  });
});

describe("image files", () => {
  const image = (id: string, fileId: string, isDeleted = false) => ({ id, type: "image", fileId, isDeleted });
  it("sends only images on the board that the server does not have yet", () => {
    const files = { a: { id: "a" }, b: { id: "b" }, c: { id: "c" } };
    expect(Object.keys(newFiles([image("1", "a"), image("2", "b"), image("3", "c", true)], files, new Set(["a"])))).toEqual(["b"]);
  });
  it("lists images other people added that are not loaded here", () => {
    expect(missingFileIds([image("1", "a"), image("2", "b"), image("3", "b")], { a: {} })).toEqual(["b"]);
  });
});
