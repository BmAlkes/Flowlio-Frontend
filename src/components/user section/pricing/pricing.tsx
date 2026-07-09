import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { cn } from "@/lib/utils";
import {
  Check, Loader2,
  Zap, Rocket, Star, Building2, Shield, RefreshCw, Bolt, Headphones,
} from "lucide-react";
import { FC, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { usePlanSelectionStore } from "@/store/planSelection.store";
import { useUser } from "@/providers/user.provider";

interface PricingProps {
  selectedPlan: number | null;
  setSelectedPlan: (plan: number | null) => void;
}

const FREE_FEATURES = [
  "1 User",
  "Up to 10 projects",
  "Up to 50 tasks",
  "Basic time tracking",
  "Client portal (1 client)",
  "Community support",
];

const PLAN_ICONS = [Zap, Rocket, Star];

const TRUST_BADGES = [
  { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security to protect your data." },
  { icon: RefreshCw, title: "30-Day Money Back", desc: "Not satisfied? Get a full refund within 30 days." },
  { icon: Bolt, title: "Instant Access", desc: "Get started immediately after signing up." },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help you anytime, every time." },
];

const formatDuration = (plan: any): string => {
  const dv = plan?.durationValue ?? plan?.duration_value;
  const dt = plan?.durationType ?? plan?.duration_type;
  if (dv && dt) {
    const v = Number(dv);
    if (!isNaN(v) && v > 0) {
      const t = dt.trim().toLowerCase();
      if (t === "days") return v === 1 ? "Day" : `${v} Days`;
      if (t === "monthly") return v === 1 ? "Month" : `${v} Months`;
      if (t === "yearly") return v === 1 ? "Year" : `${v} Years`;
    }
  }
  const bc = plan?.billingCycle ?? plan?.billing_cycle;
  return bc === "monthly" ? "Month" : bc ?? "Month";
};

const formatPlanFeatures = (planFeatures: any): string[] => {
  if (!planFeatures?.customFeatures) return [];
  return planFeatures.customFeatures;
};

export const Pricing: FC<PricingProps> = ({ selectedPlan: _selectedPlan, setSelectedPlan }) => {
  const { data: plansResponse, isLoading, isError } = useFetchPublicPlans();
  const navigate = useNavigate();
  const location = useLocation();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const { setSelectedPlan: setStorePlan } = usePlanSelectionStore();
  const { data: userData } = useUser();

  const fromSignup = location.state?.fromSignup;
  const fromSignin = location.state?.fromSignin;
  const pendingAccount = location.state?.pendingAccount;

  const plans = plansResponse?.data ?? [];

  const handleGetStarted = (planIndex: number) => {
    setSelectedPlan(planIndex);
    const p = plansResponse?.data?.[planIndex];
    if (p) setStorePlan(planIndex, p.id, { name: p.name, price: p.price, description: p.description });
    if (!userData?.user) {
      navigate("/auth/signup", { state: { fromPricing: true, selectedPlan: planIndex }, replace: false });
      return;
    }
    navigate("/checkout", {
      state: { selectedPlan: planIndex, createOrganization: fromSignup || fromSignin || pendingAccount, fromSignup, fromSignin, pendingAccount },
    });
  };

  const handleFreeStart = () => {
    if (!userData?.user) {
      navigate("/auth/signup", { state: { fromPricing: true, isFree: true }, replace: false });
    } else {
      navigate("/dashboard");
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[#F98618]" />
      <p className="text-muted-foreground text-sm">Loading plans…</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <p className="text-red-500 text-sm">Failed to load plans. Please try again.</p>
      <button onClick={() => window.location.reload()} className="text-sm underline text-[#1797B9]">Retry</button>
    </div>
  );

  const totalCols = plans.length + 2; // +free +enterprise
  const popularIdx = Math.floor(plans.length / 2);

  return (
    <div className="w-full bg-white">
      {/* ── Header ── */}
      <div className="text-center pt-16 pb-10 px-4">
        <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#F98618] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full mb-5">
          Simple Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
          Choose the <span className="text-[#F98618]">perfect plan</span> for you
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
          All plans include powerful features to streamline your workflow.<br />
          Upgrade or downgrade anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1 gap-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn("px-5 py-2 rounded-full text-sm font-semibold transition-all",
              billing === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
              billing === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
            Yearly billing
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className={cn(
          "grid gap-4 items-end",
          totalCols <= 3 ? "grid-cols-3 max-w-3xl mx-auto" :
          totalCols === 4 ? "grid-cols-4 max-w-5xl mx-auto" :
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        )}>
          {/* Free */}
          <PlanCard
            icon={<Zap className="w-5 h-5 text-indigo-500" />}
            iconBg="bg-indigo-50"
            name="Free"
            tagline="Get started at no cost."
            price="$0"
            duration="Month"
            features={FREE_FEATURES}
            trialDays={0}
            cta="Get Started Free"
            ctaStyle="outline"
            onCta={handleFreeStart}
            isPopular={false}
          />

          {/* Dynamic plans */}
          {plans.map((plan: any, i: number) => {
            const isPopular = i === popularIdx;
            const Icon = PLAN_ICONS[i % PLAN_ICONS.length];
            const price = Number(plan.price) || 0;
            const displayPrice = billing === "yearly" ? Math.round(price * 0.8) : price;
            const features = formatPlanFeatures(plan.features);
            const trial = plan.trialDays ?? 0;

            return (
              <PlanCard
                key={plan.id}
                icon={<Icon className={cn("w-5 h-5", isPopular ? "text-orange-400" : "text-orange-500")} />}
                iconBg={isPopular ? "bg-white/15" : "bg-orange-50"}
                name={plan.customPlanName || plan.name}
                tagline={plan.description || ""}
                price={`$${displayPrice}`}
                duration={formatDuration(plan)}
                features={features}
                trialDays={trial}
                cta={trial > 0 ? `Start ${trial}-Day Trial` : "Get Started"}
                ctaStyle={isPopular ? "primary" : "outline"}
                onCta={() => handleGetStarted(i)}
                isPopular={isPopular}
              />
            );
          })}

          {/* Enterprise */}
          <PlanCard
            icon={<Building2 className="w-5 h-5 text-purple-500" />}
            iconBg="bg-purple-50"
            name="Enterprise"
            tagline="For large organizations."
            price="Custom"
            duration="Month"
            features={["Unlimited Users", "Unlimited Tasks", "Custom Integrations", "Dedicated Support", "SLA & Uptime Guarantee", "Custom Features", "Onboarding & Training"]}
            trialDays={0}
            cta="Contact Sales"
            ctaStyle="ghost"
            onCta={() => { window.location.href = "mailto:info@dotvizion.com?subject=Enterprise Plan Enquiry"; }}
            isPopular={false}
            footer="Let's build something great"
          />
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {TRUST_BADGES.map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <b.icon className="w-5 h-5 text-gray-500" />
              </div>
              <p className="font-semibold text-sm text-gray-800">{b.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 pb-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> All payments are secure and encrypted.
        </p>
      </div>
    </div>
  );
};

// ─── PlanCard ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  tagline: string;
  price: string;
  duration: string;
  features: string[];
  trialDays: number;
  cta: string;
  ctaStyle: "primary" | "outline" | "ghost";
  onCta: () => void;
  isPopular: boolean;
  footer?: string;
}

const PlanCard: FC<PlanCardProps> = ({
  icon, iconBg, name, tagline, price, duration,
  features, trialDays: _trialDays, cta, ctaStyle, onCta, isPopular, footer,
}) => {
  const isCustom = price === "Custom";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border transition-all duration-200",
        isPopular
          ? "bg-gray-900 border-gray-800 shadow-2xl -translate-y-2"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#F98618] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 pt-8">
        {/* Icon */}
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4 shrink-0", iconBg)}>
          {icon}
        </div>

        {/* Name + tagline */}
        <h3 className={cn("text-lg font-bold mb-1", isPopular ? "text-white" : "text-gray-900")}>{name}</h3>
        <p className={cn("text-xs mb-5 leading-relaxed", isPopular ? "text-gray-400" : "text-gray-500")}>{tagline}</p>

        {/* Price */}
        <div className="mb-5">
          {isCustom ? (
            <p className={cn("text-4xl font-black", isPopular ? "text-white" : "text-gray-900")}>
              Custom<span className={cn("text-sm font-normal ml-1", isPopular ? "text-gray-400" : "text-gray-500")}>/ {duration}</span>
            </p>
          ) : (
            <div className="flex items-end gap-1">
              <span className={cn("text-4xl font-black", isPopular ? "text-white" : "text-gray-900")}>{price}</span>
              <span className={cn("text-sm mb-1.5", isPopular ? "text-gray-400" : "text-gray-500")}>/ {duration}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onCta}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 mb-6 cursor-pointer",
            ctaStyle === "primary" && "bg-[#F98618] hover:bg-[#F98618]/90 text-white shadow-lg shadow-orange-500/25",
            ctaStyle === "outline" && "border-2 border-[#1797B9] text-[#1797B9] hover:bg-[#1797B9] hover:text-white",
            ctaStyle === "ghost" && "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          {cta}
        </button>

        {/* Features */}
        <ul className="space-y-2.5 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <Check className={cn("h-4 w-4 mt-0.5 shrink-0", isPopular ? "text-[#F98618]" : "text-[#1797B9]")} />
              <span className={isPopular ? "text-gray-300" : "text-gray-600"}>{f}</span>
            </li>
          ))}
        </ul>

        {/* Footer note */}
        <p className={cn("text-center text-xs mt-5", isPopular ? "text-gray-500" : "text-gray-400")}>
          {footer ?? (isCustom ? "Let's build something great" : "No credit card required")}
        </p>
      </div>
    </div>
  );
};
