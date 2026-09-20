import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react";
import type { FC } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { usePlanSelectionStore } from "@/store/planSelection.store";
import { useUser } from "@/providers/user.provider";
import type { IPlan } from "@/types";
import "./pricing.css";

interface PricingProps {
  selectedPlan: number | null;
  setSelectedPlan: (plan: number | null) => void;
}

function billingPeriod(plan: IPlan): string {
  const count = Number(plan.durationValue) || 1;
  const type = plan.durationType || plan.billingCycle || "monthly";
  const unit = type === "yearly" ? "year" : type === "days" ? "day" : "month";
  return count === 1 ? unit : `${count} ${unit}s`;
}

function formatPrice(plan: IPlan): string {
  const price = Number(plan.price);
  const currency = plan.currency || "USD";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    }).format(price);
  } catch { return `${currency} ${price.toFixed(2)}`; }
}

const questions = [
  { title: "Which plan should I choose?", answer: "Compare the features listed under each plan with the way your team works. If you need help choosing, contact us with your team size and the tools you need." },
  { title: "How do I get started?", answer: "Choose a plan, create your Flowlio account and complete checkout. Already have an account? Sign in first to continue with your existing workspace." },
  { title: "What billing period does the price cover?", answer: "Each price shows its billing period and currency. The plan you select carries through to checkout, where you can review it before confirming." },
];

export const Pricing: FC<PricingProps> = ({ setSelectedPlan }) => {
  const { data: plansResponse, isLoading, isError, refetch } = useFetchPublicPlans();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedPlan: setStorePlan } = usePlanSelectionStore();
  const { data: userData } = useUser();
  const plans = plansResponse?.data ?? [];
  const { fromSignup, fromSignin, pendingAccount } = location.state ?? {};

  const handleSelect = (index: number) => {
    const plan = plans[index];
    if (!plan) return;
    setSelectedPlan(index);
    setStorePlan(index, plan.id, { name: plan.name, price: plan.price, description: plan.description });
    if (!userData?.user) {
      navigate("/auth/signup", { state: { fromPricing: true, selectedPlan: index } });
      return;
    }
    navigate("/checkout", { state: {
      selectedPlan: index, createOrganization: fromSignup || fromSignin || pendingAccount,
      fromSignup, fromSignin, pendingAccount,
    } });
  };

  return (
    <main className="pricing-page">
      <header className="pricing-hero">
        <div className="pricing-container">
          <p className="pricing-eyebrow">Flowlio / Pricing</p>
          <h1>A clear plan.<br /><span>Room to grow.</span></h1>
          <p className="pricing-intro">Bring your clients, projects and day-to-day work together.<br className="pricing-desktop-break" /> Choose the plan that fits your team.</p>
          <Link to="/workflow" className="pricing-hero-link">Explore how Flowlio works <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </header>

      <section className="pricing-container pricing-plans" aria-labelledby="pricing-plans-title">
        <div className="pricing-section-heading">
          <h2 id="pricing-plans-title">Find your fit</h2>
          <p>Compare plans. Choose what you need.</p>
        </div>
        {isLoading ? (
          <div className="pricing-status" role="status"><Loader2 className="pricing-spinner" size={24} aria-hidden="true" /><p>Loading plans?</p></div>
        ) : isError ? (
          <div className="pricing-status" role="alert"><h3>Plans couldn't be loaded</h3><p>Please try again to see the available plans.</p><button className="pricing-button" onClick={() => void refetch()}>Try again <ArrowRight size={16} aria-hidden="true" /></button></div>
        ) : plans.length === 0 ? (
          <div className="pricing-status"><h3>Let's find the right plan for you</h3><p>Contact our team for current plan options.</p><a className="pricing-button" href="mailto:info@dotvizion.com?subject=Flowlio%20plans">Contact us <ArrowRight size={16} aria-hidden="true" /></a></div>
        ) : (
          <div className="pricing-grid">
            {plans.map((plan, index) => {
              const free = Number(plan.price) === 0;
              const features = plan.features?.customFeatures ?? [];
              const name = plan.customPlanName || plan.name;
              return (
                <article className="pricing-plan" key={plan.id} aria-labelledby={`plan-${plan.id}`}>
                  <div className="pricing-plan-heading"><h3 id={`plan-${plan.id}`}>{name}</h3><p>{plan.description}</p></div>
                  <div className="pricing-price"><strong>{formatPrice(plan)}</strong><span>{plan.currency || "USD"} / {billingPeriod(plan)}</span></div>
                  <button className={`pricing-button${free ? " pricing-button-outline" : ""}`} onClick={() => handleSelect(index)} aria-label={`Choose ${name}`}>
                    {free ? "Get started free" : `Choose ${name}`}<ArrowRight size={16} aria-hidden="true" />
                  </button>
                  <div className="pricing-plan-features">
                    {features.length > 0 && <><p className="pricing-feature-label">Included in {name}</p><ul>{features.map((feature, i) => <li key={`${feature}-${i}`}><Check size={16} aria-hidden="true" /><span>{feature}</span></li>)}</ul></>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div className="pricing-enterprise">
          <div><p className="pricing-eyebrow">Enterprise</p><h3>A different kind of setup?</h3><p>Tell us about your team and what you need from Flowlio.</p></div>
          <a href="mailto:info@dotvizion.com?subject=Enterprise%20Plan%20Enquiry" className="pricing-button pricing-button-outline">Talk to our team <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </section>

      <section className="pricing-questions" aria-labelledby="pricing-questions-title">
        <div className="pricing-container pricing-questions-layout">
          <div><p className="pricing-eyebrow">Before you choose</p><h2 id="pricing-questions-title">A few things<br />to know.</h2><p>Need a closer look at the product?</p><Link to="/showcase" className="pricing-text-link">See Flowlio in action <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="pricing-faq-list">{questions.map(question => <details key={question.title}><summary>{question.title}<ChevronDown size={18} aria-hidden="true" /></summary><p>{question.answer}</p></details>)}</div>
        </div>
      </section>
    </main>
  );
};
