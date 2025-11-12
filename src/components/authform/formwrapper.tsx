import type { FC, PropsWithChildren } from "react";
import { Stack } from "../ui/stack";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

interface FormWrapperProps extends PropsWithChildren {
  description: string;
  logoSource: string;
  className?: string;
  label: string;
}

export const FormWrapper: FC<FormWrapperProps> = ({
  description,
  logoSource,
  className,
  children,
  label,
}) => {
  const navigate = useNavigate();
  // bg-slate-50 shadow-md rounded-3xl border-4 border-white
  return (
    <Stack
      className={cn(
        "px-5 py-10 max-md:px-3 w-[30rem] max-sm:w-full",
        className
      )}
    >
      <Stack className="items-start">
        <img
          onClick={() => navigate("/")}
          className="w-32 h-11 cursor-pointer"
          src={logoSource}
          alt="Company Logo"
        />
        <h1 className="text-2xl font-semibold text-start w-[28rem] max-sm:w-full">
          {label}
        </h1>
        <h2 className="text-gray-500 text-[0.90rem] leading-tight text-start max-w-[21rem]">
          {description}
        </h2>
      </Stack>
      {children}
    </Stack>
  );
};
