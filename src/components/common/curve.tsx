import { forwardRef, type ComponentPropsWithoutRef } from "react";

export const Curve = forwardRef<
  HTMLImageElement,
  ComponentPropsWithoutRef<"img">
>(({ ...props }, ref) => {
  return (
    <img ref={ref} src="/general/curved-border 1.svg" alt="curve" {...props} />
  );
});
