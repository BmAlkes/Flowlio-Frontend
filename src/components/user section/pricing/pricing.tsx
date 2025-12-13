import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Checkbox } from "@/components/ui/checkbox";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { cn } from "@/lib/utils";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { FC, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { usePlanSelectionStore } from "@/store/planSelection.store";
import { useUser } from "@/providers/user.provider";

interface PricingProps {
  selectedPlan: number | null;
  setSelectedPlan: (plan: number | null) => void;
}

// Default features when no plan is selected
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

// Function to format duration from database
const formatDuration = (plan: any): string => {
  // Handle both snake_case and camelCase from API
  const durationValue = plan?.durationValue ?? plan?.duration_value;
  const durationType = plan?.durationType ?? plan?.duration_type;

  // Check if durationValue and durationType exist and are valid
  if (
    durationValue !== null &&
    durationValue !== undefined &&
    durationType &&
    durationType.trim() !== ""
  ) {
    const value = Number(durationValue); // Ensure it's a number

    // Validate the value is a valid number
    if (!isNaN(value) && value > 0) {
      const type = durationType.trim().toLowerCase();

      if (type === "days") {
        return value === 1 ? "1 Day" : `${value} Days`;
      } else if (type === "monthly") {
        return value === 1 ? "1 Month" : `${value} Months`;
      } else if (type === "yearly") {
        return value === 1 ? "1 Year" : `${value} Years`;
      }
    }
  }

  // Fallback to billingCycle if duration is not set
  const billingCycle = plan?.billingCycle ?? plan?.billing_cycle;
  if (billingCycle) {
    return billingCycle === "monthly" ? "month" : billingCycle;
  }

  return "month"; // Default fallback
};

// Function to convert database features to display format
const formatPlanFeatures = (planFeatures: any) => {
  if (!planFeatures) return [];

  const features = [];

  // Add custom features from database
  if (
    planFeatures.customFeatures &&
    Array.isArray(planFeatures.customFeatures)
  ) {
    features.push(...planFeatures.customFeatures);
  }

  return features;
};

export const Pricing: FC<PricingProps> = ({
  selectedPlan,
  setSelectedPlan,
}) => {
  const { data: plansResponse, isLoading, isError } = useFetchPublicPlans();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);
  const { setSelectedPlan: setStorePlan } = usePlanSelectionStore();
  const { data: userData } = useUser(); // Check if user is authenticated

  // Check if user came from signup or signin
  const fromSignup = location.state?.fromSignup;
  const fromSignin = location.state?.fromSignin;
  const pendingAccount = location.state?.pendingAccount;

  // Animation effect when plan changes
  useEffect(() => {
    if (selectedPlan !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedPlan]);

  // Compute planDetails inside the component using the fetched data
  const planDetails = [
    {
      title:
        plansResponse?.data?.[0]?.customPlanName ||
        plansResponse?.data?.[0]?.name ||
        "Basic Plan",
      price: plansResponse?.data?.[0]?.price,
      description: plansResponse?.data?.[0]?.description,
      duration: formatDuration(plansResponse?.data?.[0]),
      durationValue: plansResponse?.data?.[0]?.durationValue,
      durationType: plansResponse?.data?.[0]?.durationType,
      trialDays: plansResponse?.data?.[0]?.trialDays ?? 0,
      features: formatPlanFeatures(plansResponse?.data?.[0]?.features),
    },
    {
      title:
        plansResponse?.data?.[1]?.customPlanName ||
        plansResponse?.data?.[1]?.name ||
        "Pro Plan",
      price: plansResponse?.data?.[1]?.price,
      description: plansResponse?.data?.[1]?.description,
      duration: formatDuration(plansResponse?.data?.[1]),
      durationValue: plansResponse?.data?.[1]?.durationValue,
      durationType: plansResponse?.data?.[1]?.durationType,
      trialDays: plansResponse?.data?.[1]?.trialDays ?? 0,
      features: formatPlanFeatures(plansResponse?.data?.[1]?.features),
    },
    {
      title:
        plansResponse?.data?.[2]?.customPlanName ||
        plansResponse?.data?.[2]?.name ||
        "Enterprise Plan",
      price: plansResponse?.data?.[2]?.price,
      description: plansResponse?.data?.[2]?.description,
      duration: formatDuration(plansResponse?.data?.[2]),
      durationValue: plansResponse?.data?.[2]?.durationValue,
      durationType: plansResponse?.data?.[2]?.durationType,
      trialDays: plansResponse?.data?.[2]?.trialDays ?? 0,
      features: formatPlanFeatures(plansResponse?.data?.[2]?.features),
    },
  ];

  // Handle plan selection (show feature preview)
  const handlePlanSelect = (planIndex: number) => {
    // Set visual selection for immediate feedback and show feature preview
    setSelectedPlan(planIndex);
  };

  // Handle navigation to checkout
  const handleGetStarted = (planIndex: number) => {
    // Set visual selection for immediate feedback
    setSelectedPlan(planIndex);

    // Get plan details from API response
    const selectedPlanData = plansResponse?.data?.[planIndex];
    if (selectedPlanData) {
      // Save plan selection to store
      setStorePlan(planIndex, selectedPlanData.id, {
        name: selectedPlanData.name,
        price: selectedPlanData.price,
        description: selectedPlanData.description,
      });
    }

    // SIMPLIFIED FLOW: Check authentication first
    // If user is NOT authenticated, go directly to signup (not checkout)
    if (!userData?.user) {
      // User not authenticated, go to signup first
      navigate("/auth/signup", {
        state: {
          fromPricing: true,
          selectedPlan: planIndex,
        },
        replace: false,
      });
      return;
    }

    // User is authenticated, go directly to checkout
    navigate("/checkout", {
      state: {
        selectedPlan: planIndex,
        createOrganization: fromSignup || fromSignin || pendingAccount,
        fromSignup: fromSignup,
        fromSignin: fromSignin,
        pendingAccount: pendingAccount,
      },
    });
  };

  // Show loading state while plans are being fetched
  if (isLoading) {
    return (
      <Center className="flex-col min-h-[60vh] max-md:pb-10">
        <Stack className="text-center justify-center items-center px-4 gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-[#F98618]" />
          <Flex className="text-center text-black font-[100] max-w-2xl max-sm:w-full text-4xl max-sm:text-3xl">
            Choose
            <Box className=" text-[#F98618] font-semibold"> The Ideal Plan</Box>
          </Flex>
          <Box className="w-lg max-sm:w-full font-[200] text-black text-[15px]">
            Loading our pricing plans...
          </Box>
        </Stack>
      </Center>
    );
  }

  // Show error state if plans failed to load
  if (isError) {
    return (
      <Center className="flex-col min-h-[60vh] max-md:pb-10">
        <Stack className="text-center justify-center items-center px-4 gap-6">
          <Flex className="text-center text-black font-[100] max-w-2xl max-sm:w-full text-4xl max-sm:text-3xl">
            Choose
            <Box className=" text-[#F98618] font-semibold"> The Ideal Plan</Box>
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
    <Center className="flex-col max-md:pb-10 ">
      <Stack className="text-center justify-center items-center px-4 max-sm:mt-5">
        <Flex className="text-center text-black font-[100] max-w-2xl max-sm:w-full text-4xl max-sm:text-3xl">
          Choose
          <Box className=" text-[#F98618] font-semibold"> The Ideal Plan</Box>
        </Flex>

        <Box className="w-lg max-sm:w-full font-[200] text-black text-[15px]">
          Get access to premium features designed to boost productivity and
          simplify your workflow with seamless performance.
        </Box>
      </Stack>

      <Flex className="p-2 gap-6 max-lg:flex-col mt-5">
        <Stack className="justify-start items-start border-2 py-12 px-10 border-gray-100 rounded-xl max-w-[28rem] min-h-[23rem] max-sm:w-full bg-gradient-to-r from-indigo-50 to-white gap-3 relative z-0 overflow-hidden">
          {/* Dynamic Features Section */}
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
                <Box className="text-lg font-semibold text-indigo-600 mb-4 text-center capitalize">
                  {plansResponse?.data?.[selectedPlan]?.customPlanName ||
                    plansResponse?.data?.[selectedPlan]?.name}{" "}
                  Features
                </Box>
                <Stack className="gap-3">
                  {(() => {
                    const features = formatPlanFeatures(
                      plansResponse?.data?.[selectedPlan]?.features
                    );
                    if (features.length === 0) {
                      return (
                        <Box className="text-gray-500 text-sm text-center py-4">
                          No features available for this plan
                        </Box>
                      );
                    }
                    return features.map((feature, index) => (
                      <Flex
                        key={index}
                        className={cn(
                          "gap-4 transition-all duration-200",
                          `animate-in slide-in-from-left-${(index + 1) * 100}`
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Box>
                          <Check className="size-4 text-indigo-600" />
                        </Box>
                        <h1 className="text-black text-[15px]">{feature}</h1>
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
                <Stack className="gap-3">
                  {defaultFeatures.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <Flex key={index} className="gap-4">
                        <Box className="flex items-center justify-center w-6 h-6 rounded-full  text-gray-600">
                          <IconComponent className="size-4" />
                        </Box>
                        <h1 className="text-black text-[15px]">
                          {feature.text}
                        </h1>
                      </Flex>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>

        <Stack className="gap-4 relative z-10">
          {planDetails.map((plan, index) => (
            <Flex
              onClick={() => handlePlanSelect(index)}
              key={index}
              className={`flex-col justify-between items-center px-6 py-8 rounded-xl gap-5 max-sm:p-5 transition-all duration-300 cursor-pointer ${
                selectedPlan === index
                  ? "bg-gradient-to-r from-indigo-300 to-indigo-300 shadow-lg shadow-blue-500/25 transform scale-105"
                  : "bg-gradient-to-r from-red-50 to-indigo-100 hover:shadow-md hover:shadow-gray-300/50"
              }`}
            >
              <Flex className="justify-between items-center w-full">
                <Flex className="items-start gap-2">
                  <Flex className="items-center gap-2">
                    <Checkbox
                      className="rounded-full size-4.5 cursor-pointer mb-6"
                      checked={selectedPlan === index}
                      onChange={() => handlePlanSelect(index)}
                    />
                    <Flex className="flex-col items-start gap-0">
                      <Box
                        className={`text-[18px] font-semibold capitalize ${
                          selectedPlan === index
                            ? "text-white"
                            : "text-[#353333]"
                        }`}
                      >
                        {plan.title}
                      </Box>
                      <Box
                        className={`text-[15px] font-light ${
                          selectedPlan === index
                            ? "text-white/90"
                            : "text-[#353333]"
                        }`}
                      >
                        {plan.description}
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex
                  className={`flex-col items-end ${
                    selectedPlan === index ? "text-white" : "text-black"
                  }`}
                >
                  <Flex className="items-baseline">
                    <h1 className="font-semibold">$ {plan.price}</h1>
                    <Flex>
                      <h1 className="font-light">/{plan.duration}</h1>
                    </Flex>
                  </Flex>
                  {/* Show Trial badge if trialDays > 0 */}
                  {plan.trialDays > 0 && (
                    <Box className="mt-1">
                      <Box className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {plan.trialDays}-Day Trial
                      </Box>
                    </Box>
                  )}
                </Flex>
              </Flex>

              {/* Get Started Button - Visible on both desktop and mobile when plan is selected */}
              {selectedPlan === index && (
                <Button
                  variant="ghost"
                  className={cn(
                    "bg-gradient-to-r from-white to-indigo-300 cursor-pointer border border-gray-200 px-4 py-2 rounded-lg hover:border-white font-Outfit text-sm text-gray-800 w-full mt-2"
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    handleGetStarted(index);
                  }}
                >
                  {fromSignup ? "Continue to Setup" : "Get Started"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
            </Flex>
          ))}
        </Stack>
      </Flex>
    </Center>
  );
};
