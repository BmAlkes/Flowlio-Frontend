import { forwardRef, type ComponentPropsWithoutRef } from "react";

export type BoxProps = ComponentPropsWithoutRef<"div">;

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

export { Box };
