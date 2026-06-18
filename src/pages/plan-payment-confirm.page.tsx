import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useConfirmPlanPayment, ConfirmPlanPaymentResult } from "@/hooks/useOrganizationAdmin";
import { Loader2, CheckCircle2, XCircle, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";

type State = "loading" | "success" | "error" | "invalid";

export const PlanPaymentConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const confirmMutation = useConfirmPlanPayment();

  const [state, setState] = useState<State>("loading");
  const [result, setResult] = useState<ConfirmPlanPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    // PayPal returns the orderId as "token" query param on redirect
    const orderId = searchParams.get("token") ?? searchParams.get("orderId");
    const orgId = searchParams.get("orgId");
    const planId = searchParams.get("planId");

    if (!orderId || !orgId || !planId) {
      setState("invalid");
      return;
    }

    confirmMutation.mutateAsync({ orderId, orgId, planId })
      .then((data) => {
        setResult(data);
        setState("success");
      })
      .catch((err: any) => {
        setErrorMsg(err?.message ?? "Payment could not be confirmed.");
        setState("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Box className="w-full max-w-md">

        {/* Loading */}
        {state === "loading" && (
          <Stack className="items-center gap-6 text-center">
            <Flex className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </Flex>
            <Stack className="gap-2">
              <h1 className="text-xl font-semibold text-slate-800">Confirming your payment…</h1>
              <p className="text-sm text-slate-500">Please wait, this only takes a moment.</p>
            </Stack>
          </Stack>
        )}

        {/* Success */}
        {state === "success" && result && (
          <Box className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Top bar */}
            <Box className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />

            <Stack className="p-8 gap-6">
              <Stack className="items-center gap-3 text-center">
                <Flex className="w-16 h-16 rounded-full bg-green-100 items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-green-600" />
                </Flex>
                <h1 className="text-2xl font-bold text-slate-800">Payment confirmed!</h1>
                <p className="text-sm text-slate-500">
                  Your plan is now active. An invoice has been generated for your records.
                </p>
              </Stack>

              {/* Details card */}
              <Box className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-200">
                <Flex className="items-center gap-3 px-4 py-3">
                  <Receipt className="h-4 w-4 text-slate-400 shrink-0" />
                  <Box className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400">Invoice</p>
                    <p className="text-sm font-semibold text-slate-700 font-mono">{result.invoiceNumber}</p>
                  </Box>
                </Flex>
                <Flex className="items-center justify-between px-4 py-3">
                  <Box>
                    <p className="text-xs text-slate-400">Plan activated</p>
                    <p className="text-sm font-semibold text-slate-700">{result.planName}</p>
                  </Box>
                  <Box className="text-right">
                    <p className="text-xs text-slate-400">Amount paid</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {result.currency ?? "USD"} {Number(result.amount).toFixed(2)}
                    </p>
                  </Box>
                </Flex>
                <Flex className="px-4 py-3">
                  <Box>
                    <p className="text-xs text-slate-400">Organisation</p>
                    <p className="text-sm font-semibold text-slate-700">{result.orgName}</p>
                  </Box>
                </Flex>
              </Box>

              <Button
                className="w-full bg-[#1797B9] hover:bg-[#1797B9]/85 text-white gap-2"
                onClick={() => navigate("/auth/signin")}
              >
                Go to your dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-slate-400">
                A copy of your invoice is available in your client portal.
              </p>
            </Stack>
          </Box>
        )}

        {/* Error */}
        {state === "error" && (
          <Box className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <Box className="h-2 bg-gradient-to-r from-red-400 to-rose-500" />
            <Stack className="p-8 gap-6 items-center text-center">
              <Flex className="w-16 h-16 rounded-full bg-red-100 items-center justify-center">
                <XCircle className="h-9 w-9 text-red-500" />
              </Flex>
              <Stack className="gap-2">
                <h1 className="text-xl font-semibold text-slate-800">Payment could not be confirmed</h1>
                <p className="text-sm text-slate-500">{errorMsg}</p>
              </Stack>
              <Box className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 w-full text-left">
                <p className="text-xs text-slate-500">
                  If you completed the payment on PayPal, please contact us at{" "}
                  <a href="mailto:info@dotvizion.com" className="text-[#1797B9] font-medium underline">
                    info@dotvizion.com
                  </a>{" "}
                  with your PayPal transaction ID and we will activate your plan manually.
                </p>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Invalid params */}
        {state === "invalid" && (
          <Stack className="items-center gap-4 text-center">
            <Flex className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center">
              <XCircle className="h-8 w-8 text-slate-400" />
            </Flex>
            <Stack className="gap-1">
              <h1 className="text-xl font-semibold text-slate-700">Invalid confirmation link</h1>
              <p className="text-sm text-slate-400">
                This link is missing required parameters. Please use the original link sent to you.
              </p>
            </Stack>
            <a href="mailto:info@dotvizion.com">
              <Button variant="outline">Contact support</Button>
            </a>
          </Stack>
        )}

      </Box>
    </div>
  );
};

export default PlanPaymentConfirmPage;
