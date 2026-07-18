import { describe, expect, it } from "vitest";
import { cleanWebhookLabel, getWebhookDisplayItems } from "./webhookFields";
import type { LeadFieldDefinition } from "@/hooks/useLeadFields";

describe("cleanWebhookLabel", () => {
  it("extracts and titlecases an Elementor flat field key", () => {
    expect(cleanWebhookLabel("fields[message][value]")).toBe("Message");
    expect(cleanWebhookLabel("fields[field_phone][value]")).toBe("Field Phone");
  });

  it("titlecases plain snake_case/kebab-case keys", () => {
    expect(cleanWebhookLabel("your_name")).toBe("Your Name");
    expect(cleanWebhookLabel("your-email")).toBe("Your Email");
  });
});

describe("getWebhookDisplayItems", () => {
  const fields: LeadFieldDefinition[] = [
    { id: "11111111-1111-1111-1111-111111111111", name: "Industry", type: "text" } as LeadFieldDefinition,
  ];

  it("returns an empty list when there are no raw custom fields", () => {
    expect(getWebhookDisplayItems(null, fields)).toEqual([]);
    expect(getWebhookDisplayItems(undefined, fields)).toEqual([]);
  });

  it("skips null, empty, and object values", () => {
    const items = getWebhookDisplayItems(
      { empty: "", nully: null, nested: { a: 1 }, message: "hi" },
      fields,
    );
    expect(items).toEqual([{ label: "Message", value: "hi" }]);
  });

  it("resolves a UUID key to its matching custom field name", () => {
    const items = getWebhookDisplayItems(
      { "11111111-1111-1111-1111-111111111111": "SaaS" },
      fields,
    );
    expect(items).toEqual([{ label: "Industry", value: "SaaS" }]);
  });

  it("skips a UUID key with no matching field definition", () => {
    const items = getWebhookDisplayItems(
      { "22222222-2222-2222-2222-222222222222": "orphaned" },
      fields,
    );
    expect(items).toEqual([]);
  });

  it("cleans non-UUID keys into readable labels", () => {
    const items = getWebhookDisplayItems({ your_name: "Bruno" }, fields);
    expect(items).toEqual([{ label: "Your Name", value: "Bruno" }]);
  });
});
