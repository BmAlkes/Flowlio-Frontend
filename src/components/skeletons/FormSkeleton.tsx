import { memo } from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface FormSkeletonProps {
  /** Number of label+input field pairs (default: 6) */
  fields?: number;
  /** Show a submit button skeleton at the bottom */
  withSubmit?: boolean;
  /** Use a 2-column grid layout for fields */
  twoColumn?: boolean;
  /** Extra className */
  className?: string;
}

/**
 * Mirrors the create-client / create-project form layouts:
 * - Optional 2-column grid
 * - label above input pairs with consistent spacing
 * - Submit button at the end
 */
export const FormSkeleton = memo(
  ({
    fields = 6,
    withSubmit = true,
    twoColumn = false,
    className,
  }: FormSkeletonProps) => {
    return (
      <div className={cn("w-full space-y-6", className)}>
        {/* Page header area */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Fields grid */}
        <div
          className={cn(
            "gap-6",
            twoColumn
              ? "grid grid-cols-1 sm:grid-cols-2"
              : "flex flex-col"
          )}
        >
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              {/* Label */}
              <Skeleton className="h-4 w-28" />
              {/* Input */}
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Submit btn */}
        {withSubmit && (
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        )}
      </div>
    );
  }
);

FormSkeleton.displayName = "FormSkeleton";
