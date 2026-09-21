import { expect, it } from "vitest";
import en from "@/locales/en.json";
import pt from "@/locales/pt.json";
import es from "@/locales/es.json";
import he from "@/locales/he.json";
import enCore from "@/locales/core/en.json";
import ptCore from "@/locales/core/pt.json";
import esCore from "@/locales/core/es.json";
import heCore from "@/locales/core/he.json";

function flatten(value: unknown, path = ""): Record<string, string> {
  if (typeof value === "string") return { [path]: value };
  if (!value || typeof value !== "object") return {};
  return Object.assign({}, ...Object.entries(value).map(([key, child]) => flatten(child, path ? `${path}.${key}` : key)));
}

it.each([["pt", pt, ptCore], ["es", es, esCore], ["he", he, heCore]] as const)("%s covers core keys and preserves interpolation parameters", (_language, resource, core) => {
  const baseline = flatten({ ...en, core: enCore });
  const actual = flatten({ ...resource, core });
  for (const [key, value] of Object.entries(baseline)) {
    if (!/^(common|settings|projects|tasks|clients|invoices|timeTracking|core)\./.test(key)) continue;
    expect(actual[key], key).toBeTruthy();
    expect(actual[key]?.match(/{{\w+}}/g)?.sort() ?? [], key).toEqual(value.match(/{{\w+}}/g)?.sort() ?? []);
  }
});
