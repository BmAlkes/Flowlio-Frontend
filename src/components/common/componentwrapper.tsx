import { Box, type BoxProps } from "../ui/box";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const ComponentWrapper = forwardRef<HTMLDivElement, BoxProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn(
          "bg-[#f8fafb] border-2 border-white rounded-xl shadow-component",
          className
        )}
        {...props}
      >
        {children}
      </Box>
    );
  }
);
