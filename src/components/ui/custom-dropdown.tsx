import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Box } from "./box";
import { Flex } from "./flex";
import { Center } from "./center";

interface CustomDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  trigger,
  children,
  align = "end",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getAlignmentClasses = () => {
    switch (align) {
      case "start":
        return "left-0";
      case "center":
        return "left-1/2 transform -translate-x-1/2";
      case "end":
      default:
        return "right-0";
    }
  };

  return (
    <Box className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <Box onClick={() => setIsOpen(!isOpen)}>{trigger}</Box>

      {/* Dropdown Content */}
      {isOpen && (
        <Box
          className={cn(
            "absolute top-full mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]",
            getAlignmentClasses(),
            className
          )}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

interface CustomDropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  checked?: boolean;
}

export const CustomDropdownItem: React.FC<CustomDropdownItemProps> = ({
  children,
  onClick,
  className,
  checked = false,
}) => {
  return (
    <Flex
      className={cn(
        "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
        checked && "bg-blue-50 text-blue-700",
        className
      )}
      onClick={onClick}
    >
      {checked && (
        <Center className="w-4 h-4 border-2 border-blue-500 bg-blue-500 rounded-full">
          <Box className="w-2 h-2 bg-white rounded-sm"></Box>
        </Center>
      )}
      {!checked && (
        <Box className="w-4 h-4 border-2 border-gray-300 rounded-full"></Box>
      )}
      {children}
    </Flex>
  );
};
