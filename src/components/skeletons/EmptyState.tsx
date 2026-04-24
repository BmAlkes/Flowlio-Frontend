import { memo } from "react";
import { cn } from "@/lib/utils";
import { InboxIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Standard empty state component — shown when a query succeeds but data
 * has zero items. Accepts a custom icon, title, description, and action slot.
 */
export const EmptyState = memo(
  ({
    icon,
    title = "No data found",
    description = "Nothing here yet. Add something to get started.",
    action,
    className,
  }: EmptyStateProps) => {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-6 text-center",
          className
        )}
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
          {icon ?? <InboxIcon className="w-7 h-7 text-muted-foreground" />}
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
