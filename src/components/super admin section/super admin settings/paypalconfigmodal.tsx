import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useCheckPayPalConfig } from "@/hooks/usecheckpaypalconfig";
import { useEffect } from "react";

interface PayPalConfigModalProps {
  onClose: () => void;
}

export const PayPalConfigModal = ({ onClose }: PayPalConfigModalProps) => {
  const { data, isLoading, refetch } = useCheckPayPalConfig(true);

  // Refetch data when modal opens to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);

  const config = data?.data;

  return (
    <Box className="w-full max-h-[90vh] overflow-y-auto">
      <Flex className="items-center justify-between mb-6">
        <Flex className="items-center gap-3">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">PayPal Configuration</h2>
        </Flex>
      </Flex>

      {isLoading ? (
        <Flex className="items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">
            Loading PayPal configuration...
          </span>
        </Flex>
      ) : config ? (
        <Stack className="gap-6">
          {/* Configuration Status */}
          <Box className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <Flex className="items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configuration Status</h3>
              {config.configured ? (
                <Flex className="items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Configured</span>
                </Flex>
              ) : (
                <Flex className="items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Not Configured</span>
                </Flex>
              )}
            </Flex>

            {/* Mode */}
            <Flex className="items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Mode:</span>
              <Flex className="items-center gap-2">
                {config.isLive ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Live
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Sandbox
                  </span>
                )}
              </Flex>
            </Flex>

            {/* Client ID */}
            <Flex className="items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Client ID:</span>
              <span className="text-sm font-mono text-gray-800">
                {config.clientId}
              </span>
            </Flex>

            {/* Connection Status */}
            <Flex className="items-center justify-between">
              <span className="text-sm text-gray-600">Connection:</span>
              {config.isConnected ? (
                <Flex className="items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Connected</span>
                </Flex>
              ) : (
                <Flex className="items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Not Connected</span>
                </Flex>
              )}
            </Flex>

            {/* Error Message */}
            {config.error && (
              <Box className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <Flex className="items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-700">{config.error}</span>
                </Flex>
              </Box>
            )}
          </Box>

          {/* Account Information */}
          {config.accountInfo ? (
            config.accountInfo.email &&
            config.accountInfo.email !== "Not available" &&
            !config.accountInfo.email.startsWith("http") ? (
              <Box className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                <h3 className="text-lg font-semibold mb-4">
                  Account Information
                </h3>
                <Stack className="gap-3">
                  <Flex className="items-center justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="text-sm font-medium text-gray-800 break-all">
                      {config.accountInfo.email}
                    </p>
                  </Flex>
                  {config.accountInfo.name &&
                    config.accountInfo.name !== "Not available" && (
                      <Flex className="items-center justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium text-gray-800">
                          {config.accountInfo.name}
                        </span>
                      </Flex>
                    )}
                  <Flex className="items-center justify-between">
                    <span className="text-sm text-gray-600">Verified:</span>
                    {config.accountInfo.verified ? (
                      <Flex className="items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Yes</span>
                      </Flex>
                    ) : (
                      <Flex className="items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">No</span>
                      </Flex>
                    )}
                  </Flex>
                </Stack>
              </Box>
            ) : (
              <Box className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
                <Flex className="items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <Box>
                    <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                      Account Information Not Available
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Account email and name cannot be retrieved using client
                      credentials. To see which PayPal account is receiving
                      payments:
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                      <li>
                        Check your PayPal Dashboard (
                        {config.isLive ? (
                          <a
                            href="https://www.paypal.com/myaccount/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Live Account
                          </a>
                        ) : (
                          <a
                            href="https://www.sandbox.paypal.com/myaccount/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Sandbox Account
                          </a>
                        )}
                        )
                      </li>
                      <li>
                        Check payment logs in your backend - merchant email is
                        logged when payments are captured
                      </li>
                      <li>
                        The account receiving payments is the one associated
                        with your PayPal Client ID
                      </li>
                    </ul>
                  </Box>
                </Flex>
              </Box>
            )
          ) : (
            <Box className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <Flex className="items-start gap-3">
                <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <Box>
                  <h3 className="text-lg font-semibold mb-2">
                    Account Information Not Available
                  </h3>
                  <p className="text-sm text-gray-700">
                    Account information cannot be retrieved. Check your PayPal
                    Dashboard to see which account is configured.
                  </p>
                </Box>
              </Flex>
            </Box>
          )}

          {/* Important Note */}
          {config.isSandbox && (
            <Box className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <Flex className="items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <Box>
                  <h4 className="font-semibold text-red-800 mb-1">
                    ⚠️ Sandbox Mode Active
                  </h4>
                  <p className="text-sm text-red-700">
                    Your PayPal is currently in sandbox mode. No real payments
                    will be processed. To receive real payments, switch to live
                    mode by updating your credentials with a LIVE PayPal Client
                    ID and setting{" "}
                    <code className="bg-red-100 px-1 rounded">
                      PAYPAL_MODE=live
                    </code>{" "}
                    in your backend .env file.
                  </p>
                </Box>
              </Flex>
            </Box>
          )}

          {/* Action Buttons */}
          <Flex className="justify-end gap-3 pt-4">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              onClick={onClose}
              className="cursor-pointer bg-[#1797b9] hover:bg-[#1797b9]/80"
            >
              Close
            </Button>
          </Flex>
        </Stack>
      ) : (
        <Box className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load PayPal configuration</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Retry
          </Button>
        </Box>
      )}
    </Box>
  );
};
