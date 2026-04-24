import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Base Skeleton primitive with smooth shimmer animation.
 * Uses a custom keyframe gradient sweep for a more polished feel
 * than plain animate-pulse.
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({
  className,
  width,
  height,
  style,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md", className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
};
