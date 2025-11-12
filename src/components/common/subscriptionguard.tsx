import { ReactNode } from "react";
import { useSubscriptionGuard } from "@/hooks/usesubscription";
import { Loader2 } from "lucide-react";

interface SubscriptionGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

export const SubscriptionGuard = ({
  children,
  redirectTo = "/pricing", // Changed default to pricing page
  fallback,
}: SubscriptionGuardProps) => {
  const { isLoading, hasActiveSubscription, error } =
    useSubscriptionGuard(redirectTo);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Checking subscription status...</p>
          </div>
        </div>
      )
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error checking subscription</p>
          <p className="text-gray-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // If user has active subscription, render children
  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  // If no active subscription, show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Redirecting to pricing page...</p>
      </div>
    </div>
  );
};
