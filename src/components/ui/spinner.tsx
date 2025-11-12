import { type ComponentPropsWithoutRef, type FC } from "react";
import { LucideProps, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SpinnerProps = ComponentPropsWithoutRef<"div">;

const Spinner: FC<LucideProps> = ({ className, ...props }) => {
  return <LoaderCircle className={cn("animate-spin", className)} {...props} />;
};

export { Spinner };
