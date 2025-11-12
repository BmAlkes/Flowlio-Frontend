import { Flex } from "../ui/flex";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useMediaQuery } from "usehooks-ts";

interface AiAssistLogoProps {
  containerClassName?: string;
  isCompact?: boolean;
  className?: string;
}

export const AiAssistLogo: FC<AiAssistLogoProps> = ({
  containerClassName,
  isCompact = false,
  className,
}) => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  return (
    <Flex
      className={cn(
        !isCompact && "justify-",
        "overflow-hidden",
        containerClassName
      )}
    >
      {isSmallScreen ? (
        <img
          alt="logo"
          src="/logo/5000x5000-3.svg"
          className={cn("max-w-34", className)}
        />
      ) : (
        <img
          alt="logo"
          src="/logo/dotvizion.svg"
          className={cn("max-w-34", className)}
        />
      )}
    </Flex>
  );
};
