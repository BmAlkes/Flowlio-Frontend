import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Checkbox } from "@/components/ui/checkbox";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { cn } from "@/lib/utils";
import { Check, Loader2, ArrowRight, Mail } from "lucide-react";
import { FC, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { usePlanSelectionStore } from "@/store/planSelection.store";
import { useUser } from "@/providers/user.provider";

interface PricingProps {
  selectedPlan: number | null;
  setSelectedPlan: (plan: number | null) => void;
}

const defaultFeatures = [
  {
    icon: Check,
    text: "Choose from multiple secure payment options tailored to your needs.",
  },
  {
    icon: Check,
    text: "Easily manage and update your preferred pricing methods anytime.",
  },
  { icon: Check, text: "Set default payment modes for faster transactions." },
  {
    icon: Check,
    text: "View detailed breakdowns of charges before confirming payments.",
  },
  {
    icon: Check,
    text: "Enjoy transparent pricing with no hidden fees or surprises.",
  },
];

const formatDuration = (plan: any): string => {
  const durationValue = plan?.durationValue ?? plan?.duration_value;
  const durationType = plan?.durationType ?? plan?.duration_type;

  if (
    durationValue !== null &&
    durationValue !== undefined &&
    durationType &&
    durationType.trim() !== ""
  ) {
    const value = Number(durationValue);
    if (!isNaN(value) && value > 0) {
      const type = durationType.trim().toLowerCase();
      if (type === "days") return value === 1 ? "1 Day" : `${value} Days`;
      if (type === "monthly") return value === 1 ? "1 Month" : `${value} Months`;
      if (type === "yearly") return value === 1 ? "1 Year" : `${value} Years`;
    }
  }

  const billingCycle = plan?.billingCycle ?? plan?.billing_cycle;
  if (billingCycle) return billingCycle === "monthly" ? "month" : billingCycle;
  return "month";
};

const formatPlanFeatures = (planFeatures: any) => {
  if (!planFeatures) return [];
  const features = [];
  if (planFeatures.customFeatures && Array.isArray(planFeatures.customFeatures)) {
    features.push(...planFeatures.customFeatures);
  }
  return features;
};

const ENTERPRISE_FEATURES = [
  "Unlimited everything",
  "Dedicated onboarding",
  "Custom integrations",
  "SLA & priority support",
  "White-label included",
  "Custom AI token quota",
];

export const Pricing: FC<PricingProps> = ({ selectedPlan, setSelectedPlan }) => {
  const { data: plansResponse, isLoading, isError } = useFetchPublicPlans();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const { setSelectedPlan: setStorePlan } = usePlanSelectionStore();
  const { data: userData } = useUser();

  const fromSignup = location.state?.fromSignup;
  const fromSignin = location.state?.fromSignin;
  const pendingAccount = location.state?.pendingAccount;

  useEffect(() => {
    if (selectedPlan !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedPlan]);

  const planDetails = [0, 1, 2].map((i) => ({
    title:
      plansResponse?.data?.[i]?.customPlanName ||
      plansResponse?.data?.[i]?.name ||
      ["Basic Plan", "Pro Plan", "Enterprise Plan"][i],
    price: plansResponse?.data?.[i]?.price,
    description: plansResponse?.data?.[i]?.description,
    duration: formatDuration(plansResponse?.data?.[i]),
    trialDays: plansResponse?.data?.[i]?.trialDays ?? 0,
    features: formatPlanFeatures(plansResponse?.data?.[i]?.features),
  }));

  const handlePlanSelect = (planIndex: number) => {
    setSelectedPlan(planIndex);
  };

  const handleGetStarted = (planIndex: number) => {
    setSelectedPlan(planIndex);
    const selectedPlanData = plansResponse?.data?.[planIndex];
    if (selectedPlanData) {
      setStorePlan(planIndex, selectedPlanData.id, {
        name: selectedPlanData.name,
        price: selectedPlanData.price,
        description: selectedPlanData.description,
      });
    }

    if (!userData?.user) {
      navigate("/auth/signup", {
        state: { fromPricing: true, selectedPlan: planIndex },
        replace: false,
      });
      return;
    }

    navigate("/checkout", {
      state: {
        selectedPlan: planIndex,
        createOrganization: fromSignup || fromSignin || pendingAccount,
        fromSignup,
        fromSignin,
        pendingAccount,
      },
    });
  };

  if (isLoading) {
    return (
      <Center className="flex-col min-h-[60vh] max-md:pb-10">
        <Stack className="text-center justify-center items-center px-4 gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-[#F98618]" />
          <Flex className="text-center text-foreground font-[100] max-w-2xl max-sm:w-full text-4xl max-sm:text-3xl">
            Choose
            <Box className="text-[#F98618] font-semibold"> The Ideal Plan</Box>
          </Flex>
          <Box className="w-lg max-sm:w-full font-[200] text-foreground text-[15px]">
            Loading our pricing plans...
          </Box>
        </Stack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Center className="flex-col min-h-[60vh] max-md:pb-10">
        <Stack className="text-center justify-center items-center px-4 gap-6">
          <Flex className="text-center text-foreground font-[100] max-w-2xl max-sm:w-full text-4xl max-sm:text-3xl">
            Choose
            <Box className="text-[#F98618] font-semibold"> The Ideal Plan</Box>
          </Flex>
          <Box className="w-lg max-sm:w-full font-[200] text-red-600 text-[15px]">
            Failed to load pricing plans. Please try again later.
          </Box>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#F98618] hover:bg-[#F98618]/80 text-white"
          >
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Center className="flex-col max-md:pb-10 py-10">
      {/* ── Header ── */}
      <Stack className="text-center justify-center items-center px-4 max-sm:mt-5 mb-10">
        <Flex className="text-center text-foreground font-[100] max-w-2xl max-sm:w-full text-4xl max-sm:text-3xl">
          Choose
          <Box className="text-[#F98618] font-semibold"> The Ideal Plan</Box>
        </Flex>
        <Box className="w-lg max-sm:w-full font-[200] text-foreground text-[15px]">
          Get access to premium features designed to boost productivity and
          simplify your workflow with seamless performance.
        </Box>
      </Stack>

      <Flex className="px-4 gap-8 max-lg:flex-col max-w-6xl w-full">
        {/* ── Left: Feature preview ── */}
        <Stack className="justify-start items-start border border-border py-10 px-8 rounded-2xl max-w-[26rem] min-h-[22rem] max-lg:max-w-full max-lg:w-full bg-gradient-to-br from-indigo-500/5 via-white to-indigo-500/3 gap-3 relative z-0 overflow-hidden">
          <Box className="w-full flex items-start">
            {selectedPlan !== null && plansResponse?.data?.[selectedPlan] ? (
              <Box
                className={cn(
                  "transition-all duration-300 ease-in-out w-full",
                  isAnimating
                    ? "opacity-0 transform translate-y-2"
                    : "opacity-100 transform translate-y-0"
                )}
              >
                <Box className="text-lg font-semibold text-indigo-600 mb-5 text-center capitalize">
                  {plansResponse?.data?.[selectedPlan]?.customPlanName ||
                    plansResponse?.data?.[selectedPlan]?.name}{" "}
                  Features
                </Box>
                <Stack className="gap-3.5">
                  {(() => {
                    const features = formatPlanFeatures(
                      plansResponse?.data?.[selectedPlan]?.features
                    );
                    if (features.length === 0) {
                      return (
                        <Box className="text-muted-foreground text-sm text-center py-4">
                          No features available for this plan
                        </Box>
                      );
                    }
                    return features.map((feature, index) => (
                      <Flex
                        key={index}
                        className={cn(
                          "gap-3 transition-all duration-200",
                          `animate-in slide-in-from-left-${(index + 1) * 100}`
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Box className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="size-3 text-indigo-600" />
                        </Box>
                        <span className="text-foreground text-[15px] leading-snug">{feature}</span>
                      </Flex>
                    ));
                  })()}
                </Stack>
              </Box>
            ) : (
              <Box
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  isAnimating
                    ? "opacity-0 transform translate-y-2"
                    : "opacity-100 transform translate-y-0"
                )}
              >
                <Stack className="gap-3.5">
                  {defaultFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Flex key={index} className="gap-3">
                        <Box className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-muted-foreground shrink-0 mt-0.5">
                          <IconComponent className="size-3" />
                        </Box>
                        <span className="text-foreground text-[15px] leading-snug">
                          {feature.text}
                        </span>
                      </Flex>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>

        {/* ── Right: Plan cards ── */}
        <Stack className="gap-4 relative z-10 flex-1 max-lg:w-full">
          {planDetails.map((plan, index) => (
            <Flex
              onClick={() => handlePlanSelect(index)}
              key={index}
              className={cn(
                "flex-col justify-between items-center px-6 py-6 rounded-2xl gap-4 max-sm:p-5 transition-all duration-300 cursor-pointer border",
                selectedPlan === index
                  ? "bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-xl shadow-indigo-500/20 border-indigo-400 scale-[1.02]"
                  : "bg-gradient-to-r from-slate-50/80 to-indigo-50/50 hover:shadow-md border-border hover:border-indigo-200"
              )}
            >
              <Flex className="justify-between items-center w-full">
                <Flex className="items-start gap-3">
                  <Checkbox
                    className="rounded-full size-4.5 cursor-pointer mt-1"
                    checked={selectedPlan === index}
                    onChange={() => handlePlanSelect(index)}
                  />
                  <Flex className="flex-col items-start gap-0.5">
                    <Box
                      className={cn(
                        "text-lg font-semibold capitalize",
                        selectedPlan === index ? "text-white" : "text-foreground"
                      )}
                    >
                      {plan.title}
                    </Box>
                    <Box
                      className={cn(
                        "text-sm font-light",
                        selectedPlan === index ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      {plan.description}
                    </Box>
                  </Flex>
                </Flex>
                <Flex
                  className={cn(
                    "flex-col items-end shrink-0",
                    selectedPlan === index ? "text-white" : "text-foreground"
                  )}
                >
                  <Flex className="items-baseline gap-0.5">
                    <span className="text-xl font-bold">${plan.price}</span>
                    <span className="text-sm font-light">/{plan.duration}</span>
                  </Flex>
                  {plan.trialDays > 0 && (
                    <Box className="mt-1.5">
                      <Box className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {plan.trialDays}-Day Trial
                      </Box>
                    </Box>
                  )}
                </Flex>
              </Flex>

              {selectedPlan === index && (
                <Button
                  variant="ghost"
                  className="bg-white/90 hover:bg-white cursor-pointer border-0 px-4 py-2.5 rounded-xl text-sm text-indigo-700 font-semibold w-full mt-1 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGetStarted(index);
                  }}
                >
                  {fromSignup ? "Continue to Setup" : "Get Started"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
            </Flex>
          ))}

          {/* ── Enterprise / On-Demand — same card shape ── */}
          <Flex
            className="flex-col px-6 py-6 rounded-2xl gap-4 max-sm:p-5 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
          >
            {/* Subtle accent glow */}
            <Box className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-[#F98618]/10 blur-3xl" />

            <Flex className="justify-between items-start w-full relative">
              <Flex className="items-start gap-3">
                <Box className="w-5 h-5 rounded-full bg-[#F98618]/20 flex items-center justify-center mt-1 shrink-0">
                  <Box className="w-2.5 h-2.5 rounded-full bg-[#F98618]" />
                </Box>
                <Flex className="flex-col gap-0.5">
                  <Flex className="items-center gap-2">
                    <Box className="text-lg font-semibold text-white">Custom Plan</Box>
                    <Box className="text-[10px] font-bold text-[#F98618] uppercase tracking-widest bg-[#F98618]/10 px-2 py-0.5 rounded-full">
                      On-Demand
                    </Box>
                  </Flex>
                  <Box className="text-sm font-light text-white/60">
                    Tailored limits, features and pricing built around your business.
                  </Box>
                </Flex>
              </Flex>
              <Box className="text-white font-bold text-lg shrink-0 mt-1">Custom</Box>
            </Flex>

            {/* Features */}
            <Flex className="flex-wrap gap-x-4 gap-y-1.5 ml-8">
              {ENTERPRISE_FEATURES.map((f) => (
                <Flex key={f} className="items-center gap-1.5">
                  <Check className="size-3 text-[#F98618] shrink-0" />
                  <span className="text-white/70 text-sm">{f}</span>
                </Flex>
              ))}
            </Flex>

            {/* CTA */}
            <a
              href="mailto:info@dotvizion.com?subject=Custom Plan Enquiry&body=Hi, I'd like to learn more about a custom Flowlio plan."
              className="ml-8"
            >
              <Button
                className="bg-[#F98618] hover:bg-[#F98618]/85 text-white font-semibold cursor-pointer gap-2 shadow-lg shadow-[#F98618]/20 rounded-xl px-6"
              >
                <Mail className="size-4" />
                Talk to us — info@dotvizion.com
                <ArrowRight className="size-4 ml-auto" />
              </Button>
            </a>
          </Flex>
        </Stack>
      </Flex>
    </Center>
  );
};
