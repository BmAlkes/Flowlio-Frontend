import { useSubscriptionStatus } from "@/hooks/usesubscription";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle, UserX } from "lucide-react";

export const SubscriptionStatus = () => {
  const { data, isLoading, error } = useSubscriptionStatus();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        Checking...
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Error
      </Badge>
    );
  }

  const status = data?.data?.status;
  //   const requiresSubscription = data?.data?.requiresSubscription;

  if (!data?.data) {
    return null;
  }

  switch (status) {
    case "active":
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-600"
        >
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
    case "no_organization":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          No Organization
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {status || "Unknown"}
        </Badge>
      );
  }
};

export const SubscriptionStatusWithAction = () => {
  const { data, isLoading } = useSubscriptionStatus();

  if (isLoading || !data?.data) {
    return null;
  }

  const { requiresSubscription, redirectTo } = data.data;

  if (requiresSubscription && redirectTo) {
    return (
      <div className="flex items-center gap-2">
        <SubscriptionStatus />
        <button
          onClick={() => (window.location.href = redirectTo)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Get Started
        </button>
      </div>
    );
  }

  return <SubscriptionStatus />;
};
