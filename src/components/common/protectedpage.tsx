import { ReactNode } from "react";
import { SubscriptionGuard } from "./subscriptionguard";

interface ProtectedPageProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * ProtectedPage component that wraps content with subscription validation
 * Use this to protect individual pages that require an active subscription
 */
export const ProtectedPage = ({
  children,
  redirectTo = "/pricing", // Changed default to pricing page
  fallback,
}: ProtectedPageProps) => {
  return (
    <SubscriptionGuard redirectTo={redirectTo} fallback={fallback}>
      {children}
    </SubscriptionGuard>
  );
};

/**
 * Example usage:
 *
 * import { ProtectedPage } from "@/components/common/protectedpage";
 *
 * const MyProtectedPage = () => {
 *   return (
 *     <ProtectedPage>
 *       <div>This content requires an active subscription</div>
 *     </ProtectedPage>
 *   );
 * };
 */
