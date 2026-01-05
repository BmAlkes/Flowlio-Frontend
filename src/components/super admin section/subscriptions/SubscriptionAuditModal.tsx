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
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useAuditSubscriptions } from "@/hooks/useauditsubscriptions";
import { useEffect } from "react";

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

  useEffect(() => {
    if (open) {
      runAudit();
    }
  }, [open, runAudit]);

  const auditData = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {auditData.report.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {item.organizationName}
                          </td>
                          <td className="px-4 py-3 text-sm">{item.planName}</td>
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
  );
};
