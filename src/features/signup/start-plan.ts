import type { IPlan } from "@/types";

/** What happens right after an account is created. */
export type StartPath =
  | { kind: "free"; plan: IPlan }
  | { kind: "trial"; plan: IPlan; trialDays: number }
  | { kind: "checkout"; plan: IPlan }
  | { kind: "pricing" };

/** Trial length of a plan: no value means the default of 7 days, 0 means no trial. */
export const trialDaysOf = (plan: Pick<IPlan, "trialDays">) => (plan.trialDays == null ? 7 : Number(plan.trialDays) || 0);
export const isFreePlan = (plan: Pick<IPlan, "price">) => Number(plan.price) === 0;

/**
 * Free plans and paid plans with a trial start right away, without payment. Only paid plans without a trial
 * go to checkout. Without a chosen plan the account starts on the free plan, when there is one.
 */
export function chooseStart(plans: IPlan[], selectedPlanId: string | null | undefined): StartPath {
  const active = plans.filter((plan) => plan.isActive !== false);
  const selected = selectedPlanId ? active.find((plan) => plan.id === selectedPlanId) : undefined;
  if (selected) {
    if (isFreePlan(selected)) return { kind: "free", plan: selected };
    const trialDays = trialDaysOf(selected);
    return trialDays > 0 ? { kind: "trial", plan: selected, trialDays } : { kind: "checkout", plan: selected };
  }
  const free = active.find(isFreePlan);
  return free ? { kind: "free", plan: free } : { kind: "pricing" };
}

/** Two-letter country from the browser language ("pt-BR" → "BR"), when it has one. */
export function countryFromLocale(language?: string): string | undefined {
  try {
    const region = new Intl.Locale(language ?? navigator.language).maximize().region;
    return region && /^[A-Z]{2}$/.test(region) ? region : undefined;
  } catch {
    return undefined;
  }
}
