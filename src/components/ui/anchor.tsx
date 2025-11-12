import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export interface AnchorProps extends ComponentPropsWithoutRef<"a"> {
  to: string;
}

const Anchor = forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ className, to, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        to={to}
        className={cn(
          "text-blue-600 hover:text-blue-700 hover:underline cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

export { Anchor };
