import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Box } from "@/components/ui/box";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Check,
  X,
} from "lucide-react";
import { useAuditSubscriptions } from "@/hooks/useauditsubscriptions";
import { useReactivateSubscription } from "@/hooks/usereactivatesubscription";
import { useDeactivateSubscription } from "@/hooks/usedeactivatesubscription";
import { useEffect, useState } from "react";

interface SubscriptionAuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionAuditModal = ({
  open,
  onOpenChange,
}: SubscriptionAuditModalProps) => {
  const {
    mutate: runAudit,
    data,
    isPending,
    isSuccess,
    isError,
    error,
  } = useAuditSubscriptions();

  const { mutate: reactivateSubscription, isPending: isReactivating } =
    useReactivateSubscription();
  const { mutate: deactivateSubscription, isPending: isDeactivating } =
    useDeactivateSubscription();

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<{
    subscriptionId: string;
    organizationName: string;
    action: "reactivate" | "deactivate";
  } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      runAudit();
    }
  }, [open, runAudit]);

  const handleAction = (
    subscriptionId: string,
    organizationName: string,
    action: "reactivate" | "deactivate"
  ) => {
    setSelectedSubscription({ subscriptionId, organizationName, action });
    setActionModalOpen(true);
  };

  const confirmAction = () => {
    if (!selectedSubscription) return;

    if (selectedSubscription.action === "reactivate") {
      reactivateSubscription(
        {
          subscriptionId: selectedSubscription.subscriptionId,
          data: {
            paymentCollected: true,
            paymentMethod: paymentMethod || "Manual",
            paymentAmount: paymentAmount || undefined,
            notes: notes || undefined,
          },
        },
        {
          onSuccess: () => {
            setActionModalOpen(false);
            setSelectedSubscription(null);
            setPaymentAmount("");
            setPaymentMethod("");
            setNotes("");
            // Refresh audit results
            runAudit();
          },
        }
      );
    } else {
      deactivateSubscription(
        {
          subscriptionId: selectedSubscription.subscriptionId,
          data: {
            reason: "Non-payment",
            notes: notes || undefined,
          },
        },
        {
          onSuccess: () => {
            setActionModalOpen(false);
            setSelectedSubscription(null);
            setNotes("");
            // Refresh audit results
            runAudit();
          },
        }
      );
    }
  };

  const auditData = data?.data;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Subscription Payment Audit
            </DialogTitle>
            <DialogDescription>
              Checking for subscriptions that were renewed without payment
            </DialogDescription>
          </DialogHeader>

          {isPending && (
            <Box className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Running audit...</p>
            </Box>
          )}

          {isError && (
            <Box className="py-6">
              <Stack className="gap-4 items-center">
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-red-500 font-medium">
                  Failed to run audit: {error?.message || "Unknown error"}
                </p>
                <Button onClick={() => runAudit()} variant="outline">
                  Retry
                </Button>
              </Stack>
            </Box>
          )}

          {isSuccess && auditData && (
            <Box className="py-4">
              {/* Summary Cards */}
              <Stack className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Stack className="gap-2">
                    <p className="text-sm text-blue-600 font-medium">
                      Total Checked
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {auditData.totalChecked}
                    </p>
                  </Stack>
                </Box>

                <Box className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Stack className="gap-2">
                    <p className="text-sm text-orange-600 font-medium">
                      Found Without Payment
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {auditData.foundWithoutPayment}
                    </p>
                  </Stack>
                </Box>

                <Box className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Stack className="gap-2">
                    <p className="text-sm text-green-600 font-medium">Fixed</p>
                    <p className="text-2xl font-bold text-green-900">
                      {auditData.fixed}
                    </p>
                  </Stack>
                </Box>
              </Stack>

              {/* Results Message */}
              {auditData.foundWithoutPayment === 0 ? (
                <Box className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <Stack className="flex-row items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <p className="text-green-800 font-medium">
                      All subscriptions have valid payment records. No issues
                      found!
                    </p>
                  </Stack>
                </Box>
              ) : (
                <Box className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <Stack className="flex-row items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                    <p className="text-orange-800 font-medium">
                      Found {auditData.foundWithoutPayment} subscription(s) that
                      were renewed without payment. All have been marked as
                      past_due.
                    </p>
                  </Stack>
                </Box>
              )}

              {/* Affected Subscriptions List */}
              {auditData.report && auditData.report.length > 0 && (
                <Box>
                  <h3 className="text-lg font-semibold mb-4">
                    Affected Subscriptions
                  </h3>
                  <Box className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Company Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Plan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Issue
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {auditData.report.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              {item.organizationName}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.planName}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.planPrice}
                            </td>
                            <td className="px-4 py-3 text-sm text-orange-600">
                              {item.issue}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Stack className="flex-row gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAction(
                                      item.subscriptionId,
                                      item.organizationName,
                                      "reactivate"
                                    )
                                  }
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Reactivate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAction(
                                      item.subscriptionId,
                                      item.organizationName,
                                      "deactivate"
                                    )
                                  }
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Deactivate
                                </Button>
                              </Stack>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              )}

              {/* Errors */}
              {auditData.errors && auditData.errors.length > 0 && (
                <Box className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">
                    Errors ({auditData.errors.length})
                  </h3>
                  <Box className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <Stack className="gap-2">
                      {auditData.errors.map((err: any, index: number) => (
                        <p key={index} className="text-sm text-red-800">
                          {err.subscriptionId || "Unknown"}: {err.error}
                        </p>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )}

              <Box className="mt-6 flex justify-end">
                <Button onClick={() => onOpenChange(false)}>Close</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedSubscription?.action === "reactivate"
                ? "Reactivate Subscription"
                : "Deactivate Subscription"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription?.action === "reactivate"
                ? `Reactivate subscription for "${selectedSubscription.organizationName}" after collecting payment.`
                : `Deactivate subscription for "${selectedSubscription?.organizationName}" due to non-payment.`}
            </DialogDescription>
          </DialogHeader>

          <Box className="py-4">
            {selectedSubscription?.action === "reactivate" ? (
              <Stack className="gap-4">
                <Box>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Payment Amount (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., $99.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </Box>
                <Box>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Payment Method (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., PayPal, Bank Transfer, Cash"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </Box>
                <Box>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes about this payment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </Box>
              </Stack>
            ) : (
              <Stack className="gap-4">
                <Box>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Reason
                  </label>
                  <Input
                    type="text"
                    value="Non-payment"
                    disabled
                    className="bg-gray-50"
                  />
                </Box>
                <Box>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes about deactivation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </Box>
              </Stack>
            )}

            <Stack className="flex-row gap-2 mt-6 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setActionModalOpen(false);
                  setSelectedSubscription(null);
                  setPaymentAmount("");
                  setPaymentMethod("");
                  setNotes("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={isReactivating || isDeactivating}
                className={
                  selectedSubscription?.action === "reactivate"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {(isReactivating || isDeactivating) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {selectedSubscription?.action === "reactivate"
                  ? "Reactivate"
                  : "Deactivate"}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
