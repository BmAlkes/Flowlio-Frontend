import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type CenterProps = ComponentPropsWithoutRef<"div">;

const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex justify-center items-center", className)}
        {...props}
      />
    );
  }
);

export { Center };
