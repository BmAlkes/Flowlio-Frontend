import { memo } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Standard error state component shown after a failed API call.
 * Accepts an optional retry callback.
 */
export const ErrorState = memo(
  ({
    title = "Something went wrong",
    message = "Failed to load data. Please try again.",
    onRetry,
    className,
  }: ErrorStateProps) => {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-6 text-center",
          className
        )}
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Try again
          </button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";
