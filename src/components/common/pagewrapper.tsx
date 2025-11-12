import { Box, type BoxProps } from "../ui/box";
import { cn } from "@/lib/utils";
import type { FC } from "react";

export const PageWrapper: FC<BoxProps> = ({ className, children }) => {
  return (
    <Box
      className={cn(
        "bg-[#F8FAFB] border-[2px] rounded-xl border-white p-1 min-h-screen",
        className
      )}
    >
      {children}
    </Box>
  );
};
