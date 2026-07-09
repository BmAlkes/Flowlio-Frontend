import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { cn } from "@/lib/utils";
import {
  Check, Loader2, Zap, Rocket, Star, Briefcase, Building2,
  Shield, RefreshCw, Bolt, Headphones, Lock,
} from "lucide-react";
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
      if (t === "days")    return v === 1 ? "Day"   : `${v} Days`;
      if (t === "monthly") return v === 1 ? "Month" : `${v} Months`;
      if (t === "yearly")  return v === 1 ? "Year"  : `${v} Years`;
    }
  }
  const bc = plan?.billingCycle ?? plan?.billing_cycle;
  return bc === "monthly" ? "Month" : "Month";
};

const getPlanFeatures = (planFeatures: any): string[] =>
  planFeatures?.customFeatures ?? [];

const PLAN_ICONS = [Zap, Rocket, Star, Briefcase, Building2];

const ICON_COLORS = [
  { icon: "text-indigo-400", bg: "bg-indigo-50" },
  { icon: "text-blue-400",   bg: "bg-blue-50"   },
  { icon: "text-orange-400", bg: "bg-orange-50"  },
  { icon: "text-emerald-400",bg: "bg-emerald-50" },
  { icon: "text-purple-400", bg: "bg-purple-50"  },
];

const TRUST_BADGES = [
  { icon: Shield,      title: "Secure & Reliable",    desc: "Enterprise-grade security to protect your data."             },
  { icon: RefreshCw,   title: "30-Day Money Back",     desc: "Not satisfied? Get a full refund within 30 days."           },
  { icon: Bolt,        title: "Instant Access",        desc: "Get started immediately after signing up."                  },
  { icon: Headphones,  title: "24/7 Support",          desc: "We're here to help you anytime, every time."               },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const Pricing: FC<PricingProps> = ({ setSelectedPlan }) => {
  const { data: plansResponse, isLoading, isError } = useFetchPublicPlans();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { setSelectedPlan: setStorePlan } = usePlanSelectionStore();
  const { data: userData } = useUser();

  const fromSignup     = location.state?.fromSignup;
  const fromSignin     = location.state?.fromSignin;
  const pendingAccount = location.state?.pendingAccount;

  const allPlans  = plansResponse?.data ?? [];
  // Popular = middle backend plan
  const popularIdx = Math.floor(allPlans.length / 2);

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
      <Loader2 className="w-8 h-8 animate-spin text-[#F98618]" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-sm text-muted-foreground">
      <p>Could not load plans.</p>
      <button onClick={() => window.location.reload()} className="underline text-[#1797B9]">Retry</button>
    </div>
  );

  // All backend plans + static Enterprise at end
  const totalCols = allPlans.length + 1; // +1 for Enterprise

  return (
    <div className="w-full bg-white">

      {/* ── Header ── */}
      <div className="text-center pt-16 pb-10 px-4">
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase text-[#F98618] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full mb-5">
          Simple Pricing
        </span>
        <h1
          className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4"
          style={{ letterSpacing: "-0.025em" }}
        >
          Choose the{" "}
          <span className="text-[#F98618]">perfect plan</span>{" "}
          for you
        </h1>
        <p className="text-gray-500 text-[15px] max-w-md mx-auto mb-8 leading-relaxed">
          All plans include powerful features to streamline your workflow.<br />
          Upgrade or downgrade anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all",
              billing === "monthly" ? "bg-white text-[#F98618] shadow-sm" : "text-gray-500"
            )}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
              billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            )}
          >
            Yearly billing
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div
          className={cn(
            "grid gap-4 items-end",
            totalCols <= 2 && "grid-cols-2 max-w-2xl mx-auto",
            totalCols === 3 && "grid-cols-3 max-w-4xl mx-auto",
            totalCols === 4 && "grid-cols-4 max-w-6xl mx-auto",
            totalCols >= 5 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          )}
        >
          {/* ── Backend plans ── */}
          {allPlans.map((plan: any, i: number) => {
            const isPopular   = i === popularIdx;
            const isFreePlan  = Number(plan.price) === 0;
            const price       = Number(plan.price) || 0;
            const displayPrice = billing === "yearly" && !isFreePlan ? Math.round(price * 0.8) : price;
            const features    = getPlanFeatures(plan.features);
            const duration    = formatDuration(plan);
            const trialDays   = plan.trialDays ?? 0;
            const name        = plan.customPlanName || plan.name;
            const Icon        = PLAN_ICONS[i % PLAN_ICONS.length];
            const iconStyle   = ICON_COLORS[i % ICON_COLORS.length];

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl transition-all duration-200",
                  isPopular
                    ? "bg-[#0f172a] shadow-2xl scale-105 z-10 border border-slate-700"
                    : "bg-white border border-gray-200 hover:shadow-md hover:border-gray-300"
                )}
              >
                {/* Most Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-[#F98618] text-white text-[10px] font-black uppercase tracking-[0.12em] px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1 pt-8">
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    isPopular ? "bg-white/10" : iconStyle.bg
                  )}>
                    <Icon className={cn("w-5 h-5", isPopular ? "text-orange-400" : iconStyle.icon)} />
                  </div>

                  {/* Name */}
                  <h3 className={cn("text-xl font-bold mb-1", isPopular ? "text-white" : "text-gray-900")}>
                    {name}
                  </h3>
                  <p className={cn("text-[13px] mb-5 leading-relaxed", isPopular ? "text-slate-400" : "text-gray-400")}>
                    {plan.description || " "}
                  </p>

                  {/* Price */}
                  <div className="mb-5">
                    {isFreePlan ? (
                      <div className="flex items-end gap-1">
                        <span className={cn("text-4xl font-black", isPopular ? "text-white" : "text-gray-900")}>$0</span>
                        <span className={cn("text-sm mb-1", isPopular ? "text-slate-400" : "text-gray-400")}>/ {duration}</span>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className={cn("text-4xl font-black", isPopular ? "text-white" : "text-gray-900")}>${displayPrice}</span>
                        <span className={cn("text-sm mb-1", isPopular ? "text-slate-400" : "text-gray-400")}>/ {duration}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelect(i)}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-150 mb-5",
                      isPopular
                        ? "bg-[#F98618] hover:bg-[#F98618]/90 text-white shadow-lg shadow-orange-500/25"
                        : isFreePlan
                        ? "border-2 border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                        : "border-2 border-[#1797B9] text-[#1797B9] hover:bg-[#1797B9] hover:text-white"
                    )}
                  >
                    {isFreePlan
                      ? "Get Started Free"
                      : trialDays > 0
                      ? `Start ${trialDays}-Day Trial`
                      : "Get Started"}
                  </button>

                  {/* Features */}
                  {features.length > 0 ? (
                    <ul className="space-y-2.5 flex-1">
                      {features.map((f: string, fi: number) => (
                        <li key={fi} className="flex items-start gap-2.5 text-sm">
                          <Check className={cn("h-4 w-4 mt-0.5 shrink-0", isPopular ? "text-[#F98618]" : "text-[#1797B9]")} />
                          <span className={isPopular ? "text-slate-300" : "text-gray-600"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-slate-500">No features configured.</p>
                  )}

                  {/* No credit card */}
                  <p className={cn("text-center text-xs mt-5", isPopular ? "text-slate-500" : "text-gray-400")}>
                    No credit card required
                  </p>
                </div>
              </div>
            );
          })}

          {/* ── Enterprise — static ── */}
          <div className="relative flex flex-col rounded-2xl bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="p-6 flex flex-col flex-1 pt-8">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Enterprise</h3>
              <p className="text-[13px] text-gray-400 mb-5 leading-relaxed">For large organizations.</p>
              <div className="mb-5">
                <span className="text-4xl font-black text-gray-900">Custom</span>
                <span className="text-sm text-gray-400 ml-1">/ Month</span>
              </div>
              <a
                href="mailto:info@dotvizion.com?subject=Enterprise Plan Enquiry"
                className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-150 mb-5 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 text-center block"
              >
                Contact Sales
              </a>
              <ul className="space-y-2.5 flex-1">
                {["Unlimited Users", "Unlimited Tasks", "Custom Integrations", "Dedicated Support", "SLA & Uptime Guarantee", "Custom Features", "Onboarding & Training"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-[#1797B9]" />
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-center text-xs mt-5 text-gray-400">Let's build something great</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="border-t border-gray-100 bg-[#f8f9fc]">
        <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {TRUST_BADGES.map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <b.icon className="w-5 h-5 text-[#1797B9]" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800 mb-1">{b.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer line */}
        <div className="flex items-center justify-center gap-2 pb-8 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5 text-[#F98618]" />
          All payments are secure and encrypted.
        </div>
      </div>
    </div>
  );
};
