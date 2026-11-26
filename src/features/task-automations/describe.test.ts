import { beforeAll, describe, expect, it } from "vitest";
import i18n from "@/configs/i18n.config";
import type { CustomFieldDefinition } from "@/hooks/usecustomfields";
import { describeRule, draftProblems } from "./describe";
import { RECIPES, emptyDraft } from "./recipes";

const lookup = {
  fields: [{ id: "prio", name: "Prioridade", type: "select", options: [{ label: "Alta", color: "#f00" }] } as CustomFieldDefinition],
  projects: [{ id: "p1", name: "Site" }],
  members: [{ id: "u1", name: "Ana" }],
};

beforeAll(async () => { await i18n.changeLanguage("pt"); });

describe("describing rules", () => {
  it("reads as one Portuguese sentence", () => {
    const t = i18n.t.bind(i18n);
    expect(describeRule(t, {
      name: "x", enabled: true, projectId: null,
      trigger: { type: "field_changed", fieldId: "prio", to: "Alta" },
      conditions: [{ type: "assignee", op: "empty" }],
      actions: [{ type: "assign", userId: "u1" }, { type: "set_due", days: 2 }],
    }, lookup)).toBe("Quando Prioridade mudar para Alta, se não houver responsável, então atribuir a Ana e definir o prazo para daqui a 2 dias");
    expect(describeRule(t, { ...emptyDraft(), trigger: { type: "due_date", offsetDays: 1 }, actions: [{ type: "notify", recipient: "assignee", channel: "email", message: "x" }] }, lookup))
      .toBe("Quando faltar 1 dia para o prazo, então avisar o responsável (app e e-mail)");
  });

  it("every template is translated and valid except where the person must pick a project", () => {
    const t = i18n.t.bind(i18n);
    for (const recipe of RECIPES) {
      const draft = recipe.draft(t);
      expect(draft.name).not.toContain("taskAutomations.");
      expect(describeRule(t, draft, lookup)).not.toContain("taskAutomations.");
      expect(draftProblems(draft)).toEqual(recipe.key === "weekly" ? ["create_task"] : []);
    }
  });

  it("points out what is missing before saving", () => {
    expect(draftProblems(emptyDraft())).toEqual(["name", "actions"]);
    expect(draftProblems({ ...emptyDraft(), name: "x", trigger: { type: "schedule", every: "day" }, actions: [{ type: "set_status", status: "delay" }] })).toContain("schedule");
  });
});
