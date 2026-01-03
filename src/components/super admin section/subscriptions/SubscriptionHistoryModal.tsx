import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { format } from "date-fns";
import { useFetchSubscriptionHistory } from "@/hooks/usefetchsubscriptionhistory";
import { Loader2 } from "lucide-react";

interface SubscriptionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  companyName: string;
}

export const SubscriptionHistoryModal = ({
  open,
  onOpenChange,
  organizationId,
  companyName,
}: SubscriptionHistoryModalProps) => {
  const { data, isLoading, error } = useFetchSubscriptionHistory(
    organizationId,
    open
  );

  const subscriptionHistory = data?.data?.subscriptions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Subscription History</DialogTitle>
          <DialogDescription className="text-base">
            Complete subscription history for <strong>{companyName}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <Flex className="items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#1797B9]" />
            <Box className="ml-3 text-gray-600">
              Loading subscription history...
            </Box>
          </Flex>
        )}

        {error && (
          <Box className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">
              Failed to load subscription history. Please try again.
            </p>
          </Box>
        )}

        {!isLoading && !error && subscriptionHistory.length === 0 && (
          <Box className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
            <p className="text-gray-600">No subscription history found.</p>
          </Box>
        )}

        {!isLoading && !error && subscriptionHistory.length > 0 && (
          <Stack className="gap-4 mt-4">
            <Box className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Flex className="justify-between items-center">
                <Box>
                  <p className="text-sm text-blue-900 font-medium">
                    Total Subscriptions: {data?.data?.totalSubscriptions || 0}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Active: {data?.data?.activeSubscriptions || 0}
                  </p>
                </Box>
              </Flex>
            </Box>

            <Stack className="gap-3">
              {subscriptionHistory.map((subscription: any, index: number) => {
                const isActive = subscription.status === "active";
                const isTrial =
                  subscription.trialStart && subscription.trialEnd;
                const renewalCount = subscription.renewalCount || 0;

                return (
                  <Box
                    key={subscription.id}
                    className={`p-4 border rounded-lg ${
                      isActive
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Flex className="justify-between items-start mb-3">
                      <Box>
                        <Flex className="items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {subscription.planName}
                          </h3>
                          {isActive && (
                            <Box className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Active
                            </Box>
                          )}
                          {isTrial && (
                            <Box className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Trial
                            </Box>
                          )}
                        </Flex>
                        <p className="text-sm text-gray-600">
                          ${subscription.planPrice}{" "}
                          {subscription.planCurrency || "USD"}
                          {subscription.plan?.billingCycle && (
                            <span className="ml-1">
                              / {subscription.plan.billingCycle}
                            </span>
                          )}
                        </p>
                      </Box>
                      <Box className="text-right">
                        <p className="text-xs text-gray-500">
                          Subscription #{index + 1}
                        </p>
                        {renewalCount > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Renewed {renewalCount} time
                            {renewalCount > 1 ? "s" : ""}
                          </p>
                        )}
                      </Box>
                    </Flex>

                    <Stack className="gap-2 mt-3">
                      <Flex className="justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-medium ${
                            isActive ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          {subscription.status.charAt(0).toUpperCase() +
                            subscription.status.slice(1)}
                        </span>
                      </Flex>

                      {subscription.currentPeriodStart && (
                        <Flex className="justify-between text-sm">
                          <span className="text-gray-600">Period Start:</span>
                          <span className="text-gray-900">
                            {format(
                              new Date(subscription.currentPeriodStart),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </Flex>
                      )}

                      {subscription.currentPeriodEnd && (
                        <Flex className="justify-between text-sm">
                          <span className="text-gray-600">Period End:</span>
                          <span className="text-gray-900">
                            {format(
                              new Date(subscription.currentPeriodEnd),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </Flex>
                      )}

                      {isTrial &&
                        subscription.trialStart &&
                        subscription.trialEnd && (
                          <>
                            <Flex className="justify-between text-sm">
                              <span className="text-gray-600">
                                Trial Start:
                              </span>
                              <span className="text-gray-900">
                                {format(
                                  new Date(subscription.trialStart),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </Flex>
                            <Flex className="justify-between text-sm">
                              <span className="text-gray-600">Trial End:</span>
                              <span className="text-gray-900">
                                {format(
                                  new Date(subscription.trialEnd),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </Flex>
                          </>
                        )}

                      {subscription.cancelAtPeriodEnd && (
                        <Flex className="justify-between text-sm">
                          <span className="text-gray-600">Cancellation:</span>
                          <span className="text-orange-600 font-medium">
                            Scheduled for period end
                          </span>
                        </Flex>
                      )}

                      {subscription.cancelledAt && (
                        <Flex className="justify-between text-sm">
                          <span className="text-gray-600">Cancelled On:</span>
                          <span className="text-gray-900">
                            {format(
                              new Date(subscription.cancelledAt),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </Flex>
                      )}

                      {subscription.lastRenewedAt && (
                        <Flex className="justify-between text-sm">
                          <span className="text-gray-600">Last Renewed:</span>
                          <span className="text-blue-600 font-medium">
                            {format(
                              new Date(subscription.lastRenewedAt),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </Flex>
                      )}

                      {subscription.createdAt && (
                        <Flex className="justify-between text-sm">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-500">
                            {format(
                              new Date(subscription.createdAt),
                              "MMM d, yyyy"
                            )}
                          </span>
                        </Flex>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        )}

        <Flex className="justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Close
          </Button>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
