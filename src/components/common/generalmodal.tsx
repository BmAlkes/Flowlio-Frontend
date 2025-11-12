import { Dialog, DialogContent } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface GeneralModalProp extends DialogPrimitive.DialogProps {
  contentProps?: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
  withoutCloseButton?: boolean;
}

export type GeneralModalReturnTypeProps = ReturnType<
  typeof useGeneralModalDisclosure
>;

export const useGeneralModalDisclosure = (initialState?: GeneralModalProp) => {
  const [state, setState] = useState<GeneralModalProp | undefined>(
    initialState
  );

  return {
    ...state,
    onOpenChange: (open: boolean) => setState((prev) => ({ ...prev, open })),
    setContentProps: (contentProps: GeneralModalProp["contentProps"]) =>
      setState((prev) => ({
        ...prev,
        contentProps: { ...prev?.contentProps, ...contentProps },
      })),
  };
};

export const GeneralModal: React.FC<GeneralModalProp> = ({
  withoutCloseButton,
  contentProps,
  ...props
}) => {
  return (
    <Dialog {...props}>
      <DialogContent
        withoutCloseButton={withoutCloseButton}
        className={cn(contentProps?.className)}
        {...contentProps}
      >
        {props.children}
      </DialogContent>
    </Dialog>
  );
};
