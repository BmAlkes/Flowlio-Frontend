import { useLocation, useNavigate } from "react-router";
import { Box } from "@/components/ui/box";
import { useEffect, useState, useRef, useMemo } from "react";
import { Navbar } from "@/components/user section/navbar/navbar";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUser } from "@/providers/user.provider";
import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// import { Button } from "@/components/ui/button";
import {
  useCreatePayPalOrder,
  useCapturePayPalOrder,
} from "@/hooks/usePayPalPayment";
import { usePlanSelectionStore } from "@/store/planSelection.store";
import type { IPlan } from "@/types";
import { useSubscriptionStatus } from "@/hooks/usesubscription";
import { AlertCircle } from "lucide-react";

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

const formSchema = z.object({
  organizationName: z
    .string()
    .min(1, { message: "Organization name is required" }),
});

const CheckoutPage = () => {
  useEffect(() => {
    scrollTo(0, 0);
    document.title = "Checkout - Flowlio";
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: plansResponse, isLoading: plansLoading } =
    useFetchPublicPlans();
  const { data: subscriptionStatus } = useSubscriptionStatus({
    enabled: !!userData?.user, // Only check if user is logged in
  });
  const createPayPalOrderMutation = useCreatePayPalOrder();
  const capturePayPalOrderMutation = useCapturePayPalOrder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackendDemoMode, setIsBackendDemoMode] = useState<boolean | null>(
    null
  );
  const [checkingBackendMode, setCheckingBackendMode] = useState(true);

  // Get plan from store (primary source)
  const {
    selectedPlanIndex: storePlanIndex,
    selectedPlanId: storePlanId,
    organizationName: storeOrgName,
  } = usePlanSelectionStore();

  const selectedPlanIndex = location.state?.selectedPlan ?? storePlanIndex;
  const createOrganization =
    location.state?.createOrganization ??
    location.state?.pendingPayment ??
    false;
  const fromSignup = location.state?.fromSignup ?? false;
  const pendingPayment = location.state?.pendingPayment ?? false;
  const pendingPlanId = location.state?.selectedPlanId ?? null;
  const pendingOrgData = location.state?.pendingOrganizationData ?? null;

  // Fallback: check URL parameters if navigation state is lost
  const urlParams = new URLSearchParams(location.search);
  const fallbackPlanIndex = urlParams.get("plan");
  const finalPlanIndex =
    selectedPlanIndex ??
    storePlanIndex ??
    (fallbackPlanIndex ? parseInt(fallbackPlanIndex) : null);

  // Get plans array
  const plansArray = (plansResponse?.data as IPlan[]) || [];

  // Get plan ID to use - prioritize store
  const planIdToUse =
    storePlanId || pendingPlanId || pendingOrgData?.planId || null;

  // Get the selected plan
  const selectedPlan =
    finalPlanIndex !== null && plansArray.length > 0
      ? plansArray[finalPlanIndex]
      : planIdToUse
      ? plansArray.find((p: IPlan) => p.id === planIdToUse) || null
      : null;

  // Get plan details with dynamic features from database - memoize to prevent unnecessary re-renders
  const planDetails = useMemo(() => {
    const plans = plansResponse?.data || [];
    return plans.map((plan: IPlan) => {
      const trialDays = plan.trialDays ?? 7;
      const durationText =
        trialDays > 0
          ? `${trialDays}-Day${trialDays !== 1 ? "s" : ""} Trial`
          : "No Trial";

      return {
        title: plan.name || "Plan",
        price: plan.price || "Free",
        description: plan.description || "Plan description",
        duration: durationText,
        trialDays: trialDays,
        features: formatPlanFeatures(plan.features),
      };
    });
  }, [plansResponse?.data]);

  // Get the selected plan with better fallback logic - memoize to prevent unnecessary re-renders
  const plan = useMemo(
    () => (finalPlanIndex !== null ? planDetails[finalPlanIndex] : null),
    [finalPlanIndex, planDetails]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: pendingOrgData?.organizationName || storeOrgName || "",
    },
  });

  // Use ref to track if we've already handled redirects to prevent infinite loops
  const hasHandledRedirect = useRef(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Reset redirect flag when key dependencies change
    if (finalPlanIndex !== null || planIdToUse) {
      hasHandledRedirect.current = false;
    }
  }, [finalPlanIndex, planIdToUse]);

  useEffect(() => {
    // Wait for plans to load
    if (plansLoading) {
      return;
    }

    // Check if we have a plan
    if (!selectedPlan && !planIdToUse) {
      // Prevent multiple redirects
      if (hasHandledRedirect.current) {
        return;
      }
      hasHandledRedirect.current = true;

      // If no plan, redirect back to pricing
      toast.info("Please select a plan first");
      navigate("/pricing", {
        state: {
          fromSignup: fromSignup,
          fromSignin: !fromSignup,
          pendingAccount: pendingPayment || fromSignup,
        },
        replace: true, // Use replace to prevent back button issues
      });
      return;
    }

    // Wait for user loading to complete before checking authentication
    if (userLoading) {
      return; // Still loading, wait
    }

    // If coming from signup, wait for user data to be available
    if (fromSignup) {
      // If user data is still loading or not available yet, wait
      if (!userData?.user) {
        // Give it a moment for session to establish after signup
        return;
      }
      // User is loaded, allow to proceed
      window.scrollTo(0, 0);
      hasCheckedAuth.current = true;
      return;
    }

    // Prevent multiple auth checks and redirects
    if (hasCheckedAuth.current) {
      return;
    }

    // If user is not authenticated after loading is complete, redirect to signup
    if (!userData?.user) {
      hasCheckedAuth.current = true;
      hasHandledRedirect.current = true;

      toast.info("Please sign up or login to complete your purchase");
      // Redirect to signup with plan information
      navigate("/auth/signup", {
        state: {
          selectedPlan: finalPlanIndex ?? storePlanIndex,
          redirectTo: "checkout",
          planDetails: plan,
        },
        replace: true, // Use replace to prevent back button issues
      });
      return;
    }

    // User is authenticated and plan is selected
    hasCheckedAuth.current = true;
    window.scrollTo(0, 0);
  }, [
    // Removed 'plan' and 'navigate' from dependencies as they cause unnecessary re-runs
    userData?.user?.id, // Only track user ID, not entire userData object
    userLoading,
    plansLoading,
    finalPlanIndex,
    selectedPlan?.id, // Only track plan ID, not entire plan object
    planIdToUse,
    fromSignup,
    pendingPayment,
    storePlanIndex,
    // Keep navigate for closure but it's stable
    navigate,
  ]);

  // DEMO MODE REMOVED - No need to check for demo mode in production
  // Check backend PayPal configuration on mount (simplified - no demo mode check)
  useEffect(() => {
    // Simply mark as not checking since demo mode is removed
    // Set immediately if we have the required data, don't wait
    if (selectedPlan && userData?.user) {
      setCheckingBackendMode(false);
      setIsBackendDemoMode(false); // Always false in production
    } else if (!userLoading && !plansLoading) {
      // If loading is complete but we don't have plan/user yet, still mark as not checking
      // This prevents indefinite waiting
      setCheckingBackendMode(false);
      setIsBackendDemoMode(false);
    }
  }, [selectedPlan, userData?.user, userLoading, plansLoading]);

  // Handle PayPal order creation
  const handlePayPalCreateOrder = async (): Promise<string> => {
    if (!selectedPlan) {
      const errorMsg = "Plan not selected";
      console.error("[PayPal] Error:", errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Validate organization name if creating organization
    if (createOrganization) {
      // Trigger form validation first
      const isValid = await form.trigger("organizationName");
      if (!isValid) {
        const errorMsg = "Please enter a valid organization name";
        console.error("[PayPal] Error:", errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const formData = form.getValues();
      if (
        !formData.organizationName ||
        formData.organizationName.trim() === ""
      ) {
        const errorMsg = "Please enter an organization name";
        console.error("[PayPal] Error:", errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    try {
      const planPrice = parseFloat(
        selectedPlan.price.toString().replace("$", "")
      );

      console.log("[PayPal] Creating order:", {
        planId: selectedPlan.id,
        amount: planPrice,
        currency: "USD",
      });

      const response = await createPayPalOrderMutation.mutateAsync({
        planId: selectedPlan.id,
        amount: planPrice,
        currency: "USD",
      });

      console.log("[PayPal] Order created:", response.data);

      // DEMO MODE REMOVED - Only real PayPal orders in production
      // If we get a PayPal order ID, return it
      if (response.data?.orderId) {
        return response.data.orderId;
      }

      const errorMsg = "Failed to create PayPal order - no order ID returned";
      console.error("[PayPal] Error:", errorMsg, response);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    } catch (error: any) {
      console.error("[PayPal] Error creating order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create PayPal order. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Handle PayPal order approval
  const handlePayPalApprove = async (data: { orderID: string }) => {
    if (!userData?.user || !selectedPlan) {
      toast.error("User or plan information is missing");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = form.getValues();

      // Capture the PayPal order with organization details
      // This will create the organization automatically after successful payment
      const captureResponse = await capturePayPalOrderMutation.mutateAsync({
        orderId: data.orderID,
        userId: userData.user.id,
        organizationName: createOrganization
          ? formData.organizationName
          : undefined,
        planId: selectedPlan.id,
      });

      if (captureResponse.data?.status === "COMPLETED") {
        toast.success("Payment processed successfully!");

        // If organization was created, it's already done in the backend
        if (captureResponse.data?.organization) {
          toast.success("Organization created successfully!");
        }

        // Reload page to refresh session with updated organizationId
        // This ensures the session is updated with the new organization data
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        toast.error("Payment was not completed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error capturing PayPal order:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to process payment. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PayPal errors
  const handlePayPalError = (error: any) => {
    console.error("[PayPal] SDK Error:", error);
    console.error("[PayPal] Error details:", JSON.stringify(error, null, 2));

    // DEMO MODE REMOVED - Handle PayPal errors normally
    // Check if error is related to invalid resource (order not found, etc.)
    if (
      error?.err === "INVALID_RESOURCE_ID" ||
      error?.message?.includes("INVALID_RESOURCE_ID")
    ) {
      const errorMessage =
        "PayPal order not found or invalid. Please try again or contact support.";
      toast.error(errorMessage);
      setIsProcessing(false);
      return;
    }

    // Provide more specific error messages
    let errorMessage = "An error occurred with PayPal. Please try again.";

    if (error?.message) {
      errorMessage = `PayPal Error: ${error.message}`;
    } else if (typeof error === "string") {
      errorMessage = `PayPal Error: ${error}`;
    } else if (error?.err) {
      errorMessage = `PayPal Error: ${error.err}`;
    }

    toast.error(errorMessage);
    setIsProcessing(false);
  };

  // DEMO PAYMENT COMMENTED OUT FOR PRODUCTION - Only real payments allowed
  // Handle demo payment
  // const handleDemoPayment = async () => {
  //   if (!selectedPlan || !userData?.user) {
  //     toast.error("Missing plan or user information");
  //     return;
  //   }

  //   setIsProcessing(true);
  //   try {
  //     // Validate organization name if needed
  //     if (createOrganization) {
  //       const isValid = await form.trigger("organizationName");
  //       if (!isValid) {
  //         toast.error("Please enter a valid organization name");
  //         setIsProcessing(false);
  //         return;
  //       }
  //     }

  //     // Create demo order - force demo mode
  //     const planPrice = parseFloat(
  //       selectedPlan.price.toString().replace("$", "")
  //     );

  //     const orderResponse = await createPayPalOrderMutation.mutateAsync({
  //       planId: selectedPlan.id,
  //       amount: planPrice,
  //       currency: "USD",
  //       // demoMode: true, // Force demo mode for demo payment button
  //     });

  //     if (orderResponse.data?.orderId) {
  //       // Mark backend demo mode if we get a demo order
  //       if (orderResponse.data.orderId.startsWith("demo_order_")) {
  //         setIsBackendDemoMode(true);
  //       }

  //       // Process demo order directly (bypass PayPal SDK)
  //       const formData = form.getValues();

  //       // Ensure organization name is provided if creating organization
  //       const orgName = createOrganization
  //         ? formData.organizationName?.trim()
  //         : undefined;

  //       if (createOrganization && (!orgName || orgName === "")) {
  //         toast.error("Please enter an organization name");
  //         setIsProcessing(false);
  //         return;
  //       }

  //       console.log("[Demo Payment] Capturing order:", {
  //         orderId: orderResponse.data.orderId,
  //         userId: userData.user.id,
  //         organizationName: orgName,
  //         planId: selectedPlan.id,
  //         createOrganization,
  //       });

  //       const captureResponse = await capturePayPalOrderMutation.mutateAsync({
  //         orderId: orderResponse.data.orderId,
  //         userId: userData.user.id,
  //         organizationName: orgName,
  //         planId: selectedPlan.id,
  //       });

  //       console.log("[Demo Payment] Capture response:", captureResponse);

  //       if (captureResponse.data?.status === "COMPLETED") {
  //         toast.success("Demo payment processed successfully!");
  //         if (createOrganization && captureResponse.data?.organization) {
  //           toast.success("Organization created successfully!");
  //         }
  //         // Reload page to refresh session with updated organizationId
  //         setTimeout(() => {
  //           window.location.href = "/dashboard";
  //         }, 1500);
  //       } else {
  //         console.error(
  //           "[Demo Payment] Payment not completed:",
  //           captureResponse
  //         );
  //         toast.error(
  //           captureResponse?.message ||
  //             "Payment was not completed. Please try again."
  //         );
  //       }
  //     } else {
  //       console.error("[Demo Payment] No order ID returned:", orderResponse);
  //       toast.error("Failed to create order. Please try again.");
  //     }
  //   } catch (error: any) {
  //     console.error("Demo payment error:", error);
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.message ||
  //         "Failed to process demo payment"
  //     );
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // Format price for display
  const formatPrice = (price: string | number | undefined): string => {
    if (!price || price === "Free") return "Free";
    const priceStr = price.toString();
    if (priceStr.startsWith("$")) return priceStr;
    return `$${priceStr}`;
  };

  if (!selectedPlan || (userLoading && !fromSignup)) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {userLoading ? "Checking authentication..." : "Loading plan..."}
          </p>
        </div>
      </Box>
    );
  }

  // Get PayPal client ID from environment
  // Note: Vite requires VITE_ prefix for environment variables to be exposed to client
  // For live payments: Use your live PayPal Client ID from PayPal Developer Dashboard
  // The PayPal SDK automatically detects live vs sandbox based on the client ID format
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalMode = import.meta.env.VITE_PAYPAL_MODE || "live"; // Default to live for production
  const isFrontendPayPalConfigured =
    typeof paypalClientId === "string" && paypalClientId.trim().length > 0;

  // Debug log to verify PayPal env loading (shows only length for safety)
  console.log("[PayPal Config Check]", {
    hasClientId: isFrontendPayPalConfigured,
    clientIdLength: paypalClientId?.length || 0,
    paypalMode: paypalMode,
    // Check if client ID looks like sandbox (sandbox IDs often start with specific patterns)
    isLikelySandbox:
      paypalClientId?.startsWith("sb-") || paypalClientId?.includes("sandbox"),
  });

  // Check if backend is in demo mode (extract to avoid type narrowing issues)
  const isBackendInDemoMode = isBackendDemoMode === true;

  // PayPal is only fully configured if both frontend AND backend have credentials
  // If backend is in demo mode, we should hide PayPal buttons and show demo button
  // Also show demo button while checking backend mode
  const isPayPalFullyConfigured =
    !checkingBackendMode && isFrontendPayPalConfigured && !isBackendInDemoMode;

  // Only load PayPal SDK if PayPal is fully configured
  // This prevents the popup from appearing when PayPal is not set up
  const shouldLoadPayPalSDK = isPayPalFullyConfigured;

  // IMPORTANT: Never use "sb" placeholder as it forces sandbox mode!
  // Only initialize PayPal SDK with the actual client ID when ready
  // This prevents sandbox mode from being cached on first load
  const paypalOptions =
    shouldLoadPayPalSDK && paypalClientId
      ? {
          clientId: paypalClientId,
          currency: "USD",
          disableFunding: "credit,card" as const,
        }
      : { clientId: "", currency: "USD" as const }; // Use empty string, not "sb" to avoid sandbox detection

  return (
    <PayPalScriptProvider
      options={paypalOptions}
      deferLoading={!shouldLoadPayPalSDK || !paypalClientId} // Don't load SDK until we have real client ID
      key={`paypal-${paypalClientId || "disabled"}-${shouldLoadPayPalSDK}`} // Force re-initialization when client ID or config changes
    >
      <Box className="min-h-screen bg-gray-50 max-md:p-4">
        <Navbar />

        {/* Trial Expired Message Banner */}
        {subscriptionStatus?.data?.trialExpired && (
          <Box className="max-w-5xl mx-auto mt-4 mb-4">
            <Flex className="items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <AlertCircle
                className="text-orange-600 flex-shrink-0"
                size={24}
              />
              <Box className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  Trial Period Ended
                </h3>
                <p className="text-orange-700 text-sm mt-1">
                  Your trial period has ended. Please purchase a subscription to
                  continue using our services.
                </p>
              </Box>
            </Flex>
          </Box>
        )}

        <Form {...form}>
          <Flex className="max-w-5xl mx-auto mt-3 items-start max-md:items-center flex-col md:flex-row gap-6">
            {/* Left: Plan Info */}
            <Box className="max-md:w-full flex-1 bg-gradient-to-r from-indigo-100 to-red-50 rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold mb-2">
                {plan?.title || selectedPlan?.name || "Plan Details"}
              </h2>
              <p className="text-lg mb-1">
                {formatPrice(plan?.price || selectedPlan?.price)} /{" "}
                {plan?.duration || "Trial"}
              </p>
              <p className="mb-4">
                {plan?.description ||
                  selectedPlan?.description ||
                  "Plan description not available"}
              </p>

              {plan?.features && plan.features.length > 0 ? (
                <>
                  <h3 className="font-semibold mb-2">Included Services:</h3>
                  <ul className="mb-4 list-disc pl-5">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="text-sm">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Box className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-700 text-sm">
                    Features not available for this plan
                  </p>
                </Box>
              )}

              {/* User Info Display */}
              {userData?.user && (
                <Box className="mt-4 p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2">Purchasing for:</h4>
                  <p className="text-sm text-gray-600">{userData.user.name}</p>
                  <p className="text-sm text-gray-600">{userData.user.email}</p>
                </Box>
              )}
            </Box>

            {/* Right: Organization & Payment Details */}
            <Box className="h-auto bg-gradient-to-r from-red-50 to-indigo-100 rounded-lg shadow p-8 w-full md:w-1/2">
              {createOrganization && (
                <>
                  <h2 className="text-xl font-semibold mb-4 font-Outfit">
                    Organization Details
                  </h2>
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="font-normal">
                          Organization Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border rounded-lg p-2 w-full bg-white h-12"
                            placeholder="Enter your organization name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <h3 className="font-semibold mb-4">Payment Method</h3>

              {/* DEMO PAYMENT COMMENTED OUT FOR PRODUCTION - Only real PayPal payments allowed */}
              {/* Show demo button if PayPal is not fully configured OR backend is in demo mode OR still checking */}
              {/* {checkingBackendMode ||
              !isPayPalFullyConfigured ||
              isBackendInDemoMode ? (
                <>
                  {/* Demo Payment Button - for testing without PayPal SDK */}
              {/* <Box className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800 mb-2">
                      Demo Payment Mode
                    </p>
                    <p className="text-green-700 text-sm mb-3">
                      {checkingBackendMode
                        ? "Checking PayPal configuration..."
                        : isBackendInDemoMode
                        ? "PayPal is not configured on the server. Use the demo payment button to test the complete flow."
                        : "PayPal is not fully configured. Use the demo payment button to test the complete payment and organization creation flow."}
                    </p>
                    <Button
                      onClick={handleDemoPayment}
                      disabled={
                        isProcessing || !selectedPlan || checkingBackendMode
                      }
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 cursor-pointer"
                    >
                      {checkingBackendMode
                        ? "Checking Configuration..."
                        : isProcessing
                        ? "Processing Demo Payment..."
                        : "Complete Demo Payment"}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This simulates a successful payment and creates your
                      organization
                    </p>
                  </Box> */}

              {/* Configuration Instructions - Show error if PayPal not configured */}
              {!isPayPalFullyConfigured && (
                <Box className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-semibold text-yellow-800 mb-2">
                    PayPal Not Configured
                  </p>
                  <p className="text-yellow-700 text-sm mb-3">
                    To enable real PayPal payments, please configure PayPal
                    credentials.
                  </p>
                  <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                    <p className="font-semibold mb-1">Steps to configure:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>
                        Go to{" "}
                        <a
                          href="https://developer.paypal.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          PayPal Developer Dashboard
                        </a>
                      </li>
                      <li>
                        Create a <strong>LIVE</strong> app (not sandbox) to get
                        your Client ID and Secret
                      </li>
                      <li>
                        Frontend: Add{" "}
                        <code className="bg-yellow-200 px-1 rounded">
                          VITE_PAYPAL_CLIENT_ID=your_live_client_id
                        </code>{" "}
                        and{" "}
                        <code className="bg-yellow-200 px-1 rounded">
                          VITE_PAYPAL_MODE=live
                        </code>{" "}
                        to your .env file
                      </li>
                      <li>
                        Backend: Add{" "}
                        <code className="bg-yellow-200 px-1 rounded">
                          PAYPAL_CLIENT_ID=your_live_client_id
                        </code>
                        ,{" "}
                        <code className="bg-yellow-200 px-1 rounded">
                          PAYPAL_CLIENT_SECRET=your_live_secret
                        </code>
                        , and{" "}
                        <code className="bg-yellow-200 px-1 rounded">
                          PAYPAL_MODE=live
                        </code>{" "}
                        to your backend .env file
                      </li>
                      <li>Restart both frontend and backend servers</li>
                    </ol>
                  </div>
                </Box>
              )}
              {/* </> */}
              {/* ) : null} */}
              {/* DEMO MODE REMOVED - Only show PayPal buttons when configured */}
              {isPayPalFullyConfigured && shouldLoadPayPalSDK && (
                <>
                  {/* Warning if sandbox mode detected but should be live */}
                  {(paypalMode !== "live" ||
                    paypalClientId?.startsWith("sb-") ||
                    paypalClientId?.includes("sandbox")) && (
                    <Box className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-semibold text-red-800 mb-2">
                        ⚠️ Sandbox Mode Detected
                      </p>
                      <p className="text-red-700 text-sm mb-2">
                        Your PayPal is configured in sandbox mode. For real
                        payments, you need:
                      </p>
                      <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                        <li>
                          A <strong>LIVE</strong> PayPal Client ID (not sandbox)
                        </li>
                        <li>
                          Frontend: <code>VITE_PAYPAL_MODE=live</code> in .env
                        </li>
                        <li>
                          Backend: <code>PAYPAL_MODE=live</code> in .env
                        </li>
                      </ul>
                    </Box>
                  )}
                  {/* PayPal Buttons - Only show when fully configured */}
                  <Box className="mb-4 bg-white rounded-lg p-4 border border-gray-200">
                    <PayPalButtons
                      createOrder={handlePayPalCreateOrder}
                      onApprove={handlePayPalApprove}
                      onError={handlePayPalError}
                      onCancel={() => {
                        toast.info("Payment cancelled");
                        setIsProcessing(false);
                      }}
                      disabled={isProcessing}
                      style={{
                        layout: "vertical",
                        color: "blue",
                        shape: "rect",
                        label: "paypal",
                      }}
                    />
                  </Box>

                  {/* PayPal Info Box for Sandbox */}
                  {/* <Box className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                    <p className="font-semibold text-blue-800 mb-1">
                      PayPal Sandbox Mode
                    </p>
                    <p className="text-blue-700">
                      Use PayPal sandbox test accounts to complete the purchase.
                      No real money will be charged.
                    </p>
                  </Box> */}
                </>
              )}

              <div className="text-xs text-gray-500 mt-4">
                By completing your purchase, you agree to the company's Terms of
                Service
              </div>
            </Box>
          </Flex>
        </Form>
      </Box>
    </PayPalScriptProvider>
  );
};

export default CheckoutPage;
