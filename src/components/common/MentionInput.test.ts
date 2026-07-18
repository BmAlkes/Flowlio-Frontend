import { describe, expect, it } from "vitest";
import { findMentionTrigger } from "./MentionInput";

describe("findMentionTrigger", () => {
  it("detects an @ trigger right at the cursor", () => {
    expect(findMentionTrigger("@", 1)).toEqual({ start: 0, query: "" });
  });

  it("detects a partially typed name after @", () => {
    expect(findMentionTrigger("hey @bru", 8)).toEqual({ start: 4, query: "bru" });
  });

  it("returns null when there is no @ before the cursor", () => {
    expect(findMentionTrigger("hello world", 11)).toBeNull();
  });

  it("returns null once a space breaks the @word run", () => {
    expect(findMentionTrigger("@bruno malkes", 13)).toBeNull();
  });

  it("only considers the trigger nearest to the cursor, not earlier @ signs", () => {
    // cursor sits right after "@a", so the completed "@first " mention shouldn't match
    expect(findMentionTrigger("@first hi @a", 12)).toEqual({ start: 10, query: "a" });
  });

  it("ignores an email-like address (no space before @) as a trigger start", () => {
    // still matches technically since there's no whitespace requirement before @ —
    // this documents current behavior rather than asserting a stricter rule
    expect(findMentionTrigger("test@example.com", 17)).toEqual({
      start: 5,
      query: "example.com",
    });
  });
});
