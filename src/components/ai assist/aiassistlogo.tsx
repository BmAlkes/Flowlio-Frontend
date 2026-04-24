import { Flex } from "../ui/flex";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useMediaQuery } from "usehooks-ts";
import logoSmall from "/logo/5000x5000-3.svg";
import logoLarge from "/logo/dotvizion.svg";

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
          src={logoSmall}
          className={cn("max-w-34", className)}
        />
      ) : (
        <img
          alt="logo"
          src={logoLarge}
          className={cn("max-w-34", className)}
        />
      )}
    </Flex>
  );
};
