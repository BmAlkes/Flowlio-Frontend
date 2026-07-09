import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { cn } from "@/lib/utils";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { FC, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { usePlanSelectionStore } from "@/store/planSelection.store";
import { useUser } from "@/providers/user.provider";

interface PricingProps {
  selectedPlan: number | null;
  setSelectedPlan: (plan: number | null) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDuration = (plan: any): string => {
  const dv = plan?.durationValue ?? plan?.duration_value;
  const dt = plan?.durationType ?? plan?.duration_type;
  if (dv && dt) {
    const v = Number(dv);
    if (!isNaN(v) && v > 0) {
      const t = dt.trim().toLowerCase();
      if (t === "days")    return v === 1 ? "day"   : `${v} days`;
      if (t === "monthly") return v === 1 ? "month" : `${v} months`;
      if (t === "yearly")  return v === 1 ? "year"  : `${v} years`;
    }
  }
  const bc = plan?.billingCycle ?? plan?.billing_cycle;
  return bc === "monthly" ? "month" : bc ?? "month";
};

const getPlanFeatures = (planFeatures: any): string[] =>
  planFeatures?.customFeatures ?? [];

// Which plan index is "recommended" — the middle of the paid plans
const getRecommendedIndex = (total: number) => Math.floor(total / 2);

// ─── Component ───────────────────────────────────────────────────────────────

export const Pricing: FC<PricingProps> = ({ setSelectedPlan }) => {
  const { data: plansResponse, isLoading, isError } = useFetchPublicPlans();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { setSelectedPlan: setStorePlan } = usePlanSelectionStore();
  const { data: userData } = useUser();

  const fromSignup      = location.state?.fromSignup;
  const fromSignin      = location.state?.fromSignin;
  const pendingAccount  = location.state?.pendingAccount;

  // All plans from backend — includes free (price=0) and paid
  const allPlans = plansResponse?.data ?? [];

  const handleSelect = (planIndex: number) => {
    setSelectedPlan(planIndex);
    const p = allPlans[planIndex];
    if (p) setStorePlan(planIndex, p.id, { name: p.name, price: p.price, description: p.description });

    if (!userData?.user) {
      navigate("/auth/signup", { state: { fromPricing: true, selectedPlan: planIndex }, replace: false });
      return;
    }
    navigate("/checkout", {
      state: { selectedPlan: planIndex, createOrganization: fromSignup || fromSignin || pendingAccount, fromSignup, fromSignin, pendingAccount },
    });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#1797B9]" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-muted-foreground text-sm">
      <p>Could not load plans.</p>
      <button onClick={() => window.location.reload()} className="underline text-[#1797B9]">Retry</button>
    </div>
  );

  const recommendedIdx = getRecommendedIndex(allPlans.length);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16">
      {/* ── Header ── */}
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#F98618] mb-4">Pricing</p>
        <h1
          className="text-4xl sm:text-5xl font-light text-gray-900 leading-tight mb-4"
          style={{ letterSpacing: "-0.02em" }}
        >
          Simple, transparent{" "}
          <span className="font-semibold">pricing</span>
        </h1>
        <p className="text-gray-500 text-base max-w-sm mx-auto">
          Pick the plan that fits your team. Upgrade anytime, no lock-in.
        </p>

        {/* Billing toggle — text-based, not pill */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "text-sm font-medium pb-1 border-b-2 transition-all",
              billing === "monthly"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "text-sm font-medium pb-1 border-b-2 transition-all flex items-center gap-2",
              billing === "yearly"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Yearly
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">–20%</span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      {allPlans.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No plans configured yet.</p>
      ) : (
        <div
          className={cn(
            "grid gap-5",
            allPlans.length === 1 && "max-w-xs mx-auto",
            allPlans.length === 2 && "grid-cols-2 max-w-2xl mx-auto",
            allPlans.length === 3 && "grid-cols-3 max-w-4xl mx-auto",
            allPlans.length >= 4 && "grid-cols-2 lg:grid-cols-4"
          )}
        >
          {allPlans.map((plan: any, i: number) => {
            const isRecommended = i === recommendedIdx;
            const isFreePlan    = Number(plan.price) === 0;
            const price         = Number(plan.price) || 0;
            const displayPrice  = billing === "yearly" && !isFreePlan
              ? Math.round(price * 0.8)
              : price;
            const features  = getPlanFeatures(plan.features);
            const duration  = formatDuration(plan);
            const trialDays = plan.trialDays ?? 0;
            const name      = plan.customPlanName || plan.name;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 transition-all duration-200",
                  isRecommended
                    ? "border-[#1797B9] shadow-[0_0_0_1px_#1797B9] bg-white"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                )}
              >
                {/* Recommended accent */}
                {isRecommended && (
                  <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#1797B9] rounded-b-full" />
                )}

                {/* Name + tag */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{name}</h3>
                  {isRecommended && (
                    <span className="text-[10px] font-bold text-[#1797B9] uppercase tracking-wider ml-2 mt-0.5">
                      Recommended
                    </span>
                  )}
                  {isFreePlan && (
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider ml-2 mt-0.5">
                      Free
                    </span>
                  )}
                </div>

                {/* Tagline */}
                <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                  {plan.description || " "}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">
                      {isFreePlan ? "Free" : `$${displayPrice}`}
                    </span>
                    {!isFreePlan && (
                      <span className="text-sm text-gray-400 mb-0.5">/ {duration}</span>
                    )}
                  </div>
                  {billing === "yearly" && !isFreePlan && price > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Save ${Math.round(price * 0.2 * 12)}/year
                    </p>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer mb-6",
                    isRecommended
                      ? "bg-[#1797B9] hover:bg-[#1797B9]/90 text-white"
                      : "border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  )}
                >
                  {isFreePlan
                    ? "Get started free"
                    : trialDays > 0
                    ? `Try free for ${trialDays} days`
                    : "Get started"}
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-5" />

                {/* Features */}
                {features.length > 0 ? (
                  <ul className="space-y-2.5 flex-1">
                    {features.map((f: string, fi: number) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-[#1797B9] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-300 italic">No features configured yet.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Enterprise banner ── */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Enterprise</h3>
          <p className="text-sm text-gray-500">
            Custom limits, white-label, dedicated support, SLA &amp; custom onboarding.
          </p>
        </div>
        <a
          href="mailto:info@dotvizion.com?subject=Enterprise Plan Enquiry"
          className="shrink-0 flex items-center gap-2 text-sm font-semibold text-[#1797B9] hover:text-[#1797B9]/80 transition-colors"
        >
          Talk to us <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {/* ── Footer trust line ── */}
      <p className="text-center text-xs text-gray-400 mt-8">
        No credit card required · Cancel anytime · Payments secured by PayPal
      </p>
    </div>
  );
};
