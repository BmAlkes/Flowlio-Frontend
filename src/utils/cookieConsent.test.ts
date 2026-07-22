import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getStoredConsent,
  hasDecided,
  hasConsent,
  acceptAllConsent,
  rejectNonEssentialConsent,
  savePartialConsent,
  resetConsent,
} from "./cookieConsent";

// Node 22's built-in localStorage global can shadow jsdom's implementation
// with a partial stub (missing .clear()) when no --localstorage-file is set.
// A plain in-memory mock sidesteps that environment quirk entirely.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

describe("cookieConsent", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  it("has no stored decision before the user chooses anything", () => {
    expect(hasDecided()).toBe(false);
    expect(getStoredConsent()).toBeNull();
  });

  it("necessary cookies are always considered consented, decided or not", () => {
    expect(hasConsent("necessary")).toBe(true);
    acceptAllConsent();
    expect(hasConsent("necessary")).toBe(true);
  });

  it("acceptAllConsent grants analytics and marketing", () => {
    acceptAllConsent();
    expect(hasConsent("analytics")).toBe(true);
    expect(hasConsent("marketing")).toBe(true);
    expect(hasDecided()).toBe(true);
  });

  it("rejectNonEssentialConsent denies analytics and marketing", () => {
    rejectNonEssentialConsent();
    expect(hasConsent("analytics")).toBe(false);
    expect(hasConsent("marketing")).toBe(false);
    expect(hasDecided()).toBe(true);
  });

  it("savePartialConsent allows granular per-category choices", () => {
    savePartialConsent({ analytics: true, marketing: false });
    expect(hasConsent("analytics")).toBe(true);
    expect(hasConsent("marketing")).toBe(false);
  });

  it("resetConsent clears the stored decision", () => {
    acceptAllConsent();
    expect(hasDecided()).toBe(true);
    resetConsent();
    expect(hasDecided()).toBe(false);
    expect(hasConsent("marketing")).toBe(false);
  });

  it("ignores a stored decision from an older consent schema version", () => {
    localStorage.setItem(
      "flowlio_cookie_consent",
      JSON.stringify({ necessary: true, analytics: true, marketing: true, decidedAt: "2020-01-01", version: 0 }),
    );
    expect(getStoredConsent()).toBeNull();
    expect(hasDecided()).toBe(false);
  });
});
