import { useState } from "react";
import { Loader2, Sparkles, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTokenPackages, usePurchaseTokens, TokenPackage } from "@/hooks/useAITokenTopup";

const PACKAGE_META: Record<string, { icon: typeof Zap; popular?: boolean; description: string; color: string }> = {
  tokens_50k: {
    icon: Zap,
    description: "Great for small teams and light usage",
    color: "text-blue-600 dark:text-blue-400",
  },
  tokens_100k: {
    icon: Star,
    popular: true,
    description: "Best value for growing organizations",
    color: "text-indigo-600 dark:text-indigo-400",
  },
  tokens_250k: {
    icon: Sparkles,
    description: "For high-volume AI-powered workflows",
    color: "text-violet-600 dark:text-violet-400",
  },
};

function PackageCard({ pkg, onBuy, loading }: { pkg: TokenPackage; onBuy: (pkg: TokenPackage) => void; loading: boolean }) {
  const meta = PACKAGE_META[pkg.id] ?? { icon: Zap, description: "", color: "text-blue-600" };
  const Icon = meta.icon;

  return (
    <div className={`relative flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 hover:shadow-md ${
      meta.popular
        ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm"
        : "border-border bg-card"
    }`}>
      {meta.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-indigo-600 text-white text-xs px-3">Most Popular</Badge>
        </div>
      )}

      <div className={`w-fit p-2.5 rounded-xl ${meta.popular ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-muted"}`}>
        <Icon className={`h-5 w-5 ${meta.color}`} />
      </div>

      <div>
        <p className="text-2xl font-black text-foreground">
          {(pkg.tokens / 1000).toFixed(0)}k
          <span className="text-base font-medium text-muted-foreground ml-1">tokens</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{meta.description}</p>
      </div>

      <div className="mt-auto">
        <p className="text-3xl font-bold text-foreground">
          ${pkg.price}
          <span className="text-sm font-normal text-muted-foreground ml-1">{pkg.currency}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          ${(Number(pkg.price) / (pkg.tokens / 1000)).toFixed(3)} per 1k tokens
        </p>
      </div>

      <Button
        className={`w-full rounded-xl h-10 font-semibold ${
          meta.popular
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : ""
        }`}
        variant={meta.popular ? "default" : "outline"}
        onClick={() => onBuy(pkg)}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy with PayPal"}
      </Button>
    </div>
  );
}

export function TokenTopupSection() {
  const { data: packages = [], isLoading } = useTokenPackages();
  const purchase = usePurchaseTokens();
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleBuy = async (pkg: TokenPackage) => {
    setBuyingId(pkg.id);
    try {
      const result = await purchase.mutateAsync({ packageId: pkg.id });
      // Store packageId so the confirm page can use it after PayPal redirects back
      sessionStorage.setItem("ai_topup_packageId", pkg.id);
      sessionStorage.setItem("ai_topup_label", pkg.label);
      toast.info("Redirecting to PayPal...");
      window.location.href = result.approvalUrl;
    } catch {
      // error handled in hook
    } finally {
      setBuyingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground">Buy More AI Tokens</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tokens are added to your monthly limit instantly after payment. Reset on the 1st of each month.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onBuy={handleBuy}
            loading={buyingId === pkg.id}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-1">
        Secure payment via PayPal. Tokens are non-refundable after purchase.
      </p>
    </div>
  );
}
