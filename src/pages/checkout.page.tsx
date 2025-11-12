import { useLocation, useNavigate } from "react-router";
import { Box } from "@/components/ui/box";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  useCreatePayPalOrder,
  useCapturePayPalOrder,
} from "@/hooks/usePayPalPayment";

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
  const { data: plansResponse } = useFetchPublicPlans();
  const createPayPalOrderMutation = useCreatePayPalOrder();
  const capturePayPalOrderMutation = useCapturePayPalOrder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackendDemoMode, setIsBackendDemoMode] = useState<boolean | null>(
    null
  );
  const [checkingBackendMode, setCheckingBackendMode] = useState(true);

  const selectedPlanIndex = location.state?.selectedPlan ?? null;
  const createOrganization = location.state?.createOrganization;

  // Fallback: check URL parameters if navigation state is lost
  const urlParams = new URLSearchParams(location.search);
  const fallbackPlanIndex = urlParams.get("plan");
  const finalPlanIndex =
    selectedPlanIndex ??
    (fallbackPlanIndex ? parseInt(fallbackPlanIndex) : null);

  // Get plan details with dynamic features from database
  const planDetails = [
    {
      title: plansResponse?.data?.[0]?.name || "Basic Plan (Free)",
      price: plansResponse?.data?.[0]?.price || "Free",
      description:
        plansResponse?.data?.[0]?.description ||
        "Personal use and small projects",
      duration: "7-Days Trial",
      features: formatPlanFeatures(plansResponse?.data?.[0]?.features),
    },
    {
      title: plansResponse?.data?.[1]?.name || "Pro Plan",
      price: plansResponse?.data?.[1]?.price || "$29",
      description:
        plansResponse?.data?.[1]?.description ||
        "Professional teams and growing businesses",
      duration: "month",
      features: formatPlanFeatures(plansResponse?.data?.[1]?.features),
    },
    {
      title: plansResponse?.data?.[2]?.name || "Enterprise Plan",
      price: plansResponse?.data?.[2]?.price || "$99",
      description:
        plansResponse?.data?.[2]?.description ||
        "Large organizations with complex needs",
      duration: "6 months",
      features: formatPlanFeatures(plansResponse?.data?.[2]?.features),
    },
  ];

  // Get the selected plan with better fallback logic
  const plan = finalPlanIndex !== null ? planDetails[finalPlanIndex] : null;
  const selectedPlan = plansResponse?.data?.find(
    (_, index) => index === finalPlanIndex
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
    },
  });

  useEffect(() => {
    if (!plan) {
      // If no plan, redirect back to pricing
      navigate("/pricing");
      return;
    }

    // Wait for user loading to complete before checking authentication
    if (userLoading) {
      return; // Still loading, wait
    }

    // If user is not authenticated after loading is complete, redirect to signup
    if (!userData?.user) {
      toast.info("Please sign up or login to complete your purchase");
      // Redirect to signup with plan information
      navigate("/auth/signup", {
        state: {
          selectedPlan: finalPlanIndex,
          redirectTo: "checkout",
          planDetails: plan,
        },
      });
      return;
    }

    window.scrollTo(0, 0);
  }, [plan, navigate, userData, userLoading, finalPlanIndex]);

  // Check backend PayPal configuration on mount
  useEffect(() => {
    const checkBackendPayPalConfig = async () => {
      if (!selectedPlan || !userData?.user) {
        setCheckingBackendMode(false);
        return;
      }

      try {
        const planPrice = parseFloat(
          selectedPlan.price.toString().replace("$", "")
        );

        // Try to create an order to check if backend is in demo mode
        const response = await createPayPalOrderMutation.mutateAsync({
          planId: selectedPlan.id,
          amount: planPrice,
          currency: "USD",
        });

        // Check if backend returned a demo order
        if (
          response.data?.orderId &&
          response.data.orderId.startsWith("demo_order_")
        ) {
          setIsBackendDemoMode(true);
        } else {
          setIsBackendDemoMode(false);
        }
      } catch (error) {
        // If error, assume demo mode
        console.log(
          "[Checkout] Backend PayPal check failed, assuming demo mode",
          error
        );
        setIsBackendDemoMode(true);
      } finally {
        setCheckingBackendMode(false);
      }
    };

    if (selectedPlan && userData?.user && checkingBackendMode) {
      checkBackendPayPalConfig();
    }
  }, [selectedPlan, userData?.user]);

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

      // Check if backend is in demo mode (returns demo order IDs)
      if (
        response.data?.orderId &&
        response.data.orderId.startsWith("demo_order_")
      ) {
        console.log(
          "[PayPal] Demo order detected - Backend is in demo mode. PayPal SDK cannot process demo orders."
        );
        // Mark backend as demo mode
        setIsBackendDemoMode(true);
        // Don't return the demo order ID to PayPal SDK - it will cause an error
        // Instead, throw an error that will be caught and the user can use the demo button
        const errorMsg =
          "PayPal is not configured on the server. Please use the 'Complete Demo Payment' button below.";
        console.error("[PayPal] Error:", errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // If we get a real PayPal order ID, backend has PayPal configured
      if (response.data?.orderId) {
        setIsBackendDemoMode(false);
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

        // Redirect to dashboard after successful setup
        setTimeout(() => {
          navigate("/dashboard");
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

    // Check if error is related to demo orders
    if (
      error?.err === "INVALID_RESOURCE_ID" ||
      error?.message?.includes("INVALID_RESOURCE_ID")
    ) {
      const errorMessage =
        "Demo orders cannot be processed through PayPal. Please use the 'Complete Demo Payment' button instead.";
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

  // Format price for display
  const formatPrice = (price: string | number | undefined): string => {
    if (!price || price === "Free") return "Free";
    const priceStr = price.toString();
    if (priceStr.startsWith("$")) return priceStr;
    return `$${priceStr}`;
  };

  if (!plan || userLoading) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {userLoading ? "Checking authentication..." : "Loading..."}
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
  const isFrontendPayPalConfigured =
    paypalClientId && paypalClientId !== "" && paypalClientId !== "sandbox";

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

  return (
    <PayPalScriptProvider
      options={{
        clientId: shouldLoadPayPalSDK ? paypalClientId || "" : "sb", // Use 'sb' as minimal placeholder to prevent SDK errors
        currency: "USD",
        disableFunding: "credit,card", // Disable credit card option for simplicity
      }}
      deferLoading={!shouldLoadPayPalSDK} // Don't load SDK if not configured
    >
      <Box className="min-h-screen bg-gray-50 max-md:p-4">
        <Navbar />

        <Form {...form}>
          <Flex className="max-w-5xl mx-auto mt-3 items-start max-md:items-center flex-col md:flex-row gap-6">
            {/* Left: Plan Info */}
            <Box className="max-md:w-full flex-1 bg-gradient-to-r from-indigo-100 to-red-50 rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold mb-2">
                {plan?.title || "Plan Details"}
              </h2>
              <p className="text-lg mb-1">
                {formatPrice(plan?.price)} / {plan?.duration || "Trial"}
              </p>
              <p className="mb-4">
                {plan?.description || "Plan description not available"}
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
            <Box className="h-auto bg-gradient-to-r from-red-50 to-indigo-100 rounded-lg shadow p-8 w-full md:w-auto">
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

              {/* Show demo button if PayPal is not fully configured OR backend is in demo mode OR still checking */}
              {checkingBackendMode ||
              !isPayPalFullyConfigured ||
              isBackendInDemoMode ? (
                <>
                  {/* Demo Payment Button - for testing without PayPal SDK */}
                  <Box className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
                      onClick={async () => {
                        if (!selectedPlan || !userData?.user) {
                          toast.error("Missing plan or user information");
                          return;
                        }

                        setIsProcessing(true);
                        try {
                          // Validate organization name if needed
                          if (createOrganization) {
                            const isValid = await form.trigger(
                              "organizationName"
                            );
                            if (!isValid) {
                              toast.error(
                                "Please enter a valid organization name"
                              );
                              setIsProcessing(false);
                              return;
                            }
                          }

                          // Create demo order
                          const planPrice = parseFloat(
                            selectedPlan.price.toString().replace("$", "")
                          );

                          const orderResponse =
                            await createPayPalOrderMutation.mutateAsync({
                              planId: selectedPlan.id,
                              amount: planPrice,
                              currency: "USD",
                            });

                          if (orderResponse.data?.orderId) {
                            // Mark backend demo mode if we get a demo order
                            if (
                              orderResponse.data.orderId.startsWith(
                                "demo_order_"
                              )
                            ) {
                              setIsBackendDemoMode(true);
                            }

                            // Process demo order directly (bypass PayPal SDK)
                            const formData = form.getValues();

                            // Ensure organization name is provided if creating organization
                            const orgName = createOrganization
                              ? formData.organizationName?.trim()
                              : undefined;

                            if (
                              createOrganization &&
                              (!orgName || orgName === "")
                            ) {
                              toast.error("Please enter an organization name");
                              setIsProcessing(false);
                              return;
                            }

                            console.log("[Demo Payment] Capturing order:", {
                              orderId: orderResponse.data.orderId,
                              userId: userData.user.id,
                              organizationName: orgName,
                              planId: selectedPlan.id,
                              createOrganization,
                            });

                            const captureResponse =
                              await capturePayPalOrderMutation.mutateAsync({
                                orderId: orderResponse.data.orderId,
                                userId: userData.user.id,
                                organizationName: orgName,
                                planId: selectedPlan.id,
                              });

                            console.log(
                              "[Demo Payment] Capture response:",
                              captureResponse
                            );

                            if (captureResponse.data?.status === "COMPLETED") {
                              toast.success(
                                "Demo payment processed successfully!"
                              );
                              if (
                                createOrganization &&
                                captureResponse.data?.organization
                              ) {
                                toast.success(
                                  "Organization created successfully!"
                                );
                              }
                              setTimeout(() => {
                                navigate("/dashboard");
                              }, 1500);
                            } else {
                              console.error(
                                "[Demo Payment] Payment not completed:",
                                captureResponse
                              );
                              toast.error(
                                captureResponse?.message ||
                                  "Payment was not completed. Please try again."
                              );
                            }
                          } else {
                            console.error(
                              "[Demo Payment] No order ID returned:",
                              orderResponse
                            );
                            toast.error(
                              "Failed to create order. Please try again."
                            );
                          }
                        } catch (error: any) {
                          console.error("Demo payment error:", error);
                          toast.error(
                            error?.response?.data?.message ||
                              error?.message ||
                              "Failed to process demo payment"
                          );
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={
                        isProcessing || !selectedPlan || checkingBackendMode
                      }
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
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
                  </Box>

                  {/* Configuration Instructions */}
                  {!isFrontendPayPalConfigured && (
                    <Box className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-semibold text-yellow-800 mb-2">
                        PayPal Not Configured
                      </p>
                      <p className="text-yellow-700 text-sm mb-3">
                        To enable real PayPal payments, please configure PayPal
                        credentials.
                      </p>
                      <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                        <p className="font-semibold mb-1">
                          Steps to configure:
                        </p>
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
                            Create a sandbox app to get your Client ID and
                            Secret
                          </li>
                          <li>
                            Frontend: Add{" "}
                            <code className="bg-yellow-200 px-1 rounded">
                              VITE_PAYPAL_CLIENT_ID=your_client_id
                            </code>{" "}
                            to your .env file
                          </li>
                          <li>
                            Backend: Add{" "}
                            <code className="bg-yellow-200 px-1 rounded">
                              PAYPAL_CLIENT_ID=your_client_id
                            </code>{" "}
                            and{" "}
                            <code className="bg-yellow-200 px-1 rounded">
                              PAYPAL_CLIENT_SECRET=your_secret
                            </code>{" "}
                            to your backend .env file
                          </li>
                          <li>Restart both frontend and backend servers</li>
                        </ol>
                      </div>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  {/* PayPal Buttons - Only show when fully configured */}
                  {shouldLoadPayPalSDK && (
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
                  )}

                  {/* PayPal Info Box for Sandbox */}
                  <Box className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                    <p className="font-semibold text-blue-800 mb-1">
                      PayPal Sandbox Mode
                    </p>
                    <p className="text-blue-700">
                      Use PayPal sandbox test accounts to complete the purchase.
                      No real money will be charged.
                    </p>
                  </Box>
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
