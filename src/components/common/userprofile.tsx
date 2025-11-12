import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Flex, type FlexProps } from "../ui/flex";
import { Stack } from "../ui/stack";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface UserProfileProps extends FlexProps {
  hideMetaInSmallScreens?: boolean;
  descriptionClassName?: string;
  avatarClassName?: string;
  labelClassName?: string;
  description?: string;
  label?: string;
  src?: string;
}

export const UserProfile = forwardRef<HTMLSpanElement, UserProfileProps>(
  (
    {
      hideMetaInSmallScreens = true,
      descriptionClassName,
      avatarClassName,
      labelClassName,
      description,
      label,
      src,
      ...props
    },
    ref
  ) => {
    return (
      <Flex {...props}>
        <Avatar ref={ref} className={avatarClassName}>
          <AvatarImage src={src} alt={src} />
          <AvatarFallback>US</AvatarFallback>
        </Avatar>

        <Stack
          className={cn(
            "gap-0",
            hideMetaInSmallScreens && "max-[950px]:hidden"
          )}
        >
          <p className={cn("font-medium capitalize", labelClassName)}>
            {label}
          </p>
          <p className={cn("text-sm", descriptionClassName)}>{description}</p>
        </Stack>
      </Flex>
    );
  }
);
