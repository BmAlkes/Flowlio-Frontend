import { Link, type LinkProps } from "react-router";
import { motion } from "framer-motion";
import { Flex } from "../ui/flex";
import { cn } from "@/lib/utils";

interface LogoProps {
  containerClassName?: string;
  isCompact?: boolean;
  to: LinkProps["to"];
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  containerClassName,
  isCompact = false,
  className,
  to,
}) => {
  return (
    <Link to={to}>
      <Flex
        className={cn(
          !isCompact && "justify-center",
          "overflow-hidden",
          containerClassName
        )}
      >
        <motion.img
          src="/logo/logo.png"
          animate={{ rotate: isCompact ? 0 : 360 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={cn("w-6", isCompact && "m-aut", className)}
        />
        <motion.img
          src="/logo/logotext.png"
          className={cn("max-w-28 h-12 -ml-3", className)}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          animate={{
            display: isCompact ? "none" : "block",
            opacity: isCompact ? 0 : 1,
          }}
        />
      </Flex>
    </Link>
  );
};
