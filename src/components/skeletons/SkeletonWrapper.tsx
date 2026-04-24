import { type ReactNode, useState, useEffect, memo } from "react";

interface SkeletonWrapperProps {
  /** Whether data is currently loading */
  isLoading: boolean;
  /** The skeleton placeholder to show while loading */
  skeleton: ReactNode;
  /** The actual content to show when loaded */
  children: ReactNode;
  /**
   * Delay in ms before showing skeleton (prevents flicker on fast responses).
   * Defaults to 250ms.
   */
  delay?: number;
}

/**
 * Global wrapper that handles the loading → content transition.
 *
 * - Shows nothing for `delay` ms (handles fast API responses — no flicker)
 * - Shows skeleton if still loading after delay
 * - Shows children instantly once isLoading becomes false
 */
export const SkeletonWrapper = memo(
  ({ isLoading, skeleton, children, delay = 250 }: SkeletonWrapperProps) => {
    const [showSkeleton, setShowSkeleton] = useState(false);

    useEffect(() => {
      if (!isLoading) {
        setShowSkeleton(false);
        return;
      }

      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);

      return () => clearTimeout(timer);
    }, [isLoading, delay]);

    if (isLoading) {
      return showSkeleton ? <>{skeleton}</> : null;
    }

    return <>{children}</>;
  }
);

SkeletonWrapper.displayName = "SkeletonWrapper";
