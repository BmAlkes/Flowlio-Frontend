import { Suspense, lazy, ComponentType } from "react";
import { Center } from "../ui/center";
import { Box } from "../ui/box";

interface LazyWrapperProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <Center className="min-h-[200px] w-full">
    <Box className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></Box>
  </Center>
);

export const LazyWrapper = ({
  component: Component,
  fallback,
}: LazyWrapperProps) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component />
    </Suspense>
  );
};

// Utility function to create lazy components with consistent naming
export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>
) => {
  return lazy(importFn);
};
