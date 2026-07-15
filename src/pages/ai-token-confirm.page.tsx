import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmTokenPurchase } from "@/hooks/useAITokenTopup";

type State = "loading" | "success" | "error" | "missing";

const AITokenConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const confirm = useConfirmTokenPurchase();
  const [state, setState] = useState<State>("loading");
  const [result, setResult] = useState<{ tokensAdded: number; newTokenLimit: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // PayPal returns ?token=<orderId> after approval
    const orderId = searchParams.get("token") ?? searchParams.get("orderId");
    const packageId = sessionStorage.getItem("ai_topup_packageId");

    if (!orderId || !packageId) {
      setState("missing");
      return;
    }

    confirm.mutate(
      { orderId, packageId },
      {
        onSuccess: (data) => {
          sessionStorage.removeItem("ai_topup_packageId");
          sessionStorage.removeItem("ai_topup_label");
          setResult(data);
          setState("success");
        },
        onError: (err: any) => {
          setErrorMsg(err?.response?.data?.message || "Payment could not be confirmed");
          setState("error");
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">

        {state === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Confirming your purchase…</h1>
              <p className="text-muted-foreground mt-1 text-sm">Please wait while we verify your PayPal payment.</p>
            </div>
          </>
        )}

        {state === "success" && result && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment confirmed!</h1>
              <p className="text-muted-foreground mt-1 text-sm">Your tokens have been added to your account.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-start space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-semibold text-foreground">Tokens added</span>
              </div>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                +{result.tokensAdded.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                New monthly limit: <span className="font-semibold text-foreground">{result.newTokenLimit.toLocaleString()} tokens</span>
              </p>
            </div>
            <Button className="w-full rounded-xl h-11" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Purchase failed</h1>
              <p className="text-muted-foreground mt-1 text-sm">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/dashboard/subscription")}>
                Back to Subscription
              </Button>
              <Button className="flex-1 rounded-xl" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </>
        )}

        {state === "missing" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invalid confirmation link</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Missing order ID or package info. If you completed a payment, contact support.
              </p>
            </div>
            <Button className="w-full rounded-xl" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </>
        )}

      </div>
    </div>
  );
};

export default AITokenConfirmPage;
