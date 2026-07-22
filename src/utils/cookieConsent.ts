export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  necessary: true; // always on, not user-configurable
  analytics: boolean;
  marketing: boolean;
  /** ISO timestamp of when this choice was recorded — useful for re-prompting
   * after a policy change or after a long enough time has passed. */
  decidedAt: string;
  /** Bump this if the categories/purposes we ask consent for change, so a
   * stored decision from an older version doesn't silently carry forward. */
  version: number;
}

const STORAGE_KEY = "flowlio_cookie_consent";
const CONSENT_VERSION = 1;
const CONSENT_EVENT = "cookie-consent-changed";

export function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasDecided(): boolean {
  return getStoredConsent() !== null;
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const consent = getStoredConsent();
  return consent ? consent[category] === true : false;
}

function saveConsent(next: Omit<ConsentState, "decidedAt" | "version" | "necessary">) {
  const state: ConsentState = {
    necessary: true,
    analytics: next.analytics,
    marketing: next.marketing,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
  return state;
}

export function acceptAllConsent() {
  return saveConsent({ analytics: true, marketing: true });
}

export function rejectNonEssentialConsent() {
  return saveConsent({ analytics: false, marketing: false });
}

export function savePartialConsent(choices: { analytics: boolean; marketing: boolean }) {
  return saveConsent(choices);
}

/** Clears the stored decision so the banner shows again — used by the
 * "Cookie Settings" link so users can revisit their choice at any time. */
export function resetConsent() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

export function onConsentChange(callback: (state: ConsentState | null) => void) {
  const handler = (e: Event) => callback((e as CustomEvent<ConsentState | null>).detail);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
