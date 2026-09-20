import { describe, expect, it } from "vitest";
import { clientStatusSchema, corePath, projectResponseSchema, proposalsResponseSchema, serializedDateSchema } from "./core-api";
import { ApiContractError, parseResponse } from "./parse-response";

describe("API wire contracts", () => {
  it("accepts serialized dates and nullable periods while normalizing legacy project status", () => {
    const body = { success: true, data: { id: "p", projectName: "Project", projectNumber: "P1", status: "active", progress: 0,
      startDate: null, endDate: null, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" } };
    const result = parseResponse<typeof body>(projectResponseSchema, body);
    expect(result.data.status).toBe("ongoing");
    expect(typeof result.data.createdAt).toBe("string");
    expect(result.data.endDate).toBeNull();
  });
  it("rejects an HTML fallback or malformed payload instead of treating it as an empty list", () => {
    for (const body of ["<html>Not found</html>", { success: true }, { success: true, data: [{ status: "accepted" }] }]) {
      expect(() => parseResponse(proposalsResponseSchema, body)).toThrow(ApiContractError);
      try { parseResponse(proposalsResponseSchema, body); } catch (error) {
        expect(error).toHaveProperty("code", "API_RESPONSE_INVALID");
      }
    }
  });
  it("encodes identifiers and refuses incomplete endpoint URLs", () => {
    expect(corePath("proposalApprove", { id: "a/b?x" })).toBe("/proposals/a%2Fb%3Fx/approve");
    expect(() => corePath("projectDetail")).toThrow("Missing route parameter");
  });
  it("keeps known client aliases readable but rejects unknown states and Date instances", () => {
    expect(clientStatusSchema.parse("Project In Progress")).toBe("Active");
    expect(clientStatusSchema.parse("Completed")).toBe("Completed");
    expect(() => clientStatusSchema.parse("made-up")).toThrow();
    expect(() => serializedDateSchema.parse(new Date())).toThrow();
    expect(() => serializedDateSchema.parse("not a date")).toThrow();
  });
});
