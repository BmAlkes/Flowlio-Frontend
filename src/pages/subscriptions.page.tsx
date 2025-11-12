import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { toast } from "sonner";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ComponentWrapper } from "@/components/common/componentwrapper";
import { useSubscriptionStatus } from "@/hooks/usesubscription";
import { useAvailablePlans } from "@/hooks/useavailableplans";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  UserX,
  Calendar,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const SubscriptionsPage = () => {
  const navigate = useNavigate();

  const {
    data: subscriptionData,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useSubscriptionStatus();

  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useAvailablePlans();

  // const updatePlanMutation = useUpdateSubscriptionPlan();

  useEffect(() => {
    if (subscriptionError) {
      toast.error("Failed to load subscription status");
    }
    if (plansError) {
      toast.error("Failed to load available plans");
    }
  }, [subscriptionError, plansError]);

  if (subscriptionLoading || plansLoading) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </Box>
    );
  }

  const subscriptionStatus = subscriptionData?.data;
  const availablePlans = plansData?.data || [];

  // Helper function to calculate trial days remaining
  const getTrialDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle plan selection
  // const handlePlanUpdate = async (planId: string) => {
  //   try {
  //     await updatePlanMutation.mutateAsync({ planId });
  //   } catch (error) {
  //     console.error("Failed to update plan:", error);
  //   }
  // };

  // Handle refresh
  const handleRefresh = () => {
    refetchSubscription();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      case "no_subscription":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            No Subscription
          </Badge>
        );
      case "not_authenticated":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <UserX className="h-3 w-3" />
            Not Logged In
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <ComponentWrapper className="bg-gray-50 p-8 mt-5">
      <Center className="flex-col max-md:pb-10">
        <Stack className="text-center justify-center items-center px-4 max-sm:mt-5">
          <Flex className="text-center text-black font-[100] max-w-2xl max-sm:w-full text-4xl max-sm:text-3xl">
            My
            <Box className="text-[#F98618] font-semibold"> Subscriptions</Box>
          </Flex>

          <Box className="w-lg max-sm:w-full font-[200] text-black text-[15px]">
            Manage your active subscriptions and billing information.
          </Box>
        </Stack>

        {/* Current Subscription Status */}
        {subscriptionStatus && (
          <Box className="mt-8 p-6 bg-white rounded-lg shadow max-w-2xl w-full">
            <Flex className="justify-between items-center mb-4">
              <Box className="text-xl font-semibold">Current Status</Box>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={subscriptionLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    subscriptionLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </Flex>

            <Flex className="justify-between items-center mb-4">
              <Box>
                <Box className="text-sm text-gray-600">Subscription Status</Box>
                <Box className="font-semibold">
                  {subscriptionStatus.message}
                </Box>
              </Box>
              {getStatusBadge(subscriptionStatus.status)}
            </Flex>

            {subscriptionStatus.subscription && (
              <Box className="space-y-3">
                <Flex className="justify-between">
                  <Box className="text-sm text-gray-600 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Plan:
                  </Box>
                  <Box className="font-semibold">
                    {subscriptionStatus.plan?.name || "Unknown Plan"}
                  </Box>
                </Flex>
                <Flex className="justify-between">
                  <Box className="text-sm text-gray-600">Status:</Box>
                  <Box className="font-semibold capitalize">
                    {subscriptionStatus.subscription.status}
                  </Box>
                </Flex>
                {subscriptionStatus.subscription.currentPeriodEnd && (
                  <>
                    <Flex className="justify-between">
                      <Box className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Trial Ends:
                      </Box>
                      <Box className="font-semibold">
                        {formatDate(
                          subscriptionStatus.subscription.currentPeriodEnd
                        )}
                      </Box>
                    </Flex>
                    {subscriptionStatus.subscription.isTrial && (
                      <Box className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Box className="text-blue-800 font-medium mb-1">
                          🎉 Free Trial Active
                        </Box>
                        <Box className="text-blue-700 text-sm">
                          {subscriptionStatus.subscription.trialDaysRemaining ||
                            getTrialDaysRemaining(
                              subscriptionStatus.subscription.currentPeriodEnd
                            )}{" "}
                          days remaining
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            {subscriptionStatus.requiresSubscription && (
              <Box className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Box className="text-yellow-800 font-medium mb-2">
                  Subscription Required
                </Box>
                <Box className="text-yellow-700 text-sm mb-3">
                  You need an active subscription to access all features.
                </Box>
                <Button
                  onClick={() => navigate("/pricing")}
                  className="bg-[#1797B9] text-white rounded-full hover:bg-[#1797B9]/80"
                >
                  Browse Plans
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Available Plans */}
        {/* {availablePlans.length > 0 && (
          <Box className="mt-8 max-w-4xl w-full">
            <Box className="text-xl font-semibold mb-4 text-center">
              Available Plans
            </Box>
            <Stack className="gap-4">
              {availablePlans.map((plan) => (
                <Box key={plan.id} className="bg-white rounded-lg shadow p-6">
                  <Flex className="justify-between items-start mb-4">
                    <Box>
                      <Box className="text-xl font-semibold mb-1">
                        {plan.name}
                      </Box>
                      <Box className="text-sm text-gray-600">
                        {plan.description}
                      </Box>
                    </Box>
                    <Box className="text-right">
                      <Box className="text-2xl font-bold">${plan.price}</Box>
                      <Box className="text-sm text-gray-600">
                        per {plan.interval}
                      </Box>
                    </Box>
                  </Flex>

                  {plan.features && plan.features.length > 0 && (
                    <Box className="mb-4">
                      <Box className="text-sm font-medium mb-2">Features:</Box>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-center gap-2"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}

                  <Flex className="gap-2">
                    <Button
                      onClick={() => handlePlanUpdate(plan.id)}
                      className="flex-1 bg-[#1797B9] text-white rounded-full hover:bg-[#1797B9]/80"
                      disabled={updatePlanMutation.isPending}
                    >
                      {updatePlanMutation.isPending
                        ? "Updating..."
                        : "Choose Plan"}
                    </Button>
                    <Button
                      onClick={() => navigate(`/checkout?plan=${plan.id}`)}
                      variant="outline"
                      className="flex-1 rounded-full"
                    >
                      Checkout
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Box>
        )} */}

        {availablePlans.length === 0 &&
          !subscriptionStatus?.hasSubscription && (
            <Box className="mt-8 p-8 bg-white rounded-lg shadow text-center">
              <Box className="text-xl font-semibold mb-2">
                No Plans Available
              </Box>
              <Box className="text-gray-600 mb-4">
                There are currently no subscription plans available.
              </Box>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-[#1797B9] text-white rounded-full hover:bg-[#1797B9]/80"
              >
                Back to Dashboard
              </Button>
            </Box>
          )}
      </Center>
    </ComponentWrapper>
  );
};

export default SubscriptionsPage;
