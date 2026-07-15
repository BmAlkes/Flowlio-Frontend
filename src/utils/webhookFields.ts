import type { LeadFieldDefinition } from "@/hooks/useLeadFields";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(s: string) {
  return UUID_RE.test(s);
}

export function cleanWebhookLabel(key: string): string {
  // Elementor flat: fields[message][value] → Message
  const m = key.match(/^fields\[([^\]]+)\]\[value\]$/);
  if (m) return m[1].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return key.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Raw webhook payload keys left unmapped (not matching a defined custom
 * field) are surfaced here with a cleaned label — this is what makes
 * fields like a form's "message" show up without explicit mapping.
 */
export function getWebhookDisplayItems(
  rawCustomFields: Record<string, any> | null | undefined,
  fields: LeadFieldDefinition[],
): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  if (!rawCustomFields) return items;
  for (const [key, val] of Object.entries(rawCustomFields)) {
    if (val == null || val === "") continue;
    if (typeof val === "object") continue;
    if (isUUID(key)) {
      const matchingField = fields.find((f) => f.id === key);
      if (matchingField) items.push({ label: matchingField.name, value: String(val) });
      // else: UUID without a matching field definition → skip (internal key)
    } else {
      items.push({ label: cleanWebhookLabel(key), value: String(val) });
    }
  }
  return items;
}
